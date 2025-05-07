// server/controllers/bookController.js
const axios = require('axios');
const { GOOGLE_BOOKS_API_CONFIG } = require('../config/api');
const Book = require('../models/Book');
const NodeCache = require('node-cache');
const booksCache = new NodeCache({ stdTTL: 600 }); // 10 minutes TTL

// Configure axios instance with timeout and retry logic
const openLibraryAxios = axios.create({
  timeout: 5000, // 5 second timeout
  maxContentLength: 50 * 1024 * 1024, // 50MB max response size
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept all responses except 500s
  }
});

// Add retry interceptor
openLibraryAxios.interceptors.response.use(null, async (error) => {
  const config = error.config;
  
  // If no config or no retry count, initialize retry count
  if (!config || !config.__retryCount) {
    config.__retryCount = 0;
  }

  // Maximum number of retries
  const maxRetries = 2;
  
  // Check if we should retry the request
  if (config.__retryCount < maxRetries) {
    config.__retryCount += 1;
    
    // Exponential backoff delay
    const delay = Math.pow(2, config.__retryCount) * 1000;
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry the request
    return openLibraryAxios(config);
  }
  
  return Promise.reject(error);
});

// Helper function to make API requests with error handling
const makeOpenLibraryRequest = async (url, params = {}) => {
  try {
    const response = await openLibraryAxios.get(url, { params });
    
    if (response.status === 404) {
      throw new Error('Book not found');
    }
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    if (response.status >= 400) {
      throw new Error(`Open Library API error: ${response.statusText}`);
    }
    
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    
    if (error.code === 'ENOTFOUND') {
      throw new Error('Could not connect to Open Library API. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Helper function to format book data
const formatBookData = (item) => {
  if (!item || !item.volumeInfo) {
    return null;
  }

  const { volumeInfo, saleInfo } = item;
  const imageLinks = volumeInfo.imageLinks || {};
  const price = saleInfo?.listPrice?.amount || saleInfo?.retailPrice?.amount || 9.99;

  return {
    _id: item.id,
    title: volumeInfo.title || 'Untitled',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
    price,
    imageUrl: imageLinks.thumbnail 
      ? imageLinks.thumbnail.replace('http:', 'https:')
      : 'https://via.placeholder.com/128x196',
    description: volumeInfo.description || 'No description available',
    isbn: volumeInfo.industryIdentifiers && volumeInfo.industryIdentifiers.length > 0
      ? volumeInfo.industryIdentifiers[0].identifier 
      : 'N/A',
    publisher: volumeInfo.publisher || 'Unknown Publisher',
    publishedDate: volumeInfo.publishedDate || 'N/A',
    pages: volumeInfo.pageCount || 0,
    categories: volumeInfo.categories || ['Fiction'],
    rating: volumeInfo.averageRating || 0,
    language: volumeInfo.language || 'en'
  };
};

// Helper function to make API requests
const makeGoogleBooksRequest = async (endpoint, params = {}) => {
  try {
    const url = `${GOOGLE_BOOKS_API_CONFIG.BASE_URL}${endpoint}`;
    const response = await axios.get(url, {
      params: {
        ...GOOGLE_BOOKS_API_CONFIG.DEFAULT_PARAMS,
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error('Google Books API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch books from Google Books API');
  }
};

// Helper function to build filter query
const buildFilterQuery = (filters) => {
  const query = {};

  // Category filter
  if (filters.category) {
    query.category = filters.category;
  }

  // Price range filter
  if (filters.priceRange) {
    const [min, max] = filters.priceRange.split('-');
    query.price = {};
    if (min) query.price.$gte = parseFloat(min);
    if (max) query.price.$lte = parseFloat(max);
  }

  // Availability filter
  if (filters.availability) {
    query.inStock = filters.availability === 'in-stock';
  }

  return query;
};

// Helper function to build sort options
const buildSortOptions = (sortBy) => {
  switch (sortBy) {
    case 'price-asc':
      return { price: 1 };
    case 'price-desc':
      return { price: -1 };
    case 'title-asc':
      return { title: 1 };
    case 'title-desc':
      return { title: -1 };
    case 'newest':
      return { createdAt: -1 };
    default:
      return { createdAt: -1 }; // Default sort by newest
  }
};

function getRandomPrice() {
  // Random price between $5 and $50
  return parseFloat((Math.random() * 45 + 5).toFixed(2));
}

function getRandomStock() {
  // Random stock between 0 and 20
  return Math.floor(Math.random() * 21);
}

const formatOpenLibraryBook = (doc) => {
  let key = doc.key || '';
  if (key && !key.startsWith('/works/') && !key.startsWith('/books/')) {
    if (doc.type && doc.type.key === '/type/work') key = `/works/${doc.cover_edition_key || doc.key}`;
    else if (doc.type && doc.type.key === '/type/edition') key = `/books/${doc.key}`;
  }
  return {
    _id: key,
    title: doc.title || 'Untitled',
    author: doc.author_name ? doc.author_name.join(', ') : 'Unknown Author',
    price: getRandomPrice(),
    inStock: getRandomStock(),
    imageUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : 'https://via.placeholder.com/128x196',
    description: doc.first_sentence ? (typeof doc.first_sentence === 'string' ? doc.first_sentence : doc.first_sentence[0]) : 'No description available',
    isbn: doc.isbn ? doc.isbn[0] : 'N/A',
    publisher: doc.publisher ? doc.publisher[0] : 'Unknown Publisher',
    publishedDate: doc.first_publish_year || 'N/A',
    pages: doc.number_of_pages_median || 0,
    categories: doc.subject ? doc.subject.slice(0, 3) : [],
    rating: null,
    language: doc.language ? doc.language[0] : 'en'
  };
};

// Get all books
exports.getBooks = async (req, res) => {
  try {
    const {
      query = '',
      category,
      sortBy = '',
      startIndex = 0,
      maxResults = 10
    } = req.query;

    // Create a cache key based on all relevant params
    const cacheKey = JSON.stringify({ query, category, sortBy, startIndex, maxResults });
    const cached = booksCache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached.books,
        pagination: cached.pagination
      });
    }

    let url = 'https://openlibrary.org/search.json';
    let params = {
      q: query || 'book',
      offset: Number(startIndex),
      limit: Number(maxResults)
    };

    if (category) {
      url = `https://openlibrary.org/subjects/${encodeURIComponent(category)}.json`;
      params = {
        offset: Number(startIndex),
        limit: Number(maxResults)
      };
    }

    const response = await makeOpenLibraryRequest(url, params);
    let docs = category ? response.works : response.docs;

    if (!docs || !Array.isArray(docs) || docs.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          startIndex: Number(startIndex),
          maxResults: Number(maxResults),
          hasMore: false
        }
      });
    }

    let books = docs.map(formatOpenLibraryBook);

    if (sortBy === 'title-asc') books.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'title-desc') books.sort((a, b) => b.title.localeCompare(a.title));
    if (sortBy === 'newest') books.sort((a, b) => {
      const ay = a.publishedDate === 'N/A' ? 0 : parseInt(a.publishedDate);
      const by = b.publishedDate === 'N/A' ? 0 : parseInt(b.publishedDate);
      return by - ay;
    });
    if (sortBy === 'oldest') books.sort((a, b) => {
      const ay = a.publishedDate === 'N/A' ? 0 : parseInt(a.publishedDate);
      const by = b.publishedDate === 'N/A' ? 0 : parseInt(b.publishedDate);
      return ay - by;
    });

    const pagination = {
      total: category ? response.work_count : response.numFound,
      startIndex: Number(startIndex),
      maxResults: Number(maxResults),
      hasMore: (category ? response.work_count : response.numFound) > Number(startIndex) + Number(maxResults)
    };

    // Cache the result
    booksCache.set(cacheKey, { books, pagination });

    res.json({
      success: true,
      data: books,
      pagination
    });
  } catch (error) {
    console.error('Error in getBooks (Open Library):', error);

    // Return empty array if Open Library times out or errors
    res.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        startIndex: 0,
        maxResults: 0,
        hasMore: false
      }
    });
  }
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
  try {
    let key = req.params.id;
    if (!key.startsWith('works/') && !key.startsWith('books/')) {
      key = `works/${key}`;
    }
    if (!key.startsWith('/')) key = '/' + key;
    
    let url = `https://openlibrary.org${key}.json`;
    console.log('Fetching details for key:', key, 'URL:', url);
    
    let doc;
    try {
      doc = await makeOpenLibraryRequest(url);
    } catch (err) {
      if (key.startsWith('/works/')) {
        const bookKey = '/books/' + req.params.id.replace(/^works\//, '').replace(/^books\//, '');
        url = `https://openlibrary.org${bookKey}.json`;
        console.log('Fallback to books endpoint:', url);
        doc = await makeOpenLibraryRequest(url);
      } else {
        throw err;
      }
    }

    let author = 'Unknown Author';
    if (doc.authors && Array.isArray(doc.authors) && doc.authors.length > 0) {
      try {
        const authorUrl = `https://openlibrary.org${doc.authors[0].author ? doc.authors[0].author.key : doc.authors[0].key}.json`;
        const authorResp = await makeOpenLibraryRequest(authorUrl);
        author = authorResp.name || author;
      } catch (e) {
        console.warn('Failed to fetch author details:', e.message);
      }
    }

    const book = {
      _id: key,
      title: doc.title || 'Untitled',
      author,
      price: getRandomPrice(),
      inStock: getRandomStock(),
      imageUrl: doc.covers && doc.covers.length > 0
        ? `https://covers.openlibrary.org/b/id/${doc.covers[0]}-L.jpg`
        : 'https://via.placeholder.com/128x196',
      description: doc.description
        ? (typeof doc.description === 'string' ? doc.description : doc.description.value)
        : 'No description available',
      isbn: doc.isbn ? doc.isbn[0] : 'N/A',
      publisher: doc.publishers && doc.publishers.length > 0 ? doc.publishers[0] : 'Unknown Publisher',
      publishedDate: doc.first_publish_date || doc.publish_date || 'N/A',
      pages: doc.number_of_pages || 0,
      categories: doc.subjects ? doc.subjects.slice(0, 3) : [],
      rating: null,
      language: doc.languages && doc.languages.length > 0 && doc.languages[0].key ? doc.languages[0].key.replace('/languages/', '') : 'en'
    };

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error in getBookById (Open Library):', error);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes('not found')) statusCode = 404;
    if (error.message.includes('timed out')) statusCode = 504;
    if (error.message.includes('Rate limit')) statusCode = 429;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch book details from Open Library',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Search books
exports.searchBooks = async (req, res) => {
  try {
    const { query, startIndex = 0, maxResults = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const data = await makeGoogleBooksRequest('', {
      q: query,
      startIndex: Number(startIndex),
      maxResults: Number(maxResults)
    });

    if (!data.items) {
      return res.json([]);
    }

    const books = data.items
      .map(formatBookData)
      .filter(book => book !== null);

    res.json(books);
  } catch (error) {
    console.error('Error in searchBooks:', error);
    res.status(500).json({ 
      message: 'Failed to search books. Please try again later.',
      error: error.message 
    });
  }
};

// Add more book-related controller methods as needed

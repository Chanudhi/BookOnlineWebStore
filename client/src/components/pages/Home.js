import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../../services/api';
import { useCart } from '../../context/CartContext';
import SearchBar from '../books/SearchBar';

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { addToCart, loading: cartLoading } = useCart();
  const [searchParams, setSearchParams] = useState({
    query: '',
    filters: {},
    sortBy: ''
  });
  const BOOKS_PER_PAGE = 20;

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const startIndex = (page - 1) * BOOKS_PER_PAGE;
      
      const params = {
        startIndex,
        maxResults: BOOKS_PER_PAGE,
        query: searchParams.query,
        sortBy: searchParams.sortBy,
        ...searchParams.filters
      };

      const response = await getBooks(params);

      let fetchedBooks = response.books;
      // Client-side sort for 'oldest' (if not handled by backend)
      if (searchParams.sortBy === 'oldest') {
        fetchedBooks = [...fetchedBooks].sort((a, b) => {
          // Use publish year or fallback
          const ay = a.publishedDate === 'N/A' ? 0 : parseInt(a.publishedDate);
          const by = b.publishedDate === 'N/A' ? 0 : parseInt(b.publishedDate);
          return ay - by;
        });
      }

      if (page === 1) {
        setBooks(fetchedBooks);
      } else {
        setBooks(prevBooks => [...prevBooks, ...fetchedBooks]);
      }
      
      setHasMore(response.pagination.hasMore);
    } catch (err) {
      console.error('Error in fetchBooks:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch books. Please try again later.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, searchParams]);

  useEffect(() => {
    setPage(1); // Reset page when search parameters change
    fetchBooks();
  }, [fetchBooks, searchParams]);

  const handleSearch = (query) => {
    setSearchParams(prev => ({
      ...prev,
      query
    }));
  };

  const handleFilterChange = (filters) => {
    setSearchParams(prev => ({
      ...prev,
      filters
    }));
  };

  const handleSortChange = (sortBy) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy
    }));
  };

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleAddToCart = async (book) => {
    try {
      await addToCart(book);
    } catch (err) {
      console.error('Failed to add book to cart:', err);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button 
            onClick={() => { 
              setPage(1);
              fetchBooks();
            }} 
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <h1>Welcome to BookStore</h1>
      
      <SearchBar 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />

      <div className="book-grid">
        {books.length === 0 && !loading ? (
          <div className="no-books-message">
            <h2>No Books Found</h2>
            <p>We couldn't find any books matching your criteria. Please try different search terms or filters.</p>
            <button 
              onClick={() => {
                setPage(1);
                setSearchParams({
                  query: '',
                  filters: {},
                  sortBy: ''
                });
              }}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          books.map(book => (
            <div key={book._id} className="book-card">
              <img 
                src={book.imageUrl} 
                alt={book.title} 
                className="book-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200x300?text=Book+Cover+Not+Available';
                }}
              />
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="author">by {book.author}</p>
                <p className="price">{
                  book.price !== null && book.price !== undefined
                    ? `$${book.price.toFixed(2)}`
                    : 'N/A'
                }</p>
                <div className="book-actions">
                  <Link 
                    to={`/book${book._id}`} 
                    state={{ book }} 
                    className="btn btn-secondary"
                  >
                    Details
                  </Link>
                  <button 
                    onClick={() => handleAddToCart(book)}
                    className="btn btn-primary"
                    disabled={cartLoading}
                  >
                    {cartLoading ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading books...</p>
        </div>
      )}
      
      {!loading && hasMore && books.length > 0 && (
        <div className="load-more-container">
          <button 
            onClick={handleLoadMore} 
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Books'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getBookById, addToCart } from '../../services/api';

// Helper to generate random/fake data
const getRandomPrice = () => (Math.random() * 40 + 10).toFixed(2); // $10 - $50
const getRandomStock = () => Math.floor(Math.random() * 20) + 1; // 1 - 20
const getRandomDescription = () =>
  'This is a captivating book that will keep you engaged from start to finish. Highly recommended for all readers!';

function BookDetails() {
  const location = useLocation();
  const stateBook = location.state?.book;
  const { id, '*' : rest } = useParams();
  const fullId = rest ? `${id}/${rest}` : id;
  const [book, setBook] = useState(stateBook || null);
  const [loading, setLoading] = useState(!stateBook);
  const [error, setError] = useState(null);

  const fetchBookDetails = useCallback(async () => {
    if (stateBook) return; // Don't fetch if we already have the book
    try {
      setLoading(true);
      const response = await getBookById(fullId);
      setBook(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch book details. Please try again later.');
      setBook(null);
    } finally {
      setLoading(false);
    }
  }, [fullId, stateBook]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const handleAddToCart = async () => {
    try {
      await addToCart(book);
      // You might want to show a success message here
    } catch (err) {
      // Optionally show error
    }
  };

  // Fallback/fake data
  const fakeBook = {
    title: 'Unknown Book',
    author: 'Unknown Author',
    price: parseFloat(getRandomPrice()),
    imageUrl: 'https://via.placeholder.com/400x600?text=No+Image',
    isbn: 'N/A',
    publisher: 'Unknown Publisher',
    publishedDate: 'N/A',
    pages: Math.floor(Math.random() * 400) + 100, // 100-500
    inStock: getRandomStock(),
    categories: ['General'],
    language: 'en',
    description: getRandomDescription(),
  };

  const displayBook = book ? {
    ...fakeBook,
    ...book,
    price: book.price !== undefined && book.price !== null ? book.price : fakeBook.price,
    inStock: typeof book.inStock === 'number' ? book.inStock : fakeBook.inStock,
    description: book.description || fakeBook.description,
    pages: book.pages !== undefined && book.pages !== null ? book.pages : fakeBook.pages,
    categories: book.categories && book.categories.length > 0 ? book.categories : fakeBook.categories,
    imageUrl: book.imageUrl || fakeBook.imageUrl,
    language: book.language || fakeBook.language,
    publisher: book.publisher || fakeBook.publisher,
    publishedDate: book.publishedDate || fakeBook.publishedDate,
    isbn: book.isbn || fakeBook.isbn,
    title: book.title || fakeBook.title,
    author: book.author || fakeBook.author,
  } : fakeBook;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (error) {
    // Still show fake book details if error
    return (
      <div className="book-details-container">
        <div className="book-details">
          <div className="book-image">
            <img 
              src={fakeBook.imageUrl}
              alt={fakeBook.title}
            />
          </div>
          <div className="book-info">
            <h1>{fakeBook.title}</h1>
            <h2>by {fakeBook.author}</h2>
            <p className="price">${fakeBook.price.toFixed(2)}</p>
            <div className="actions">
              <button className="btn btn-primary" disabled>Add to Cart</button>
              <Link to="/" className="btn btn-secondary">Back to Books</Link>
            </div>
            <div className="book-metadata">
              <h3>Book Details</h3>
              <ul>
                <li><strong>ISBN:</strong> {fakeBook.isbn}</li>
                <li><strong>Publisher:</strong> {fakeBook.publisher}</li>
                <li><strong>Published Date:</strong> {fakeBook.publishedDate}</li>
                <li><strong>Pages:</strong> {fakeBook.pages}</li>
                <li><strong>Stock:</strong> {fakeBook.inStock}</li>
                <li><strong>Genre:</strong> {fakeBook.categories.join(', ')}</li>
                <li><strong>Language:</strong> {fakeBook.language}</li>
                <li><strong>Fun Fact:</strong> This book is a staff favorite and has been featured in our monthly picks!</li>
                <li><strong>Shipping:</strong> Free shipping on orders over $25!</li>
              </ul>
            </div>
            <div className="book-description">
              <h3>Description</h3>
              <p>{fakeBook.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-details-container">
      <div className="book-details-vertical">
        <div className="book-image">
          <img 
            src={displayBook.imageUrl}
            alt={displayBook.title}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x600?text=No+Image';
            }}
          />
        </div>
        <div className="book-info">
          <h1>{displayBook.title}</h1>
          <h2>by {displayBook.author}</h2>
          <p className="price">${displayBook.price.toFixed(2)}</p>
          <div className="actions">
            <button 
              onClick={handleAddToCart}
              className="btn btn-primary"
            >
              Add to Cart
            </button>
            <Link to="/" className="btn btn-secondary">
              Back to Books
            </Link>
          </div>
        </div>
      </div>
      <div className="book-metadata">
        <h3>Book Details</h3>
        <ul>
          <li><strong>ISBN:</strong> {displayBook.isbn}</li>
          <li><strong>Publisher:</strong> {displayBook.publisher}</li>
          <li><strong>Published Date:</strong> {displayBook.publishedDate}</li>
          <li><strong>Pages:</strong> {displayBook.pages}</li>
          <li><strong>Stock:</strong> {displayBook.inStock}</li>
          <li><strong>Genre:</strong> {displayBook.categories.join(', ')}</li>
          <li><strong>Language:</strong> {displayBook.language}</li>
          <li><strong>Fun Fact:</strong> This book is a staff favorite and has been featured in our monthly picks!</li>
          <li><strong>Shipping:</strong> Free shipping on orders over $25!</li>
        </ul>
      </div>
      <div className="book-description">
        <h3>Description</h3>
        <p>{displayBook.description}</p>
      </div>
    </div>
  );
}

export default BookDetails;
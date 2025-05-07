// server/config/api.js

const GOOGLE_BOOKS_API_CONFIG = {
  BASE_URL: 'https://www.googleapis.com/books/v1/volumes',
  DEFAULT_PARAMS: {
    printType: 'books',
    langRestrict: 'en',
    maxResults: 10,
    projection: 'lite' // Use lite projection to reduce response size
  }
};

module.exports = {
  GOOGLE_BOOKS_API_CONFIG
}; 
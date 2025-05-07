# Book Online Web Store

A full-stack web application for an online book store, built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication and authorization
- Admin dashboard
- Book catalog browsing
- Shopping cart functionality
- Secure payment processing
- User profile management
- Order tracking
- Responsive design

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Express Validator
- Helmet for security
- CORS enabled
- Morgan for logging

### Frontend
- React.js
- Modern UI components
- Responsive design
- State management
- API integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd BookOnlineWebStore
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
BookOnlineWebStore/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # React source files
├── server/                # Backend Node.js application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
└── package.json         # Root package.json
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - User login
- GET /api/auth/profile - Get user profile

### Books
- GET /api/books - Get all books
- GET /api/books/:id - Get book by ID
- POST /api/books - Create new book (Admin only)
- PUT /api/books/:id - Update book (Admin only)
- DELETE /api/books/:id - Delete book (Admin only)

### Orders
- POST /api/orders - Create new order
- GET /api/orders - Get user orders
- GET /api/orders/:id - Get order by ID

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes
- Input validation
- CORS configuration
- Helmet security headers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the repository or contact the development team. 
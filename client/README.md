# Book Store Frontend

A modern React-based frontend for an online bookstore, featuring Google Books API integration, shopping cart functionality, and a seamless checkout process.

## Features

- User Authentication (Login/Register)
- Book Search and Browsing
- Shopping Cart Management
- Secure Checkout Process
- Integration with Google Books API
- Responsive Material-UI Design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Books API Key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd client
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Google Books API key:
```
REACT_APP_GOOGLE_BOOKS_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Environment Variables

- `REACT_APP_GOOGLE_BOOKS_API_KEY`: Your Google Books API key
- `REACT_APP_API_URL`: Backend API URL (defaults to http://localhost:5000/api)

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.js
│   │   └── Register.js
│   ├── books/
│   │   └── BookDetails.js
│   ├── cart/
│   │   └── Cart.js
│   ├── checkout/
│   │   └── Checkout.js
│   ├── layout/
│   │   └── Navbar.js
│   ├── pages/
│   │   └── Home.js
│   └── routing/
│       └── PrivateRoute.js
├── services/
│   └── api.js
├── store/
│   ├── index.js
│   └── slices/
│       ├── authSlice.js
│       ├── bookSlice.js
│       └── cartSlice.js
├── App.js
├── index.js
└── theme.js
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm build`: Builds the app for production
- `npm eject`: Ejects from create-react-app

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
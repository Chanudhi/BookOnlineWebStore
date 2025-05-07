const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    if (!id) {
      throw new Error('User ID is required for token generation');
    }
    
    // Convert id to string if it's an ObjectId
    const userId = id.toString();
    
    const token = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { 
        expiresIn: '30d',
        algorithm: 'HS256'
      }
    );

    if (!token) {
      throw new Error('Failed to generate token');
    }

    return token;
  } catch (error) {
    console.error('Error generating token:', error.message);
    throw new Error('Failed to generate authentication token');
  }
};

module.exports = generateToken;
// This code defines a function `generateToken` that creates a JSON Web Token (JWT) using the `jsonwebtoken` library.
// The function takes a user ID as an argument and signs it with a secret key stored in the environment variable `JWT_SECRET`.
// The token is set to expire in 30 days. The generated token is then exported for use in other parts of the application.
// This is typically used for user authentication in web applications.
// The `generateToken` function creates a JWT that encodes the user ID and signs it with a secret key.


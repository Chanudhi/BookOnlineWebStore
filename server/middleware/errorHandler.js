// server/middleware/errorHandler.js

exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (err.response) {
    // Error from external API
    return res.status(err.response.status || 500).json({
      message: err.response.data?.message || 'Error from external service',
      error: process.env.NODE_ENV === 'development' ? err.response.data : undefined
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  };
  
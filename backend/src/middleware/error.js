// 404 handler for unknown routes.
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler. Any next(err) or thrown async error ends up here.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('❌', err.message);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
}

module.exports = { notFound, errorHandler };

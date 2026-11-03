function notFound(req, res) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;

  if (status >= 500) {
    console.error(error);
  }

  const body = {
    message: status >= 500 ? "Error interno del servidor" : error.message,
  };

  if (error.details) {
    body.details = error.details;
  }

  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };

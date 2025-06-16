const jwt    = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
  // look in header or query
  let authHeader = req.headers['authorization'] || req.query.token;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // handle "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  jwt.verify(token, process.env.JWT_SECRET || 'jwt-secret', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.user = decoded;  // { id, role }
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

module.exports = { jwtAuth, requireAdmin };
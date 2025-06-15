const jwt = require('jsonwebtoken');
module.exports = function(req, res, next) {
  let token = req.headers['authorization'];
  if (!token && req.query.token) {
    token = req.query.token;
  }
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, process.env.JWT_SECRET || 'jwt-secret', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.user = decoded;  // { id, role }
    next();
  });
};

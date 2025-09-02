// 📁 middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check for Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  // 2. Extract token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token not found in Authorization header' });
  }

  try {
    // 3. Verify token using secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach decoded user info to request object
    req.user = decoded;

    // 5. Continue to next middleware or route handler
    next();
  } catch (err) {
    // 6. Log and respond with token verification error
    console.error('JWT Verification Failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;

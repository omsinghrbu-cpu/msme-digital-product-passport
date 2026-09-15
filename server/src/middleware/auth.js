import jwt from 'jsonwebtoken';
export function requireAuth(req, res, next) { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) return res.status(401).json({ error: 'Authentication required' }); try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); } catch { res.status(401).json({ error: 'Invalid or expired token' }); } }
export function allowRoles(...roles) { return (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'This role is not allowed to perform that action' }); }

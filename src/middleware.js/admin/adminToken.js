// src/middleware/auth.js

import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).send({ message: 'Token has expired.' });
            }
            return res.status(500).send({ message: 'Failed to authenticate token.' });
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

export { verifyToken };
 
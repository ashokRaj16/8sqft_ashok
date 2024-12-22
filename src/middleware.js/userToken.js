// src/middleware/auth.js

import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token.' });
        }

        req.userId = decoded.id; // Assuming the JWT token contains the user ID in the 'id' field
        next();
    });
};

export { verifyToken };

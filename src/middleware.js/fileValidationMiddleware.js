// Error handling middleware to handle file validation errors from multer or custom validation

const fileUploadMiddleware = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors (file size or others)
        return res.status(400).send(`Multer error: ${err.message}`);
    } else if (err) {
        // General errors (e.g., invalid file type or file validation)
        return res.status(400).send(`Error: ${err.message}`);
    }
    next();
};
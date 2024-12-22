import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { xss } from 'express-xss-sanitizer';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'

import app from './src/app.js';

dotenv.config();

const port = process.env.PORT || 5000;
const server = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the view engine to EJS
// server.use(express.urlencoded({ extended: true }));
// console.log(__dirname);
if(process.env.NODE_ENV === "development") {
    server.use(morgan('dev'));
}
else if(process.env.NODE_ENV === "production") {
    const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
    app.use(morgan('combined', { stream: accessLogStream }));
    console.log(accessLogStream);
}

server.use(helmet());
server.use(xss());
server.use(cors())

server.use(app);

server.listen(port, () => {
    console.log(`Server running on ${port} `);
})
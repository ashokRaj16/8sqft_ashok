import mysql from 'mysql2/promise';

// const connection = mysql.createConnection({
//     host: process.env.DATABASE_HOST || '',
//     password: process.env.DATABASE_USER || '',
//     user : process.env.DATABASE_PASSWORD || '',
//     port: process.env.DATABASE_PORT || '',
//     waitForConnections: true,
//     connectTimeout : 100,
//     queueLimit: 0
// })

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST || '',
    password: process.env.DATABASE_USER || '',
    user : process.env.DATABASE_PASSWORD || '',
    port: process.env.DATABASE_PORT || '',
    waitForConnections: true,
    connectTimeout : 100,
    queueLimit: 0
})

export default pool;
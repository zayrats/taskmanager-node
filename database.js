const mysql = require('mysql2');

// Membuat koneksi pool untuk pengelolaan koneksi yang lebih efisien
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Ganti dengan username Anda
    password: '', // Ganti dengan password Anda
    database: 'taskmanager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Untuk menggunakan Promises dengan mysql2
const promisePool = pool.promise();

module.exports = promisePool;

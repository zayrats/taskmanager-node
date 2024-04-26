const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const db = require('./database'); // Import koneksi database
const bcrypt = require('bcryptjs'); // Import bcryptjs untuk hash password

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = 'asgd87'; // Gunakan variabel environment di produksi

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Mencari pengguna berdasarkan username
        const [users] = await db.execute('SELECT * FROM Users WHERE username = ?', [username]);
        const user = users[0];

        if (user && bcrypt.compareSync(password, user.password)) {
            // Pengguna ditemukan dan password cocok
            const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token: token });
        } else {
            // Kredensial tidak valid atau pengguna tidak ditemukan
            res.status(401).send('Username or password incorrect');
        }
    } catch (error) {
        console.error('Database query error', error);
        res.status(500).send('Internal server error');
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});


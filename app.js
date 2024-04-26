const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const db = require('./database'); // Import koneksi database
const bcrypt = require('bcryptjs'); // Import bcryptjs untuk hash password

const { celebrate, Joi, errors } = require('celebrate');

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

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Cek jika pengguna sudah ada
        const [userExists] = await db.execute('SELECT * FROM Users WHERE username = ?', [username]);
        
        if (userExists.length > 0) {
            return res.status(409).send('Username already exists'); // Konflik
        }

        // Hash password sebelum menyimpan ke database
        const hashedPassword = await bcrypt.hash(password, 8);

        // Menambahkan pengguna baru ke database
        const [createResult] = await db.execute(
            'INSERT INTO Users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        res.status(201).send({ message: "User registered successfully", userId: createResult.insertId });
    } catch (error) {
        console.error('Database query error', error);
        res.status(500).send('Internal server error');
    }
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}


const taskValidator = celebrate({
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        dueDate: Joi.date()
    })
});


app.post('/api/tasks', authenticateToken, taskValidator, async (req, res) => {
    try {
        const { title, description, dueDate, userId } = req.user;
        const [result] = await db.execute(
            'INSERT INTO Tasks (title, description, dueDate, userId) VALUES (?, ?, ?, ?)',
            [title, description, dueDate, userId]
        );
        res.status(201).send({ message: "Task created", taskId: result.insertId });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.get('/api/tasks', async (req) => {
    try {
        const [tasks] = await db.query('SELECT * FROM Tasks WHERE userId = ?', [req.user.id]);
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.put('/api/tasks/:id', authenticateToken, taskValidator, async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const [result] = await db.execute(
            'UPDATE Tasks SET title = ?, description = ?, dueDate = ? WHERE id = ? AND userId = ?',
            [title, description, dueDate, req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Task not found or user not authorized to update" });
        }
        res.status(200).send({ message: "Task updated" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM Tasks WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Task not found or user not authorized to delete" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});



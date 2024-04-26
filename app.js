const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { celebrate, Joi, errors } = require('celebrate');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());


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


app.use(errors());

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

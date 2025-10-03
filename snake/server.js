const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post('/login', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    try {
        const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length > 0) {
            res.json(user.rows[0]);
        } else {
            const newUser = await db.query('INSERT INTO users (username) VALUES ($1) RETURNING *', [username]);
            res.json(newUser.rows[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/scores', async (req, res) => {
    const { userId, score } = req.body;
    if (!userId || score === undefined) {
        return res.status(400).json({ error: 'userId and score are required' });
    }
    try {
        const newScore = await db.query('INSERT INTO scores (user_id, score) VALUES ($1, $2) RETURNING *', [userId, score]);
        res.json(newScore.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/ranking', async (req, res) => {
    try {
        const ranking = await db.query('SELECT u.username, s.score FROM users u JOIN scores s ON u.id = s.user_id ORDER BY s.score DESC LIMIT 10');
        res.json(ranking.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


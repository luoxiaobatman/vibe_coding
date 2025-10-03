const { Pool } = require('pg');

const pool = new Pool({
    user: 'luoxiao',
    host: 'localhost',
    database: 'snake',
    password: 'luoxiao',
    port: 5432,
});

pool.on('connect', () => {
    console.log('Connected to the database');
});

const createTables = async () => {
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL
        );
    `;
    const scoresTable = `
        CREATE TABLE IF NOT EXISTS scores (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            score INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(usersTable);
        await pool.query(scoresTable);
        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

createTables();

module.exports = {
    query: (text, params) => pool.query(text, params),
};


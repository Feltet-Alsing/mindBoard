import { env } from "$env/dynamic/private";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    connectionTimeoutMillis: 2000
})

export async function initDB() {
    //Users table
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
    //Sessions table
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                session_id VARCHAR(255) PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP NOT NULL
            )
        `);
        console.log('Sessions table initialized successfully');
    } catch (error) {
        console.error('Error initializing sessions table:', error);
        throw error;
    }
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notes (
                notes_id VARCHAR(255) PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP NOT NULL
            )
        `);
        console.log('Notes table initialized successfully');
    } catch (error) {
        console.error('Error initializing notes table:', error);
        throw error;
    }


}
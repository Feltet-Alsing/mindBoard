import { pool } from "./db";

export async function getSession(sessionId: string) {
    const result = await pool.query(
        "SELECT * FROM sessions WHERE session_id = $1",
        [sessionId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

export async function createSession(userId: number) {
    // Generate a unique session ID
    const sessionId = crypto.randomUUID();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Insert session into database
    const result = await pool.query(
        "INSERT INTO sessions (session_id, user_id, expires_at) VALUES ($1, $2, $3) RETURNING *",
        [sessionId, userId, expiresAt]
    );

    // Return the session ID (to store in cookie)
    return sessionId;
}

export async function getUserFromSession(sessionId: string) {
    // Find the session in the sessions table
    const sessionResult = await pool.query(
        'SELECT * FROM sessions WHERE session_id = $1 AND expires_at > NOW()',
        [sessionId]
    );

    if (sessionResult.rows.length === 0) {
        return null;
    }

    const session = sessionResult.rows[0];

    // Get the user data using the user_id from the session
    const userResult = await pool.query(
        'SELECT id, username, created_at FROM users WHERE id = $1',
        [session.user_id]
    );

    if (userResult.rows.length === 0) {
        return null;
    }

    return userResult.rows[0];
}

export async function deleteSession(sessionId: string) {
    // Delete the session from the database
    const result = await pool.query(
        'DELETE FROM sessions WHERE session_id = $1 RETURNING *',
        [sessionId]
    );

    return result.rows.length > 0;
}
import { pool } from "./db";

export async function getUser(userId: string) {
    const result = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [userId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

import type { Actions } from "./$types";
import { pool } from "$lib/db/db.js";
import { createSession, getUserFromSession } from "$lib/db/sessionsFunctions.js";
import { redirect } from "@sveltejs/kit";
import bcrypt from 'bcrypt';

export const load = async ({ cookies }) => {
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        return { user: null };
    }

    const user = await getUserFromSession(sessionId);

    return { user };
}

export const actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData();

        const username = data.get("username");
        const password = data.get("password");

        // Validate inputs
        if (!username || !password) {
            return { error: 'Username and password are required' };
        }

        const usernameStr = username.toString();
        const passwordStr = password.toString();

        // Check if user exists in database
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [usernameStr]
        );

        if (result.rows.length === 0) {
            return { error: 'User not found' };
        }

        const user = result.rows[0];

        // Verify password using bcrypt.compare
        const isValidPassword = await bcrypt.compare(passwordStr, user.password);

        if (!isValidPassword) {
            return { error: 'Invalid password' };
        }

        // User exists and password is correct
        const userId = user.id;

        // Create session in database and get session ID
        const sessionId = await createSession(userId);

        // Store only the session ID in cookie (not the whole user object)
        cookies.set("session_id", sessionId, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        throw redirect(303, '/main');
    }
} satisfies Actions
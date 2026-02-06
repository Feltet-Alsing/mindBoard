import { pool } from "$lib/db/db.js";
import type { Actions } from "./$types";
import { redirect } from "@sveltejs/kit";
import bcrypt from 'bcrypt';

export const actions = {
    createUser: async ({ request }) => {
        const data = await request.formData();
        const username = data.get("username");
        const password = data.get("password");

        // Validate inputs
        if (!username || !password) {
            return { error: 'Username and password are required' };
        }
        const usernameStr = username.toString();
        const passwordStr = password.toString();

        const hashedPassword = await bcrypt.hash(passwordStr, 10);

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [usernameStr]
        );

        if (existingUser.rows.length > 0) {
            return { error: 'Username already taken' };
        }

        // Create the new user
        await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2)',
            [usernameStr, hashedPassword]
        );

        // Redirect to login page
        throw redirect(303, '/');
    }
} satisfies Actions
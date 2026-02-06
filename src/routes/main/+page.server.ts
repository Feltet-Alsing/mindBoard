import { getUserFromSession, deleteSession } from "$lib/db/sessionsFunctions.js";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { pool } from "$lib/db/db.js";

export const load = async ({ cookies, locals }) => {
    const sessionId = cookies.get("session_id");

    if (!locals.user) {
        throw redirect(303, "/");
    }

    if (!sessionId) {
        return { user: null, pins: [] };
    }

    const user = await getUserFromSession(sessionId);

    // Get pins for the user
    const result = await pool.query(
        'SELECT pins_data FROM pins WHERE user_id = $1',
        [locals.user.id]
    );

    const pins = result.rows.length > 0 ? result.rows[0].pins_data : [];

    return { user, pins };
}

export const actions = {
    logout: async ({ cookies }) => {
        const sessionId = cookies.get("session_id");

        if (sessionId) {
            // Delete session from database
            await deleteSession(sessionId);
        }

        // Clear the cookie
        cookies.delete("session_id", { path: "/" });

        // Redirect to login page
        throw redirect(303, "/");
    },
    savePins: async ({ request, locals }) => {
        if (!locals.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const formData = await request.formData();
        const pinsJson = formData.get('pins') as string;
        const pinsData = JSON.parse(pinsJson);

        try {
            await pool.query(
                `INSERT INTO pins (user_id, pins_data, updated_at) 
                 VALUES ($1, $2, NOW()) 
                 ON CONFLICT (user_id) 
                 DO UPDATE SET pins_data = $2, updated_at = NOW()`,
                [locals.user.id, JSON.stringify(pinsData)]
            );

            return { success: true };
        } catch (error) {
            console.error('Error saving pins:', error);
            return { success: false, error: 'Failed to save pins' };
        }
    }
} satisfies Actions;
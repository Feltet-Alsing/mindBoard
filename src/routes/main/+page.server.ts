import { getUserFromSession, deleteSession } from "$lib/db/sessionsFunctions.js";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const load = async ({ cookies, locals }) => {
    const sessionId = cookies.get("session_id");

    if (!locals.user) {
        throw redirect(303, "/");
    }

    if (!sessionId) {
        return { user: null };
    }

    const user = await getUserFromSession(sessionId);

    return { user };
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
    }
} satisfies Actions;
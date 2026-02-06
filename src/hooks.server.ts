import { initDB } from "$lib/db/db";
import { getUserFromSession } from "$lib/db/sessionsFunctions";
import type { Handle } from "@sveltejs/kit";

// Initialize database once at startup
await initDB();

export const handle: Handle = async ({ event, resolve }) => {
    console.log('Hook called for URL:', event.url.pathname);

    // Get session cookie
    const sessionId = event.cookies.get('session_id');
    console.log('Session ID from cookie:', sessionId);

    if (sessionId) {
        // Validate session and get user
        const user = await getUserFromSession(sessionId);
        console.log('User from session:', user);

        if (user) {
            event.locals.user = {
                id: user.id,
                username: user.username,
                created_at: user.created_at
            };
            console.log('Set locals.user:', event.locals.user);
        }
    }

    return await resolve(event);
}
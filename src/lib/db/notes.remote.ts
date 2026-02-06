import { form, query, command, getRequestEvent } from "$app/server";
import { z } from "zod";
import { pool } from "./db";
import { error } from "@sveltejs/kit";

// Query to get notes for the authenticated user
export const getNotes = query(async () => {
    const { locals } = getRequestEvent();

    if (!locals.user?.id) {
        error(401, 'Unauthorized');
    }

    const result = await pool.query(
        'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
        [locals.user.id]
    );

    return result.rows;
});

export const getNote = query(z.string(), async (slug) => {
    const { locals } = getRequestEvent();

    if (!locals.user?.id) {
        error(401, "Unauthorized");
    }

    const result = await pool.query(
        'SELECT * FROM notes WHERE notes_id = $1 AND user_id = $2',
        [slug, locals.user.id]
    );

    if (result.rows.length === 0) {
        error(404, "Note not found");
    }

    return result.rows[0];
})

// Form to create a new note
export const createNote = form(
    z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Content is required")
    }),
    async ({ title, content }) => {
        const { locals } = getRequestEvent();

        if (!locals.user?.id) {
            error(401, 'Unauthorized');
        }

        // Generate a unique ID for the note
        const noteId = crypto.randomUUID();

        const result = await pool.query(
            'INSERT INTO notes (notes_id, user_id, title, content, expires_at) VALUES ($1, $2, $3, $4, NOW() + INTERVAL \'30 days\') RETURNING *',
            [noteId, locals.user.id, title, content]
        );

        // Refresh the notes list after creating
        await getNotes().refresh();

        return result.rows[0];
    }
)

export const deleteNote = command(z.string(), async (slug) => {
    const { locals } = getRequestEvent();

    if (!locals.user?.id) {
        error(401, "Unauthorized");
    }

    const result = await pool.query(
        'DELETE FROM notes WHERE notes_id = $1 AND user_id = $2 RETURNING *',
        [slug, locals.user.id]
    );

    if (result.rows.length === 0) {
        error(404, "Note not found");
    }

    // Refresh the notes list after deleting
    await getNotes().refresh();

    return result.rows[0];
})

export const updateNote = form(
    z.object({
        noteId: z.string(),
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Content is required")
    }),
    async ({ noteId, title, content }) => {
        const { locals } = getRequestEvent();

        if (!locals.user?.id) {
            error(401, "Unauthorized");
        }

        const result = await pool.query(
            'UPDATE notes SET title = $1, content = $2 WHERE notes_id = $3 AND user_id = $4 RETURNING *',
            [title, content, noteId, locals.user.id]
        );

        if (result.rows.length === 0) {
            error(404, "Note not found");
        }

        // Refresh the notes list and the specific note
        await getNotes().refresh();
        await getNote(noteId).refresh();

        return result.rows[0];
    }
)
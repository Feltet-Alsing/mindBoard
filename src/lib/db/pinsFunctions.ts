import { query, command, getRequestEvent } from "$app/server";
import { z } from "zod";
import { pool } from "./db";
import { error } from "@sveltejs/kit";

// Schema for a pin
const PinSchema = z.object({
    position: z.object({
        left: z.string(),
        top: z.string()
    }),
    height: z.string(),
    width: z.string(),
    title: z.string(),
    content: z.string(),
    color: z.string(),
    label: z.string(),
    connections: z.array(z.number())
});

// Query to get pins for the authenticated user
export const getPins = query(async () => {
    const { locals } = getRequestEvent();

    if (!locals.user?.id) {
        error(401, 'Unauthorized');
    }

    const result = await pool.query(
        'SELECT pins_data FROM pins WHERE user_id = $1',
        [locals.user.id]
    );

    if (result.rows.length === 0) {
        return [];
    }

    return result.rows[0].pins_data;
});

// Command to save pins for the authenticated user
export const savePins = command(
    z.array(PinSchema),
    async (pinsData) => {
        const { locals } = getRequestEvent();

        if (!locals.user?.id) {
            error(401, 'Unauthorized');
        }

        // Use UPSERT (INSERT ... ON CONFLICT) to either insert or update
        const result = await pool.query(
            `INSERT INTO pins (user_id, pins_data, updated_at) 
             VALUES ($1, $2, NOW()) 
             ON CONFLICT (user_id) 
             DO UPDATE SET pins_data = $2, updated_at = NOW()
             RETURNING *`,
            [locals.user.id, JSON.stringify(pinsData)]
        );

        return result.rows[0];
    }
);

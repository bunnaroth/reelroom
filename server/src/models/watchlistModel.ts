import { pool } from '../config/db.js';
import { WatchlistItem } from '../types/watchlist.js';

export const watchlistModel = {
    async add(userId: number, tmdbMovieId: number): Promise<WatchlistItem> {
        const text = `
            INSERT INTO watchlists (user_id, tmdb_movie_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, tmdb_movie_id) DO NOTHING
            RETURNING id, user_id AS "userId", tmdb_movie_id AS "tmdbMovieId", created_at AS "createdAt";
        `;
        const result = await pool.query(text, [userId, tmdbMovieId]);
        return result.rows[0];
    },

    async findByUser(userId: number): Promise<WatchlistItem[]> {
        const text = `
            SELECT id, user_id AS "userId", tmdb_movie_id AS "tmdbMovieId", created_at AS "createdAt"
            FROM watchlists
            WHERE user_id = $1
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(text, [userId]);
        return result.rows;
    },

    async remove(userId: number, tmdbMovieId: number): Promise<boolean> {
        const text = `
            DELETE FROM watchlists
            WHERE user_id = $1 AND tmdb_movie_id = $2;
        `;
        const result = await pool.query(text, [userId, tmdbMovieId]);
        return (result.rowCount ?? 0) > 0;
    }
};

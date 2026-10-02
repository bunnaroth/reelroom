import { pool } from '../config/db.js';
import { WatchlistItem } from '../types/watchlist.js';

export const watchlistModel = {
    async add(userId: number, tmdbMovieId: number, mediaType: WatchlistItem['mediaType']): Promise<WatchlistItem> {
        const text = `
            INSERT INTO watchlists (user_id, tmdb_movie_id, media_type)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, tmdb_movie_id, media_type)
            DO UPDATE SET tmdb_movie_id = EXCLUDED.tmdb_movie_id
            RETURNING id, user_id AS "userId", tmdb_movie_id AS "tmdbMovieId", media_type AS "mediaType", created_at AS "createdAt";
        `;
        const result = await pool.query(text, [userId, tmdbMovieId, mediaType]);
        return result.rows[0];
    },

    async findByUser(userId: number): Promise<WatchlistItem[]> {
        const text = `
            SELECT id, user_id AS "userId", tmdb_movie_id AS "tmdbMovieId", media_type AS "mediaType", created_at AS "createdAt"
            FROM watchlists
            WHERE user_id = $1
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(text, [userId]);
        return result.rows;
    },

    async remove(userId: number, tmdbMovieId: number, mediaType: WatchlistItem['mediaType']): Promise<boolean> {
        const text = `
            DELETE FROM watchlists
            WHERE user_id = $1 AND tmdb_movie_id = $2 AND media_type = $3;
        `;
        const result = await pool.query(text, [userId, tmdbMovieId, mediaType]);
        return (result.rowCount ?? 0) > 0;
    }
};

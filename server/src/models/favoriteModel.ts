import { pool } from '../config/db.js';
import { FavoriteItem } from '../types/favorite.js';

export const favoriteModel = {
    async add(userId: number, tmdbMovieId: number): Promise<FavoriteItem> {
        const text = `
            INSERT INTO favorites (user_id, tmdb_movie_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, tmdb_movie_id) DO NOTHING
            RETURNING id, user_id AS "userId", tmdb_movie_id AS "tmdbMovieId", created_at AS "createdAt";
        `;
        const result = await pool.query(text, [userId, tmdbMovieId]);
        return result.rows[0];
    },

    async findByUser(userId: number): Promise<FavoriteItem[]> {
        const text = `
            SELECT id, user_id AS "userId", tmdb_movie_id AS "tmdbMovieId", created_at AS "createdAt"
            FROM favorites
            WHERE user_id = $1
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(text, [userId]);
        return result.rows;
    },

    async remove(userId: number, tmdbMovieId: number): Promise<boolean> {
        const text = `
            DELETE FROM favorites
            WHERE user_id = $1 AND tmdb_movie_id = $2;
        `;
        const result = await pool.query(text, [userId, tmdbMovieId]);
        return (result.rowCount ?? 0) > 0;
    },

    async isFavorited(userId: number, tmdbMovieId: number): Promise<boolean> {
        const text = `
            SELECT 1 FROM favorites 
            WHERE user_id = $1 AND tmdb_movie_id = $2 
            LIMIT 1;
        `;
        const result = await pool.query(text, [userId, tmdbMovieId]);
        return result.rows.length > 0;
    }
};

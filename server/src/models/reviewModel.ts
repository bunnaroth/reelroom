import { pool } from '../config/db.js';
import { Review } from '../types/review.js';

export const reviewModel = {
    async create(userId: number, tmdbMovieId: number, rating: number, content: string): Promise<Review> {
        const text = `
            INSERT INTO reviews (user_id, tmdb_movie_id, rating, content)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id AS "userId", tmdb_movie_id AS "tmdbMovieId", rating, content, created_at AS "createdAt", updated_at AS "updatedAt";
        `;
        const result = await pool.query(text, [userId, tmdbMovieId, rating, content]);
        return result.rows[0]; 
    },

    async findByMovie(tmdbMovieId: number): Promise<any[]> {
        const text = `
            SELECT r.id, r.user_id AS "userId", u.username, r.rating, r.content, r.created_at AS "createdAt"
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.tmdb_movie_id = $1
            ORDER BY r.created_at DESC;
        `;
        const result = await pool.query(text, [tmdbMovieId]);
        return result.rows;
    },

    async remove(userId: number, reviewId: number): Promise<boolean> {
        const text = `
            DELETE FROM reviews
            WHERE id = $1 AND user_id = $2;
        `;
        const result = await pool.query(text, [reviewId, userId]);
        return (result.rowCount ?? 0) > 0;
    }
};

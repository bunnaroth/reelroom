import { pool } from '../config/db.js';
import { Review } from '../types/review.js';
import type { MediaType } from '../types/movie.js';

export const reviewModel = {
    async create(userId: number, tmdbMovieId: number, mediaType: MediaType, rating: number, content: string): Promise<Review> {
        const text = `
            WITH inserted_review AS (
                INSERT INTO reviews (user_id, tmdb_movie_id, media_type, rating, content)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, user_id, tmdb_movie_id, media_type, rating, content, created_at, updated_at
            )
            SELECT inserted_review.id,
                   inserted_review.user_id AS "userId",
                   inserted_review.tmdb_movie_id AS "tmdbMovieId",
                   inserted_review.media_type AS "mediaType",
                   users.username,
                   inserted_review.rating,
                   inserted_review.content,
                   inserted_review.created_at AS "createdAt",
                   inserted_review.updated_at AS "updatedAt"
            FROM inserted_review
            JOIN users ON users.id = inserted_review.user_id;
        `;
        const result = await pool.query(text, [userId, tmdbMovieId, mediaType, rating, content]);
        return result.rows[0]; 
    },

    async findByMovie(tmdbMovieId: number, mediaType: MediaType): Promise<any[]> {
        const text = `
            SELECT r.id, r.user_id AS "userId", r.media_type AS "mediaType", u.username, r.rating, r.content, r.created_at AS "createdAt"
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.tmdb_movie_id = $1 AND r.media_type = $2
            ORDER BY r.created_at DESC;
        `;
        const result = await pool.query(text, [tmdbMovieId, mediaType]);
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

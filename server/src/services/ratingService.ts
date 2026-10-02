import { reviewModel } from '../models/reviewModel.js';
import { Rating } from '../types/rating.js';

const validateMovieId = (tmdbMovieId: number): void => {
	if (!Number.isInteger(tmdbMovieId) || tmdbMovieId <= 0) {
		throw new Error('A valid TMDB movie ID is required');
	}
};

const validateRating = (rating: number): void => {
	if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
		throw new Error('Rating must be an integer between 1 and 5');
	}
};

export const ratingService = {
	async addRating(userId: number, tmdbMovieId: number, rating: number): Promise<Rating> {
		if (!Number.isInteger(userId) || userId <= 0) {
			throw new Error('A valid user ID is required');
		}

		validateMovieId(tmdbMovieId);
		validateRating(rating);

		const review = await reviewModel.create(userId, tmdbMovieId, 'movie', rating, '');
		return {
			id: review.id,
			user_id: review.userId,
			tmdb_movie_id: review.tmdbMovieId,
			rating: review.rating,
			created_at: review.createdAt,
			updated_at: review.updatedAt
		};
	},

	async getMovieRating(tmdbMovieId: number): Promise<{ averageRating: number; totalRatings: number }> {
		validateMovieId(tmdbMovieId);

		const reviews = await reviewModel.findByMovie(tmdbMovieId, 'movie');
		const totalRatings = reviews.length;
		const averageRating = totalRatings === 0
			? 0
			: reviews.reduce((total, review) => total + Number(review.rating), 0) / totalRatings;

		return { averageRating, totalRatings };
	}
};

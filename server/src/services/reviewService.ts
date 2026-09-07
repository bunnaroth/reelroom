import { reviewModel } from '../models/reviewModel.js';
import { Review } from '../types/review.js';

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

export const reviewService = {
	async addReview(
		userId: number,
		tmdbMovieId: number,
		rating: number,
		content: string
	): Promise<Review> {
		validateMovieId(tmdbMovieId);
		validateRating(rating);

		if (!Number.isInteger(userId) || userId <= 0) {
			throw new Error('A valid user ID is required');
		}

		return reviewModel.create(userId, tmdbMovieId, rating, content.trim());
	},

	async getMovieReviews(tmdbMovieId: number): Promise<any[]> {
		validateMovieId(tmdbMovieId);
		return reviewModel.findByMovie(tmdbMovieId);
	},

	async deleteReview(userId: number, reviewId: number): Promise<boolean> {
		if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(reviewId) || reviewId <= 0) {
			throw new Error('Valid user and review IDs are required');
		}

		return reviewModel.remove(userId, reviewId);
	}
};

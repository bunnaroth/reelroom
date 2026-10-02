import type { MediaType } from './movie.js';

export interface Review {
    id: number;
    userId: number;
    tmdbMovieId: number;
    mediaType: MediaType;
    username: string;
    rating: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateReviewInput {
    tmdbMovieId: number;
    mediaType?: MediaType;
    rating: number;
    content: string;
}

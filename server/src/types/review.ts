export interface Review {
    id: number;
    userId: number;
    tmdbMovieId: number;
    rating: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateReviewInput {
    tmdbMovieId: number;
    rating: number;
    content: string;
}

export interface FavoriteItem {
    id: number;
    userId: number;
    tmdbMovieId: number;
    createdAt: Date;
}

export interface ToggleFavoriteInput {
    tmdbMovieId: number;
}

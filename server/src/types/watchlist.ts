export interface WatchlistItem {
    id: number;
    userId: number;
    tmdbMovieId: number;
    createdAt: Date;
}

export interface AddWatchlistInput {
    tmdbMovieId: number;
}

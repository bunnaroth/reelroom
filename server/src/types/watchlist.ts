import type { MediaType, MovieDTO } from './movie.js';

export interface WatchlistItem {
    id: number;
    userId: number;
    tmdbMovieId: number;
    mediaType: MediaType;
    createdAt: Date;
    movie?: MovieDTO;
}

export interface AddWatchlistInput {
    tmdbMovieId: number;
    mediaType?: MediaType;
}

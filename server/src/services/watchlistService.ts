import { watchlistModel } from '../models/watchlistModel.js';
import { tmdbService } from './tmdbService.js';
import { WatchlistItem } from '../types/watchlist.js';
import type { MediaType } from '../types/movie.js';

export const watchlistService = {
    async addToWatchlist(userId: number, tmdbMovieId: number, mediaType: MediaType = 'movie'): Promise<WatchlistItem> {
        validateIds(userId, tmdbMovieId);
        await tmdbService.getMediaDetails(tmdbMovieId, mediaType);
        return watchlistModel.add(userId, tmdbMovieId, mediaType);
    },

    async getUserWatchlistIDs(userId: number): Promise<WatchlistItem[]> {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new Error('A valid user ID is required');
        }

        const items = await watchlistModel.findByUser(userId);
        const movies = await Promise.all(items.map((item) =>
            tmdbService.getMediaDetails(item.tmdbMovieId, item.mediaType)));

        return items.map((item, index) => ({ ...item, movie: movies[index] }));
    },

    async removeFromWatchlist(userId: number, tmdbMovieId: number, mediaType: MediaType = 'movie'): Promise<boolean> {
        validateIds(userId, tmdbMovieId);
        return watchlistModel.remove(userId, tmdbMovieId, mediaType);
    }
};

function validateIds(userId: number, tmdbMovieId: number): void {
    if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error('A valid user ID is required');
    }

    if (!Number.isInteger(tmdbMovieId) || tmdbMovieId <= 0) {
        throw new Error('A valid TMDB movie ID is required');
    }
}

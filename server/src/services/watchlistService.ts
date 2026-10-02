import { watchlistModel } from '../models/watchlistModel.js';
import { tmdbService } from './tmdbService.js';
import { WatchlistItem } from '../types/watchlist.js';

export const watchlistService = {
    async addToWatchlist(userId: number, tmdbMovieId: number): Promise<WatchlistItem> {
        validateIds(userId, tmdbMovieId);
        await tmdbService.getMovieDetails(tmdbMovieId);
        return watchlistModel.add(userId, tmdbMovieId);
    },

    async getUserWatchlistIDs(userId: number): Promise<WatchlistItem[]> {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new Error('A valid user ID is required');
        }

        return watchlistModel.findByUser(userId);
    },

    async removeFromWatchlist(userId: number, tmdbMovieId: number): Promise<boolean> {
        validateIds(userId, tmdbMovieId);
        return watchlistModel.remove(userId, tmdbMovieId);
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

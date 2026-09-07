import { favoriteModel } from '../models/favoriteModel.js';
import { tmdbService } from './tmdbService.js';
import { MovieDTO } from '../types/movie.js';

export const favoriteService = {
    async toggleFavorite(userId: number, tmdbMovieId: number): Promise<{ favorited: boolean }> {
       
        await tmdbService.getMovieDetails(tmdbMovieId);

        const alreadyFavorited = await favoriteModel.isFavorited(userId, tmdbMovieId);

        if (alreadyFavorited) {
            await favoriteModel.remove(userId, tmdbMovieId);
            return { favorited: false };
        } else {
            await favoriteModel.add(userId, tmdbMovieId);
            return { favorited: true };
        }
    },

    async getUserFavorites(userId: number): Promise<MovieDTO[]> {
        const items = await favoriteModel.findByUser(userId);
        
        const detailPromises = items.map(item => 
            tmdbService.getMovieDetails(item.tmdbMovieId).catch(() => null)
        );
        
        const detailedMovies = await Promise.all(detailPromises);
        return detailedMovies.filter((movie): movie is MovieDTO => movie !== null);
    }
};

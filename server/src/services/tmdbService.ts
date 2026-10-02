import { Movie, MovieDTO } from '../types/movie.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

const formatMovieDTO = (movie: Movie): MovieDTO => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    backdropPath: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : null,
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average,
    voteCount: movie.vote_count,
    popularity: movie.popularity,
    genreIds: movie.genre_ids
});

export const tmdbService = {
    async getMovieDetails(tmdbMovieId: number): Promise<MovieDTO> {
        if (!Number.isInteger(tmdbMovieId) || tmdbMovieId <= 0) {
            throw new Error('A valid TMDB movie ID is required');
        }

        const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbMovieId}`, {
            headers: {
                Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch movie details from TMDB: ${response.status} ${errorText}`);
        }

        const movie: Movie = await response.json();
        return formatMovieDTO(movie);
    },

    async getPopular(): Promise<MovieDTO[]> {
        const response = await fetch(`${TMDB_BASE_URL}/movie/popular`, {
            headers: {
                Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch popular movies from TMDB: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const rawMovies: Movie[] = data.results || [];
        return rawMovies.map(formatMovieDTO);
    },

    async searchMovies(query: string): Promise<MovieDTO[]> {
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`, {
            headers: {
                Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Movie search operation failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const rawMovies: Movie[] = data.results || [];
        return rawMovies.map(formatMovieDTO);
    }
};
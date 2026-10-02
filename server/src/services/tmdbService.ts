import { MediaType, Movie, MovieDTO, MoviePageDTO } from '../types/movie.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const normalizeTotalPages = (totalPages: number | undefined): number => Math.min(Math.max(totalPages || 1, 1), 500);

interface TvShow {
    id: number;
    name: string;
    overview: string | null;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date?: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
}

const formatMovieDTO = (movie: Movie): MovieDTO => ({
    id: movie.id,
    mediaType: 'movie',
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

const fetchMovies = async (path: string, operation: string): Promise<MovieDTO[]> => {
    const response = await fetch(`${TMDB_BASE_URL}${path}`, {
        headers: {
            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${operation} request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const rawMovies: Movie[] = data.results || [];
    return rawMovies.map(formatMovieDTO);
};

const fetchMoviePage = async (path: string, operation: string): Promise<MoviePageDTO> => {
    const response = await fetch(`${TMDB_BASE_URL}${path}`, {
        headers: {
            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${operation} request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const rawMovies: Movie[] = data.results || [];
    return {
        movies: rawMovies.map(formatMovieDTO),
        page: data.page || 1,
        totalPages: normalizeTotalPages(data.total_pages)
    };
};

const formatTvShowDTO = (show: TvShow): MovieDTO => ({
    id: show.id,
    mediaType: 'tv',
    title: show.name,
    overview: show.overview,
    posterPath: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
    backdropPath: show.backdrop_path ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}` : null,
    releaseDate: show.first_air_date || '',
    voteAverage: show.vote_average,
    voteCount: show.vote_count,
    popularity: show.popularity,
    genreIds: show.genre_ids || []
});

const fetchTvShows = async (params: URLSearchParams, page: number): Promise<MoviePageDTO> => {
    const pagedParams = new URLSearchParams(params);
    pagedParams.set('page', String(page));
    const response = await fetch(`${TMDB_BASE_URL}/discover/tv?${pagedParams.toString()}`, {
        headers: {
            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TV discovery request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const rawShows: TvShow[] = data.results || [];
    return {
        movies: rawShows.map(formatTvShowDTO),
        page: data.page || 1,
        totalPages: normalizeTotalPages(data.total_pages)
    };
};

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

        return formatMovieDTO(await response.json());
    },

    async getTvShowDetails(tmdbTvId: number): Promise<MovieDTO> {
        if (!Number.isInteger(tmdbTvId) || tmdbTvId <= 0) {
            throw new Error('A valid TMDB TV ID is required');
        }

        const response = await fetch(`${TMDB_BASE_URL}/tv/${tmdbTvId}`, {
            headers: {
                Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch TV details from TMDB: ${response.status} ${errorText}`);
        }

        return formatTvShowDTO(await response.json());
    },

    async getMediaDetails(tmdbId: number, mediaType: MediaType = 'movie'): Promise<MovieDTO> {
        return mediaType === 'tv'
            ? this.getTvShowDetails(tmdbId)
            : this.getMovieDetails(tmdbId);
    },

    async getPopular(): Promise<MovieDTO[]> {
        return fetchMovies('/movie/popular', 'Popular movies');
    },

    async getTrending(page: number): Promise<MoviePageDTO> {
        return fetchMoviePage(`/trending/movie/week?page=${page}`, 'Trending movies');
    },

    async discoverMovies(params: URLSearchParams, page: number): Promise<MoviePageDTO> {
        const pagedParams = new URLSearchParams(params);
        pagedParams.set('page', String(page));
        return fetchMoviePage(`/discover/movie?${pagedParams.toString()}`, 'Movie discovery');
    },

    async discoverTvShows(params: URLSearchParams, page: number): Promise<MoviePageDTO> {
        return fetchTvShows(params, page);
    },

    async searchMovies(query: string): Promise<MovieDTO[]> {
        return fetchMovies(`/search/movie?query=${encodeURIComponent(query)}`, 'Movie search');
    }
};
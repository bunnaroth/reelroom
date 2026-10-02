import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tmdbService } from './tmdbService.js';

const movie = (id: number) => ({
    backdrop_path: null,
    id,
    title: `Movie ${id}`,
    original_title: `Movie ${id}`,
    overview: null,
    poster_path: null,
    original_language: 'en',
    genre_ids: [],
    popularity: 10,
    release_date: '2026-01-01',
    video: false,
    vote_average: 7,
    vote_count: 10
});

const tvShow = (id: number) => ({
    id,
    name: `Series ${id}`,
    overview: null,
    poster_path: null,
    backdrop_path: null,
    first_air_date: '2026-01-01',
    vote_average: 7,
    vote_count: 10,
    popularity: 10,
    genre_ids: [18]
});

const response = (body: unknown) => ({
    ok: true,
    json: async () => body,
    text: async () => JSON.stringify(body)
}) as unknown as Response;

describe('tmdbService', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('normalizes all popular movies', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockResolvedValue(response({ results: [movie(1), movie(2)] }));

        const movies = await tmdbService.getPopular();

        expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.themoviedb.org/3/movie/popular');
        expect(movies.map((item) => item.id)).toEqual([1, 2]);
    });

    it('normalizes all movies in paginated discovery results', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockResolvedValue(response({ page: 2, total_pages: 12, results: [movie(1), movie(2)] }));

        const result = await tmdbService.discoverMovies(new URLSearchParams(), 2);

        expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.themoviedb.org/3/discover/movie?page=2');
        expect(result.movies.map((item) => item.id)).toEqual([1, 2]);
        expect(result.page).toBe(2);
        expect(result.totalPages).toBe(12);
    });

    it('fetches paginated trending movies', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockResolvedValue(response({ page: 2, total_pages: 4, results: [movie(1)] }));

        const result = await tmdbService.getTrending(2);

        expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.themoviedb.org/3/trending/movie/week?page=2');
        expect(result.movies.map((item) => item.id)).toEqual([1]);
    });

    it('normalizes discovered TV shows', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockResolvedValue(response({ page: 1, total_pages: 1, results: [tvShow(1), tvShow(2)] }));

        const result = await tmdbService.discoverTvShows(new URLSearchParams(), 1);

        expect(result.movies.map((item) => item.id)).toEqual([1, 2]);
        expect(result.movies[0]).toMatchObject({ mediaType: 'tv', title: 'Series 1' });
    });

    it('fetches and normalizes TV details', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockResolvedValue(response(tvShow(7)));

        const show = await tmdbService.getTvShowDetails(7);

        expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.themoviedb.org/3/tv/7');
        expect(show).toMatchObject({ id: 7, mediaType: 'tv', title: 'Series 7' });
    });

    it('fetches and normalizes movie details', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockResolvedValue(response(movie(8)));

        const result = await tmdbService.getMovieDetails(8);

        expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.themoviedb.org/3/movie/8');
        expect(result).toMatchObject({ id: 8, mediaType: 'movie', title: 'Movie 8' });
    });
});

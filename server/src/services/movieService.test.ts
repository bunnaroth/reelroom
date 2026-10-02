import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MovieDTO, MoviePageDTO } from '../types/movie.js';
import { movieService } from './movieService.js';
import { tmdbService } from './tmdbService.js';

const movie = (id: number, mediaType: MovieDTO['mediaType'] = 'movie'): MovieDTO => ({
    id,
    mediaType,
    title: `Title ${id}`,
    overview: null,
    posterPath: null,
    backdropPath: null,
    releaseDate: '2026-01-01',
    voteAverage: 7,
    voteCount: 10,
    popularity: 10,
    genreIds: []
});

const page = (movies: MovieDTO[]): MoviePageDTO => ({ movies, page: 1, totalPages: 3 });

describe('movieService Discover results', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('combines category sources in order without shuffling and deduplicates by ID', async () => {
        const discoverMovies = vi.spyOn(tmdbService, 'discoverMovies')
            .mockResolvedValueOnce(page([movie(1), movie(90)]))
            .mockResolvedValueOnce(page([movie(1), movie(3)]))
            .mockResolvedValueOnce(page([movie(1), movie(2)]));
        const discoverTvShows = vi.spyOn(tmdbService, 'discoverTvShows')
            .mockResolvedValue(page([movie(4, 'tv'), movie(91, 'tv')]));

        const result = await movieService.getDiscoverMovies('all', 1);

        expect(discoverMovies).toHaveBeenCalledTimes(2);
        expect(discoverTvShows).toHaveBeenCalledTimes(2);
        const movieCalls = discoverMovies.mock.calls;
        expect(movieCalls[0][0].get('with_origin_country')).toBe('US');
        expect(movieCalls[1][0].get('with_genres')).toBe('16');
        for (const [filters, pageNumber] of movieCalls) {
            expect(pageNumber).toBe(1);
        }
        expect(discoverTvShows.mock.calls[0][0].get('with_origin_country')).toBe('KR');
        expect(discoverTvShows.mock.calls[1][0].get('with_origin_country')).toBe('CN');
        expect(discoverTvShows.mock.calls[1][0].get('with_original_language')).toBe('zh');
        expect(discoverTvShows.mock.calls[1][0].get('with_genres')).toBe('18');
        expect(result.movies.map((item) => item.id)).toEqual([1, 90, 3, 4, 91]);
        expect(result.totalPages).toBe(3);
    });

    it('requests K-Drama independently from TMDB Korean TV discover filters', async () => {
        const discoverMovies = vi.spyOn(tmdbService, 'discoverMovies');
        const discoverTvShows = vi.spyOn(tmdbService, 'discoverTvShows').mockResolvedValue(page([movie(7, 'tv')]));

        const result = await movieService.getDiscoverMovies('k-drama', 2);

        expect(discoverMovies).not.toHaveBeenCalled();
        expect(discoverTvShows).toHaveBeenCalledTimes(1);
        expect(discoverTvShows.mock.calls[0][0].get('with_origin_country')).toBe('KR');
        expect(discoverTvShows.mock.calls[0][0].get('with_original_language')).toBe('ko');
        expect(discoverTvShows.mock.calls[0][0].get('with_genres')).toBe('18');
        expect(discoverTvShows.mock.calls[0][1]).toBe(2);
        expect(result.movies).toEqual([movie(7, 'tv')]);
    });

    it('returns only four movies per Home section', async () => {
        const manyMovies = Array.from({ length: 6 }, (_, index) => movie(index + 1));
        vi.spyOn(tmdbService, 'getTrending').mockResolvedValue(page(manyMovies));
        const getDiscoverMovies = vi.spyOn(movieService, 'getDiscoverMovies')
            .mockResolvedValue(page(manyMovies));

        const result = await movieService.getHomeMovies();

        expect(getDiscoverMovies.mock.calls.map(([category]) => category)).toEqual([
            'animation',
            'hollywood',
            'k-drama',
            'c-drama'
        ]);
        expect(result.popular).toHaveLength(4);
        expect(result.animation).toHaveLength(4);
        expect(result.hollywood).toHaveLength(4);
        expect(result.kDrama).toHaveLength(4);
        expect(result.cDrama).toHaveLength(4);
    });
});
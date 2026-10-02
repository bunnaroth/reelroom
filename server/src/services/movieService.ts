import { HomeMovieSectionsDTO, MoviePageDTO } from '../types/movie.js';
import { tmdbService } from './tmdbService.js';

export const discoverCategories = ['all', 'hollywood', 'animation', 'c-drama', 'k-drama'] as const;

export type DiscoverCategory = typeof discoverCategories[number];

const commonFilters = {
    sort_by: 'popularity.desc',
    include_video: 'false',
    page: '1'
};

const movieCategoryFilters: Record<Exclude<DiscoverCategory, 'all' | 'k-drama' | 'c-drama'>, URLSearchParams> = {
    hollywood: new URLSearchParams({
        ...commonFilters,
        with_origin_country: 'US',
        with_original_language: 'en'
    }),
    animation: new URLSearchParams({
        ...commonFilters,
        with_genres: '16'
    }),
};

const kDramaFilters = new URLSearchParams({
    ...commonFilters,
    with_origin_country: 'KR',
    with_original_language: 'ko',
    with_genres: '18'
});

const cDramaFilters = new URLSearchParams({
    ...commonFilters,
    with_origin_country: 'CN',
    with_original_language: 'zh',
    with_genres: '18'
});

const isDiscoverCategory = (value: unknown): value is DiscoverCategory =>
    typeof value === 'string' && discoverCategories.includes(value as DiscoverCategory);

const asProviderError = (cause: unknown): Error & { statusCode: number } => {
    const error = new Error('Movie data provider is unavailable.', { cause }) as Error & { statusCode: number };
    error.statusCode = 502;
    return error;
};

const combinePages = (pages: MoviePageDTO[], page: number): MoviePageDTO => {
    const seenMovieIds = new Set<number>();
    const movies: MoviePageDTO['movies'] = [];

    for (const result of pages) {
        for (const movie of result.movies) {
            if (!seenMovieIds.has(movie.id)) {
                seenMovieIds.add(movie.id);
                movies.push(movie);
            }
        }
    }

    return {
        movies,
        page,
        totalPages: Math.max(...pages.map((result) => result.totalPages))
    };
};

export const movieService = {
    isDiscoverCategory,

    async getDiscoverMovies(category: DiscoverCategory, page: number): Promise<MoviePageDTO> {
        try {
            if (category === 'all') {
                const categoryPages = await Promise.all([
                    tmdbService.discoverMovies(movieCategoryFilters.hollywood, page),
                    tmdbService.discoverMovies(movieCategoryFilters.animation, page),
                    tmdbService.discoverTvShows(kDramaFilters, page),
                    tmdbService.discoverTvShows(cDramaFilters, page)
                ]);
                return combinePages(categoryPages, page);
            }

            if (category === 'k-drama') {
                return tmdbService.discoverTvShows(kDramaFilters, page);
            }

            if (category === 'c-drama') {
                return tmdbService.discoverTvShows(cDramaFilters, page);
            }

            return tmdbService.discoverMovies(movieCategoryFilters[category], page);
        } catch (error) {
            throw asProviderError(error);
        }
    },

    async getHomeMovies(): Promise<HomeMovieSectionsDTO> {
        try {
            const [popular, animation, hollywood, kDrama, cDrama] = await Promise.all([
                tmdbService.getTrending(1),
                this.getDiscoverMovies('animation', 1),
                this.getDiscoverMovies('hollywood', 1),
                this.getDiscoverMovies('k-drama', 1),
                this.getDiscoverMovies('c-drama', 1)
            ]);

            return {
                popular: popular.movies.slice(0, 4),
                animation: animation.movies.slice(0, 4),
                hollywood: hollywood.movies.slice(0, 4),
                kDrama: kDrama.movies.slice(0, 4),
                cDrama: cDrama.movies.slice(0, 4)
            };
        } catch (error) {
            throw asProviderError(error);
        }
    }
};
export interface Movie { 
    backdrop_path: string | null; 
    id: number;
    title: string; 
    original_title: string; 
    overview: string | null; 
    poster_path: string | null; 
    mediaType?: "movie"; 
    original_language: string; 
    genre_ids: number[]; 
    popularity: number; 
    release_date: string; 
    video: boolean; 
    vote_average: number; 
    vote_count: number; 
}

export type MediaType = 'movie' | 'tv';

export const isMediaType = (value: unknown): value is MediaType => value === 'movie' || value === 'tv';

export interface MovieDTO {
    id: number;
    mediaType?: MediaType;
    title: string;
    overview: string | null;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string;
    voteAverage: number;
    voteCount: number;
    popularity: number;
    genreIds: number[];
}

export interface MoviePageDTO {
    movies: MovieDTO[];
    page: number;
    totalPages: number;
}

export interface HomeMovieSectionsDTO {
    popular: MovieDTO[];
    animation: MovieDTO[];
    hollywood: MovieDTO[];
    kDrama: MovieDTO[];
    cDrama: MovieDTO[];
}
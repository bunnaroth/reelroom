export interface Review { 
    id: number; 
    user_id: number; 
    tmdb_movie_id: number; 
    content: string; 
    created_at: Date; 
    updated_at: Date; 
}
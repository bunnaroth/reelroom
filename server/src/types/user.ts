export interface User { 
    id: string;
    username: string; 
    email: string; 
    password_hash: string; 
    role: UserRole; 
    created_at: Date; 
    updated_at: Date;
}

export type UserRole = 'user' | 'admin';

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>; 

export type UserDTO = Omit<User, 'password'>;
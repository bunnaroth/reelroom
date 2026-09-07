export interface User { 
    id: number;
    username: string; 
    email: string; 
    passwordHash: string; 
    role: UserRole; 
    createdAt: Date; 
    updatedAt: Date;
}

export type UserRole = 'user' | 'admin';

export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
}

export type UserModelInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export type UserDTO = Omit<User, 'passwordHash'>;
import { userModel } from '../models/userModel'; 
import { CreateUserInput, User, UserDTO } from '../types/user'; 

export const userServive = { 

    async createUser(data: CreateUserInput): Promise<User> { 

        const existingUser = await userModel.findByEmail(data.email); 

        if (existingUser) { 
            throw new Error('Email is already registered');
        }

        return await userModel.create(data);
    }, 

    async getUserByEmail(email: string): Promise<User> { 

        const user = await userModel.findByEmail(email); 

        if (!user) { 
            throw new Error('User not found with this email');
        }

        return user; 
    }, 

    async getUserById(id: number): Promise<UserDTO> { 
        const user = await userModel.findById(id); 

        if (!user) { 
            throw new Error('User account does not exist');
        }

        return user;
    }
}
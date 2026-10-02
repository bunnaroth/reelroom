import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import { userService} from './userService.js'; 
import { CreateUserInput, UserDTO } from '../types/user.js';

const JWT_SECRET = process.env.JWT_SECRET || ''; 
const JWT_EXPIRES_IN = '1d'; 
const SALT_ROUNDS = 10; 

export interface AuthResponse { 
    user: UserDTO; 
    token: string;
}

export const authService = { 
    async register(data: CreateUserInput): Promise<AuthResponse> { 

        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS); 

        const newUser = await userService.createUser({ 
            username: data.username,
            email: data.email,
            passwordHash: hashedPassword,
            role: 'user'
        }); 

        const { passwordHash, ...userDto} = newUser; 

        const token = this.generateToken(userDto); 

        return { user: userDto, token}; 
    },

    async getProfile(id: number): Promise<UserDTO> {
        return userService.getUserById(id);
    }, 

    async login(email: string, passwordPlain: string): Promise<AuthResponse> {

        const user = await userService.getUserByEmail(email);

        const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password combination');
        }

        const { passwordHash, ...userDto } = user;

        const token = this.generateToken(userDto); 

        return { user: userDto, token}; 
    }, 

    generateToken(user: UserDTO): string { 
        return jwt.sign( 
            { id: user.id, role: user.role}, 
            JWT_SECRET, 
            { expiresIn: JWT_EXPIRES_IN}
        )
    }
};
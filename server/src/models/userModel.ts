import { pool} from "../config/db.js"; 
import { User, UserModelInput, UserDTO} from "../types/user.js";


export const userModel = {
    async create(data: UserModelInput): Promise<User> {
        const text = `
            INSERT INTO users (username, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role, password_hash AS "passwordHash", created_at AS "createdAt", updated_at AS "updatedAt";
        `;

        const values = [
            data.username,
            data.email.toLowerCase().trim(),
            data.passwordHash,
            data.role || 'user'
        ];

        const result = await pool.query(text, values);
        return result.rows[0];
    },

    async findByEmail(email: string): Promise<User | null> {
        const text = `
            SELECT id, username, email, role, password_hash AS "passwordHash", created_at AS "createdAt", updated_at AS "updatedAt"
            FROM users
            WHERE email = $1
            LIMIT 1;
        `;

        const result = await pool.query(text, [email.toLowerCase().trim()]);
        return result.rows.length ? result.rows[0] : null;
    },

    async findById(id: number): Promise<UserDTO | null> {
        const text = `
            SELECT id, username, email, role, created_at AS "createdAt", updated_at AS "updatedAt"
            FROM users
            WHERE id = $1
            LIMIT 1;
        `;

        const result = await pool.query(text, [id]);
        return result.rows.length ? result.rows[0] : null;
    }
};
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'votre-cle-secrete-tres-securisee';

export const hashPassword = async (password: string): Promise<string> => {
    
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
    
};

export const verifyPassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export interface TokenPayload {
    userId: string;
}

export const generateToken = (user: User): string => {

    const payload: TokenPayload = {
        userId: user.id,
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '1d',
    });

};

export const verifyToken = (token: string): TokenPayload | null => {

    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }

};
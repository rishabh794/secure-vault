import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export const getDataFromToken = (request: NextRequest) => {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1] || '';
        
        if (!token) {
            return null;
        }

        interface DecodedToken {
            id: string;
            [key: string]: unknown;
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decodedToken.id; 
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred');
    }
};
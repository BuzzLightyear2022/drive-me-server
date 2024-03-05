import express from "express";
import session from "express-session";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authenticateToken = (request: express.Request, response: express.Response, next: any) => {
    // @ts-ignore
    const token = request.headers.authorization;
    const secretKey = process.env.SECRET_KEY as string;

    if (!token) {
        return response.status(401).send("Unauthorized");
    }

    jwt.verify(token, secretKey, (error: unknown, user: any) => {
        if (error) {
            console.log(error);
            return response.status(403);
        }

        // @ts-ignore
        request.user = user;
        next();
    });
}

export const app: express.Express = express();
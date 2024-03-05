import express from "express";
import session from "express-session";
import jwt from "jsonwebtoken";

export const authenticateToken = (request: express.Request, response: express.Response, next: any) => {
    // @ts-ignore
    const token = request.headers.authorization;

    if (!token) {
        return response.status(401);
    }

    jwt.verify(token, "secretKey", (error: unknown, user: any) => {
        if (error) {
            return response.status(403);
        }

        // @ts-ignore
        request.user = user;
        next();
    });
}

export const app: express.Express = express();

app.use(session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true
}));
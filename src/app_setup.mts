import express from "express";
import session from "express-session";

export const authenticateToken = (request: Express.Request, response: Express.Response, next: any) => {
    // @ts-ignore
    const token = request.headers.authorization;
    console.log(token);
}

export const app: express.Express = express();

app.use(session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true
}));
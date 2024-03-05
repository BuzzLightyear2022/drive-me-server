import express from "express";

export const authenticateToken = (request: Express.Request, response: Express.Response, next: any) => {
    const token = request.headers.authorization;
    console.log(token);
}

export const app: express.Express = express();
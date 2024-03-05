import express from "express";

export const authenticateToken = (request: Express.Request, response: Express.Response, next: any) => {
	// @ts-ignore
    const token = request.headers;
    console.log(token);
}

export const app: express.Express = express();

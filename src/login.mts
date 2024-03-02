import { app } from "./main.mjs";
import express, { Request } from "express";
import { UsersModel } from "./sql_handler.mjs";

export const getUserData = () => {
    app.post("/login/getUserData", async (request: express.Request, response: express.Response) => {
        const username = request;
	console.log(username);

        try {
            const userData: {
	    	where: { username: string }
	    } = await UsersModel.findOne({
                where: {
                    username: username
                }
            });

            if (userData) {
                return response.json(userData.dataValues);
            }
        } catch (error) {
            return error;
        }
    });
}

export const getSessionData = () => {
    app.post("/login/getSessionData", async (request: express.Request, response: express.Response) => {
        console.log(request);
    });
}

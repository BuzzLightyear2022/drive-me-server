import { app } from "./app_setup.mjs";
import express from "express";
import { UsersModel } from "./sql_handler.mjs";

app.use(express.json());

export const getUserData = async () => {
    app.post("/login/getUserData", async (request: express.Request, response: express.Response) => {
        const username = request.body.username;

        try {
            const userData = await UsersModel.findOne({
                where: {
                    username: username
                }
            });

	    console.log(userData.dataValues);

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

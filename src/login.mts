import { app } from "./main.mjs";
import express from "express";
import { Users } from "./@types/types.js";
import { UsersModel } from "./table_definition.mjs";

export class loginProcess {
    static getUserData = () => {
        app.post("/login/getUserData", async (request: express.Request, response: express.Response) => {
            const username = request.body.username;

            try {
                const userData = await UsersModel.findOne({
                    where: {
                        username: username
                    }
                });

                if (userData) {
                    console.log(userData.dataValues);
                    return response.json(userData.dataValues);
                }
            } catch (error) {
                return error;
            }
        });
    }
}
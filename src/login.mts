import { app } from "./app_setup.mjs";
import express from "express";
import { UsersModel } from "./sql_handler.mjs";
import * as bcrypt from "bcrypt";

app.use(express.json());

export const getSessionData = async () => {
    app.post("/login/getSessionData", async (request: express.Request, response: express.Response) => {
        const username = request.body.username;
        const password = request.body.password;

        try {
            const userData = await UsersModel.findOne({
                where: {
                    username: username
                }
            });

            if (userData) {
                const hashedPassword: string = userData.dataValues.hashed_password;

                const isPwCorrect = await bcrypt.compare(password, hashedPassword);

                if (isPwCorrect) {
                    const csrfToken: string = crypto.randomUUID();
                    console.log(csrfToken);
                    return response.json({
                        token: "token"
                    });
                } else {
                    return response.json({
                        error: "Invalid username or password"
                    });
                }
            }
        } catch (error) {
            return "An error occurred";
        }
    });
}
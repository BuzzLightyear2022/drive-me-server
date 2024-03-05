import { app } from "./app_setup.mjs";
import express from "express";
import session from "express-session";
import { UsersModel } from "./sql_handler.mjs";
import * as bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

app.use(express.json());

export const getSessionData = async () => {
    app.post("/login/getSessionData", async (request: express.Request, response: express.Response) => {
        const secretKey = process.env.SECRET_KEY as string;

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
                    const payload = {
                        userID: userData.dataValues.id,
                        username: userData.dataValues.username
                    }

                    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

                    return response.json(token);
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

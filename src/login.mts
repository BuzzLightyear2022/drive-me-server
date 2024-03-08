import { app } from "./main.mjs";
import express from "express";
import { UsersModel } from "./sql_setup.mjs";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

app.use(express.json());

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

export const getSessionData = () => {
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
};
import { app } from "./main.mjs";
import express from "express";
import { UserModel } from "./sql_setup.mjs";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

export const authenticateToken = (request: express.Request, response: express.Response, next: any) => {
    const token = request.header("Authorization");
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

(async () => {
    app.post("/login/getSessionData", async (request: express.Request, response: express.Response) => {
        console.log(true);
        const secretKey = process.env.SECRET_KEY as string;

        const username = request.body.username;
        const password = request.body.password;

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hashedPassword) => {
                // ハッシュ化されたパスワードを表示
                console.log(hashedPassword);
            });
        });

        try {
            const userData = await UserModel.findOne({
                where: {
                    username: username
                }
            });

            if (!userData) {
                return response.status(401).json({
                    error: "udn"
                });
            }

            const hashedPassword: string = userData.dataValues.hashed_password;
            const isPwCorrect = await bcrypt.compare(password, hashedPassword);

            if (!isPwCorrect) {
                return response.status(401).json({
                    error: "ipw"
                });
            }

            const payload = {
                userID: userData.dataValues.id,
                username: userData.dataValues.username
            }

            const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

            return response.status(200).json(token);
        } catch (error) {
            return response.status(500).json({
                error: "An error occurred"
            });
        }
    });
})();

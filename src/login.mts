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

    if (!token) return response.sendStatus(401);
    if (!secretKey) return response.sendStatus(500).json({ message: "Server configuration error" })

    jwt.verify(token, secretKey, (error: jwt.VerifyErrors | null, user: any) => {
        if (error) {
            if (error.name === "TokenExpiredError") {
                return response.status(401).json({ message: "Token expired" })
            }
            return response.sendStatus(403);
        }

        request.user = user;
        next();
    });
}

(async () => {
    app.post("/login/getSessionData", async (request: express.Request, response: express.Response) => {
        const secretKey: string | undefined = process.env.SECRET_KEY;
        if (!secretKey) return response.sendStatus(500).json({ message: "Server Configuration error" });

        const username = request.body.username;
        const password = request.body.password;

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hashedPassword) => {
                // ハッシュ化されたパスワードを表示
                // console.log(hashedPassword);
            });
        });

        try {
            const userData = await UserModel.findOne({ where: { username: username } });

            if (!userData) return response.status(401).json({ error: "udn" });

            if (userData && userData.dataValues.is_locked) return response.status(403).json({ error: "locked" });

            const hashedPassword: string = userData.dataValues.hashed_password;
            const isPwCorrect = await bcrypt.compare(password, hashedPassword);

            if (!isPwCorrect) {
                userData.setDataValue("failed_attempts", userData.dataValues.failed_attempts + 1);

                if (userData.dataValues.failed_attempts >= 3) {
                    userData.setDataValue("is_locked", true);
                }

                await userData.save();
                return response.status(401).json({ error: "ipw" });
            }

            userData.setDataValue("failed_attempts", 0);
            userData.setDataValue("is_locked", false);
            await userData.save();

            const payload = { userID: userData.dataValues.id, username: userData.dataValues.username };
            const token = jwt.sign(payload, secretKey, { expiresIn: "8h" });

            return response.status(200).json(token);
        } catch (error) {
            return response.status(500).json({ error: "An error occurred" });
        }
    });
})();

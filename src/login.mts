import { app } from "./main.mjs";
import express from "express";
import session from "express-session";
import { UserModel } from "./sql_setup.mjs";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otplib from "otplib";
import qrcode from "qrcode";
import { encrypt } from "./common_modules/encrypt.mjs";
import { decrypt } from "./common_modules/decrypt.mjs";
import { checkMFASecretInDatabase } from "./common_modules/check_MFA_secret_in_database.mjs";
import dotenv from "dotenv"
dotenv.config();

declare module "express-session" {
    interface SessionData {
        userId: string;
    }
}

const generateMFASecret = async (userId: string) => {
    const userData = await UserModel.findOne({ where: { id: userId } });

    if (userData) {
        const secret = otplib.authenticator.generateSecret();
        const atpauth = otplib.authenticator.keyuri(userData.dataValues.username, "drive-me", secret);

        const encryptedSecret = encrypt(secret);

        if (encryptedSecret) {
            userData.setDataValue("mfa_secret", encryptedSecret);
            await userData.save();
        }

        const qrCodeUrl = await qrcode.toDataURL(atpauth);
        return qrCodeUrl;
    }
}

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

const verifyMfaToken = async (userId: string, mfaToken: string) => {
    const userData = await UserModel.findOne({ where: { id: userId } });

    if (userData) {
        const encryptedSecret = userData.dataValues.mfa_secret;

        const decryptedSecret = decrypt(encryptedSecret);

        if (decryptedSecret) {
            const isMfaValid = otplib.authenticator.check(mfaToken, decryptedSecret);

            if (isMfaValid) {
                return true;
            } else {
                return false;
            }
        }
    }
}

app.post("/login/userAuthentication", async (request, response) => {
    const username = request.body.username;
    const password = request.body.password;

    try {
        const userData = await UserModel.findOne({ where: { username: username } });

        if (!userData) return response.status(401).json({ error: "Invalid username or password" });

        if (userData && userData.dataValues.is_locked) return response.status(403).json({ error: "Account is locked" });

        const hashedPassword = userData.dataValues.hashed_password;
        const isPwCorrect = await bcrypt.compare(password, hashedPassword);

        if (!isPwCorrect) {
            userData.setDataValue("failed_attempts", userData.dataValues.failed_attempts + 1);

            if (userData.dataValues.failed_attempts >= 3) {
                userData.setDataValue("is_locked", true);
            }

            await userData.save();

            return response.status(401).json({ error: "Invalid username or password" });
        }

        const mfaExists = !!userData.dataValues.mfa_secret;

        return response.status(200).json({
            message: "Password vilidated, proceed to MFA",
            userId: userData.dataValues.id,
            mfaExists: mfaExists
        });
    } catch (error: unknown) {
        return response.status(500).json({ error: "An error occurred" });
    }
});

app.post("/generateMFASecret", async (request, response) => {
    const userId: string = request.body.userId;
    generateMFASecret(userId);
});

app.post("/verify-mfa", async (request, response) => {
    const userId = request.body.userId;
    const mfaToken = request.body.mfaToken;

    try {
        const userData = await UserModel.findOne({ where: { id: userId } });

        if (!userData) return response.status(401).json({ error: "User not found" });

        const mfaSecret = userData.dataValues.mfa_secret;
        const isMfaValid = otplib.authenticator.check(mfaToken, mfaSecret);

        if (!isMfaValid) {
            return response.status(401).json({ error: "Invalid MFA token" });
        }

        const secretKey: string | undefined = process.env.SECRET_KEY;
        const payload = { userId: userData.dataValues.id, username: userData.dataValues.username }

        if (!secretKey) return response.sendStatus(500).json({ message: "Server Configuration error" });

        const token = jwt.sign(payload, secretKey, { expiresIn: "10h" });

        return response.status(200).json({ token });
    } catch (error) {
        return response.status(500).json({ error: "An error occurred" });
    }
});

app.post("/api/check-mfa-secret", (request, response) => {
    const userId = request.session.userId;

    if (userId) {
        const isRegistered = checkMFASecretInDatabase(userId);
        response.json({ isRegistered: isRegistered });
    }
});

// (async () => {
//     app.post("/login/userAuthentication", async (request: express.Request, response: express.Response) => {
//         const username = request.body.username;
//         const password = request.body.password;

//         bcrypt.genSalt(10, (err, salt) => {
//             bcrypt.hash(password, salt, (err, hashedPassword) => {
//                 // ハッシュ化されたパスワードを表示
//                 // console.log(hashedPassword);
//             });
//         });

//         try {
//             const userData = await UserModel.findOne({ where: { username: username } });

//             if (!userData) return response.status(401).json({ error: "udn" });

//             if (userData && userData.dataValues.is_locked) return response.status(403).json({ error: "locked" });

//             const hashedPassword: string = userData.dataValues.hashed_password;
//             const isPwCorrect = await bcrypt.compare(password, hashedPassword);

//             if (!isPwCorrect) {
//                 userData.setDataValue("failed_attempts", userData.dataValues.failed_attempts + 1);

//                 if (userData.dataValues.failed_attempts >= 3) {
//                     userData.setDataValue("is_locked", true);
//                 }

//                 await userData.save();
//                 return response.status(401).json({ error: "ipw" });
//             }

//             userData.setDataValue("failed_attempts", 0);
//             userData.setDataValue("is_locked", false);
//             await userData.save();
//         } catch (error) {
//             return response.status(500).json({ error: "An error occurred" });
//         }
//     });
// })();

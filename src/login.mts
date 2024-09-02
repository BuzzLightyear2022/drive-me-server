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
        console.log("generated secret: ", secret);
        const atpauth = otplib.authenticator.keyuri(userData.dataValues.username, "drive-me", secret);

        const encryptedSecret = encrypt(secret);

        if (encryptedSecret && !userData.dataValues.mfa_enabled) {
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

        const mfaEnabled: boolean = !!userData.dataValues.mfa_enabled;

        userData.setDataValue("failed_attempts", 0);
        await userData.save();

        return response.status(200).json({
            message: "Password vilidated, proceed to MFA",
            userId: userData.dataValues.id,
            mfaEnabled: mfaEnabled
        });
    } catch (error: unknown) {
        return response.status(500).json({ error: "An error occurred" });
    }
});

app.post("/login/generateMFASecret", async (request, response) => {
    const userId: string = request.body.userId;
    const MFASecret: string | undefined = await generateMFASecret(userId);
    return response.status(200).json({ MFASecretImage: MFASecret });
});

app.post("/login/verifyMFAToken", async (request, response) => {
    const userId: string = request.body.userId;
    const mfaToken: string = request.body.MFAToken;
    const isMFASetup: boolean = request.body.isMFASetup;
    const isFinalStep: boolean = request.body.isFinalStep;

    try {
        const userData = await UserModel.findOne({ where: { id: userId } });

        if (!userData) return response.status(401).json({ error: "User not found" });

        const mfaSecret: string | null = decrypt(userData.dataValues.mfa_secret);
        const isMFAEnabled: boolean = userData.dataValues.mfa_enabled;
        const isLocked: boolean = userData.dataValues.is_locked;

        if (!isMFASetup) {
            if (isMFAEnabled && !isLocked) {
                if (!mfaSecret) {
                    return response.status(400).json({ error: "MFA secret not found" });
                }

                const isMFAValid: boolean = otplib.authenticator.check(mfaToken, mfaSecret);

                if (!isMFAValid) {
                    userData.setDataValue("failed_attempts", userData.dataValues.failed_attempts + 1);

                    if (userData.dataValues.failed_attempts >= 3) {
                        userData.setDataValue("is_locked", true);
                    }

                    await userData.save();

                    return response.status(401).json({ error: "Invalid MFA token" });
                } else {
                    const secretKey = process.env.SECRET_KEY;
                    const payload = {
                        userId: userData.dataValues.id,
                        username: userData.dataValues.username,
                        role: userData.dataValues.role
                    };

                    if (!secretKey) return response.status(500).json({ message: "Server Configuration error" });

                    const token = jwt.sign(payload, secretKey, { expiresIn: "10h" });

                    userData.setDataValue("failed_attempts", 0);
                    await userData.save();

                    return response.status(200).json({
                        message: "MFA Authentication success",
                        accessToken: token,
                        isMFASetup: false,
                        isFinalStep: false
                    });
                }
            } else {
                return response.status(403).json("Access denied, Please contact support");
            }
        }

        if (isMFASetup) {
            if (mfaSecret) {
                const isMfaValid = otplib.authenticator.check(mfaToken, mfaSecret);

                if (!isMfaValid && isLocked) {
                    return response.status(403).json({ error: "Access denied, Please contanct support" });
                } else if (!isMfaValid) {
                    userData.setDataValue("failed_attempts", userData.dataValues.failed_attempts + 1);
                    await userData.save();

                    if (userData.dataValues.failed_attempts >= 3) {
                        userData.setDataValue("is_locked", true);
                        await userData.save();
                    }

                    return response.status(401).json({ error: "Invalid MFA token" });
                }
            }

            if (isFinalStep) {
                const previousTimestamp: number = userData.dataValues.mfa_timestamp;
                const previousWindow: number = Math.floor(previousTimestamp / 30000);
                const currentWindow: number = Math.floor(Date.now() / 30000);

                if (previousWindow === currentWindow) {
                    return response.status(401).json({ error: "The second token must be from a diffenrent time window" });
                }

                userData.setDataValue("mfa_enabled", true);
                userData.setDataValue("failed_attempts", 0);
                await userData.save();

                return response.status(200).json({
                    message: "MFA has been successfully enabled",
                    success: true,
                    userId: userId,
                    isMFASetup: true,
                    isFinalStep: true
                });
            } else {
                userData.setDataValue("mfa_timestamp", Date.now());
                userData.setDataValue("failed_attempts", 0);
                await userData.save();

                return response.status(200).json({
                    message: "First MFA token is valid, proceed to the second MFA verification",
                    success: true,
                    userId: userId,
                    isMFASetup: true,
                    isFinalStep: false
                });
            }
        }
    } catch (error) {
        return response.status(500).json({ error: "An error occurred" });
    }
});
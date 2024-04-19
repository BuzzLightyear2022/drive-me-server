import { app, wssServer } from "./main.mjs";
import multer from "multer";
import express from "express";
import { Model } from "sequelize";
import fs from "fs";
import WebSocket from "ws";
import path from "path";
import { authenticateToken } from "./login.mjs";
import { RentalCarModel, ReservationModel } from "./sql_setup.mjs";
import { RentalCar, Reservation } from "./@types/types.js";
import { updateRentalCarAndNotify } from "./common_modules.mjs";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

(async () => {
    app.post("/sqlUpdate/vehicleAttributes", authenticateToken, upload.fields([
        { name: "imageUrl" },
        { name: "data" }
    ]), async (request: express.Request, response: express.Response) => {
        const newVehicleAttributes: RentalCar = JSON.parse(request.body["data"]);
        const targetDirectoryPath: string = path.join(".", "car_images");

        const imageFiles: {
            [fieldname: string]:
            | Express.Multer.File[]
            | null
        } = request.files as {
            [fieldname: string]:
            | Express.Multer.File[]
            | null
        };

        if (!fs.existsSync(targetDirectoryPath)) {
            fs.mkdirSync(targetDirectoryPath);
        }

        try {
            const existingVehicleAttributes: Model<RentalCar, RentalCar> | null = await RentalCarModel.findByPk(newVehicleAttributes.id);
            const existingVehicleAttributesJson: RentalCar | undefined = existingVehicleAttributes?.get({ plain: true });

            if (existingVehicleAttributes) {
                if (imageFiles && Array.isArray(imageFiles["imageUrl"]) && imageFiles["imageUrl"].length > 0) {
                    const imageDataField: Express.Multer.File = imageFiles["imageUrl"][0];
                    const bufferImageUrl: Buffer = imageDataField.buffer;
                    const fileName: string = imageDataField.originalname;

                    if (existingVehicleAttributesJson && existingVehicleAttributesJson.imageFileName) {
                        const currentImagePath = path.join(targetDirectoryPath, existingVehicleAttributesJson.imageFileName);
                        fs.access(currentImagePath, fs.constants.F_OK, async (imageNotFoundError: unknown) => {
                            if (imageNotFoundError) {
                                await updateRentalCarAndNotify(fileName, bufferImageUrl, existingVehicleAttributes, newVehicleAttributes);
                            } else {
                                fs.unlink(currentImagePath, async (unlinkError: unknown) => {
                                    await updateRentalCarAndNotify(fileName, bufferImageUrl, existingVehicleAttributes, newVehicleAttributes);
                                });
                            }
                        });
                    } else {
                        await updateRentalCarAndNotify(fileName, bufferImageUrl, existingVehicleAttributes, newVehicleAttributes);
                    }
                } else {
                    if (existingVehicleAttributesJson && existingVehicleAttributesJson.imageFileName) {
                        const currentImagePath = path.join(targetDirectoryPath, existingVehicleAttributesJson.imageFileName);
                        fs.access(currentImagePath, fs.constants.F_OK, async (imageNotFoundError: unknown) => {
                            if (imageNotFoundError) {
                                newVehicleAttributes.imageFileName = null;
                                await existingVehicleAttributes.update(newVehicleAttributes);

                                wssServer.clients.forEach(async (client: WebSocket) => {
                                    client.send("wssUpdate:vehicleAttributes");
                                });
                            } else {
                                fs.unlink(currentImagePath, async (unlinkError: unknown) => {
                                    newVehicleAttributes.imageFileName = null;
                                    await existingVehicleAttributes.update(newVehicleAttributes);

                                    wssServer.clients.forEach(async (client: WebSocket) => {
                                        client.send("wssUpdate:vehicleAttributes");
                                    });
                                });
                            }
                        });
                    } else {
                        await existingVehicleAttributes.update(newVehicleAttributes);

                        wssServer.clients.forEach(async (client: WebSocket) => {
                            client.send("wssUpdate:vehicleAttributes");
                        });
                    }
                }
            }
            return response.status(200);
        } catch (error: unknown) {
            return response.status(500).send(`Failed to updata data on the database: ${error}`);
        }
    });
})();

(async () => {
    app.post("/sqlUpdate/reservationData", authenticateToken, upload.fields([
        { name: "data" }
    ]), async (request: express.Request, response: express.Response) => {
        try {
            const updateFields: Reservation = JSON.parse(request.body.data);
            await ReservationModel.update(updateFields, {
                where: { id: updateFields.id }
            });

            wssServer.clients.forEach((client: WebSocket) => {
                client.send("wssUpdate:reservationData");
            });

            return response.status(200).send("Reservation data saved successfully");
        } catch (error: unknown) {
            return response.status(500).send(`Failed to write reservation data to the database: ${error}`);
        }
    });
})();

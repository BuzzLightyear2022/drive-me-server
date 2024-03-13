import { app, wssServer } from "./main.mjs";
import multer from "multer";
import express from "express";
import { Model } from "sequelize";
import fs from "fs";
import WebSocket from "ws";
import path from "path";
import { authenticateToken } from "./login.mjs";
import { VehicleAttributesModel, ReservationDataModel } from "./sql_setup.mjs";
import { VehicleAttributes, ReservationData } from "./@types/types.js";
import { updateAttributesAndNotify } from "./common_modules.mjs";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

(async () => {
    app.post("/sqlUpdate/vehicleAttributes", authenticateToken, upload.fields([
        { name: "imageUrl" },
        { name: "data" }
    ]), async (request: express.Request, response: express.Response) => {
        const newVehicleAttributes: VehicleAttributes = JSON.parse(request.body["data"]);
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
            const existingVehicleAttributes: Model<VehicleAttributes, VehicleAttributes> | null = await VehicleAttributesModel.findByPk(newVehicleAttributes.id);
            const existingVehicleAttributesJson: VehicleAttributes | undefined = existingVehicleAttributes?.get({ plain: true });

            if (existingVehicleAttributes) {
                if (imageFiles && Array.isArray(imageFiles["imageUrl"]) && imageFiles["imageUrl"].length > 0) {
                    const imageDataField: Express.Multer.File = imageFiles["imageUrl"][0];
                    const bufferImageUrl: Buffer = imageDataField.buffer;
                    const fileName: string = imageDataField.originalname;

                    if (existingVehicleAttributesJson && existingVehicleAttributesJson.imageFileName) {
                        const currentImagePath = path.join(targetDirectoryPath, existingVehicleAttributesJson.imageFileName);
                        fs.access(currentImagePath, fs.constants.F_OK, async (imageNotFoundError: unknown) => {
                            if (!imageNotFoundError) {
                                fs.unlink(currentImagePath, async (unlinkError: unknown) => {
                                    await updateAttributesAndNotify(fileName, bufferImageUrl, existingVehicleAttributes, newVehicleAttributes);
                                });
                            } else {
                                await updateAttributesAndNotify(fileName, bufferImageUrl, existingVehicleAttributes, newVehicleAttributes);
                            }
                        });
                    }
                } else {
                    if (existingVehicleAttributesJson && existingVehicleAttributesJson.imageFileName) {
                        const currentImagePath = path.join(targetDirectoryPath, existingVehicleAttributesJson.imageFileName);
                        fs.access(currentImagePath, fs.constants.F_OK, async (imageNotFoundError: unknown) => {
                            if (!imageNotFoundError) {
                                fs.unlink(currentImagePath, async (unlinkError: unknown) => {
                                    wssServer.clients.forEach(async (client: WebSocket) => {
                                        client.send("wssUpdate:vehicleAttributes");
                                    });
                                });
                            } else {
                                wssServer.clients.forEach(async (client: WebSocket) => {
                                    client.send("wssUpdate:vehicleAttributes");
                                });
                            }
                        });
                    }

                    newVehicleAttributes.imageFileName = null;
                    await existingVehicleAttributes.update(newVehicleAttributes);
                }
            }
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
            const updateFields: ReservationData = JSON.parse(request.body.data);
            await ReservationDataModel.update(updateFields, {
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
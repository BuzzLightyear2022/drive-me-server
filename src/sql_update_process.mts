import { app } from "./app_setup.mjs";
import multer from "multer";
import express from "express";
import { Model } from "sequelize";
import fs from "fs";
import path from "path";
import { VehicleAttributesModel, ReservationDataModel } from "./sql_setup.mjs";
import { VehicleAttributes, ReservationData } from "./@types/types.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

(async () => {
    app.post("/sqlUpdate/vehicleAttributes", upload.fields([
        { name: "imageUrl" },
        { name: "data" }
    ]), async (request: express.Request, response: express.Response) => {
        const newVehicleAttributes: VehicleAttributes = JSON.parse(request.body["data"]);
        const targetDirectoryPath: string = "./car_images/";

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
                if (imageFiles && Array.isArray(imageFiles["imageUrl"])) {
                    const imageDataField: Express.Multer.File = imageFiles["imageUrl"][0];
                    const bufferImageUrl: Buffer = imageDataField.buffer;
                    const fileName: string = imageDataField.originalname;

                    if (existingVehicleAttributesJson && existingVehicleAttributesJson.imageFileName) {
                        const currentImagePath = `./car_images/${existingVehicleAttributesJson.imageFileName}`;

                        fs.access(currentImagePath, fs.constants.F_OK, (imageNotFoundError: unknown) => {
                            if (!imageNotFoundError) {
                                fs.unlink(currentImagePath, (unlinkError: unknown) => {
                                    if (unlinkError) {
                                        console.error(`Failed to delete existing image file: ${unlinkError}`);
                                    }
                                });

                                fs.writeFile(path.join(targetDirectoryPath, fileName), bufferImageUrl, "base64", async (writeError: unknown) => {
                                    if (writeError) {
                                        console.error(`Failed to write new image file: ${writeError}`);
                                    } else {
                                        newVehicleAttributes.imageFileName = fileName;
                                        await existingVehicleAttributes.update(newVehicleAttributes);
                                    }
                                });
                            } else {
                                fs.writeFile(path.join(targetDirectoryPath, fileName), bufferImageUrl, "base64", async (writeError: unknown) => {
                                    if (writeError) {
                                        console.error(`Failed to write new image file: ${writeError}`);
                                    } else {
                                        newVehicleAttributes.imageFileName = fileName;
                                        await existingVehicleAttributes.update(newVehicleAttributes);
                                    }
                                });
                            }
                        });
                    } else {
                        fs.writeFile(path.join(targetDirectoryPath, fileName), bufferImageUrl, "base64", async (writeError: unknown) => {
                            if (writeError) {
                                console.error(`Failed to write new image file: ${writeError}`);
                            } else {
                                newVehicleAttributes.imageFileName = fileName;
                                await existingVehicleAttributes.update(newVehicleAttributes);
                            }
                        });
                    }
                }

                await existingVehicleAttributes.update(newVehicleAttributes);

                // wsServer.clients.forEach(async (client: WebSocket) => {
                // 	client.send("wsUpdate:vehicleAttributes");
                // });
            }
        } catch (error: unknown) {
            return response.status(500).send(`Failed to updata data on the database: ${error}`);
        }
    });
})();

(async () => {
    app.post("/sqlUpdate/reservationData", upload.fields([
        { name: "data" }
    ]), async (request: express.Request, response: express.Response) => {
        try {
            const updateFields: ReservationData = JSON.parse(request.body.data);
            await ReservationDataModel.update(updateFields, {
                where: { id: updateFields.id }
            });

            // wsServer.clients.forEach((client: WebSocket) => {
            // 	client.send("wsUpdate:reservationData");
            // });

            return response.status(200).send("Reservation data saved successfully");
        } catch (error: unknown) {
            return response.status(500).send(`Failed to write reservation data to the database: ${error}`);
        }
    });
})();
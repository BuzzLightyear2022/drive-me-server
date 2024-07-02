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
import { updateRentalCarAndNotify } from "./common_modules/updateRentalcarAndNotify.mjs";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

(async () => {
    app.post("/sqlUpdate/rentalcar", authenticateToken, upload.fields([
        { name: "imageUrl" },
        { name: "data" }
    ]), async (request: express.Request, response: express.Response) => {
        const newRentalcar: RentalCar = JSON.parse(request.body["data"]);
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
            const existingRentalcar: Model<RentalCar, RentalCar> | null = await RentalCarModel.findByPk(newRentalcar.id);
            const existingRentalcarJson: RentalCar | undefined = existingRentalcar?.get({ plain: true });

            if (existingRentalcar) {
                if (imageFiles && Array.isArray(imageFiles["imageUrl"]) && imageFiles["imageUrl"].length > 0) {
                    const imageDataField: Express.Multer.File = imageFiles["imageUrl"][0];
                    const bufferImageUrl: Buffer = imageDataField.buffer;
                    const fileName: string = imageDataField.originalname;

                    if (existingRentalcarJson && existingRentalcarJson.imageFileName) {
                        const currentImagePath = path.join(targetDirectoryPath, existingRentalcarJson.imageFileName);
                        fs.access(currentImagePath, fs.constants.F_OK, async (imageNotFoundError: unknown) => {
                            if (imageNotFoundError) {
                                await updateRentalCarAndNotify({ fileName, bufferImageUrl, existingRentalcar, newRentalcar });
                            } else {
                                fs.unlink(currentImagePath, async (unlinkError: unknown) => {
                                    await updateRentalCarAndNotify({ fileName, bufferImageUrl, existingRentalcar, newRentalcar });
                                });
                            }
                        });
                    } else {
                        await updateRentalCarAndNotify({ fileName, bufferImageUrl, existingRentalcar, newRentalcar });
                    }
                } else {
                    if (existingRentalcarJson && existingRentalcarJson.imageFileName) {
                        newRentalcar.imageFileName = existingRentalcarJson.imageFileName;

                        // const currentImagePath = path.join(targetDirectoryPath, existingVehicleAttributesJson.imageFileName);
                        // fs.access(currentImagePath, fs.constants.F_OK, async (imageNotFoundError: unknown) => {
                        //     if (imageNotFoundError) {
                        //         newVehicleAttributes.imageFileName = null;
                        //         await existingVehicleAttributes.update(newVehicleAttributes);

                        //         wssServer.clients.forEach(async (client: WebSocket) => {
                        //             client.send("wssUpdate:vehicleAttributes");
                        //         });
                        //     } else {
                        //         fs.unlink(currentImagePath, async (unlinkError: unknown) => {
                        //             newVehicleAttributes.imageFileName = null;
                        //             await existingVehicleAttributes.update(newVehicleAttributes);

                        //             wssServer.clients.forEach(async (client: WebSocket) => {
                        //                 client.send("wssUpdate:vehicleAttributes");
                        //             });
                        //         });
                        //     }
                        // });
                    }
                    await existingRentalcar.update(newRentalcar);

                    wssServer.clients.forEach(async (client) => {
                        client.send("wssUpdate:rentalcar")
                    });
                    // else {
                    //     await existingVehicleAttributes.update(newVehicleAttributes);

                    //     wssServer.clients.forEach(async (client: WebSocket) => {
                    //         client.send("wssUpdate:vehicleAttributes");
                    //     });
                    // }
                }
            }
            return response.status(200).send();
        } catch (error: unknown) {
            return response.status(500).send(`Failed to updata data on the database: ${error}`);
        }
    });
})();

(async () => {
    app.post("/sqlUpdate/reservation", authenticateToken, upload.fields([
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

            console.log("sql_update_process.mts L114");
            return response.status(200).send("reservation updated");
        } catch (error: unknown) {
            return response.status(500).send(`Failed to write reservation data to the database: ${error}`);
        }
    });
})();

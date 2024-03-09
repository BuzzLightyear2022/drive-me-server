import { app } from "./main.mjs";
import multer from "multer";
import express from "express";
import fs from "fs";
import path from "path";
import { Model } from "sequelize";
import { VehicleAttributesModel, ReservationDataModel } from "./sql_setup.mjs";
import { VehicleAttributes, ReservationData } from "./@types/types.js";

console.log("sql insert");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

(async () => {
    app.post("/sqlInsert/vehicleAttributes", upload.fields([
        { name: "imageUrl" },
        { name: "data" }
    ]), (request: express.Request, response: express.Response) => {
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

        const jsonData: VehicleAttributes = JSON.parse(request.body["data"]);
        console.log(jsonData);

        if (!fs.existsSync(targetDirectoryPath)) {
            fs.mkdirSync(targetDirectoryPath);
        }

        if (imageFiles && Array.isArray(imageFiles["imageUrl"])) {
            const imageDataField: Express.Multer.File = imageFiles["imageUrl"][0];
            const bufferImageUrl: Buffer = imageDataField.buffer;
            const fileName: string = imageDataField.originalname;

            if (!fileName.endsWith(".jpeg") && !fileName.endsWith(".jpg" || "png")) {
                return response.status(400).send("Invalid file format. Expected JPEG file.");
            }

            jsonData.imageFileName = fileName;

            fs.writeFile(targetDirectoryPath + fileName, bufferImageUrl, "base64", (error: unknown) => {
                if (error) {
                    return response.status(500).send("Failed to write image file: " + error);
                }
            });
        }
        try {
            VehicleAttributesModel.create(jsonData);
            return response.status(200).send("Data saved successfully");
        } catch (error: unknown) {
            return response.status(500).send("failed to write data to the database: " + error);
        }
    });
})();

(async () => {
    app.post("/sqlInsert/reservationData", upload.fields([
        { name: "data" }
    ]), async (request: express.Request, response: express.Response) => {
        const jsonData: ReservationData = JSON.parse(request.body.data);
        try {
            ReservationDataModel.create(jsonData);
            return response.status(200).send("Reservation data saved successfully");
        } catch (error: unknown) {
            return response.status(500).send(`Failed to write reservation data to the database: ${error}`);
        }
    });
})();
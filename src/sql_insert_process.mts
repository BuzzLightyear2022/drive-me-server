import { app, wssServer } from "./main.mjs";
import multer from "multer";
import express from "express";
import fs from "fs";
import WebSocket from "ws";
import { RentalCarModel, ReservationModel, RentalCarStatusModel, LoanerRentalReservationModel, UserModel } from "./sql_setup.mjs";
import { RentalCar, Reservation, RentalCarStatus, LoanerRentalReservation } from "./@types/types.js";
import { authenticateToken } from "./login.mjs";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

(async () => {
    app.post("/sqlInsert/user", authenticateToken, upload.fields([
        { name: "userData" }
    ]), async (request: express.Request, response: express.Response) => {
        console.log(request.body);
        const userData = JSON.parse(request.body["userData"]);

        try {
            UserModel.create(userData);
            return response.status(200).send();
        } catch (error: unknown) {
            return response.status(500).json({
                error: error
            });
        }
    });
})();

(async () => {
    app.post("/sqlInsert/vehicleAttributes", authenticateToken, upload.fields([
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

        const jsonData: RentalCar = JSON.parse(request.body["data"]);

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
            RentalCarModel.create(jsonData);
            wssServer.clients.forEach(async (client: WebSocket) => {
                client.send("wss:update");
            });
            return response.status(200).send("Data saved successfully");
        } catch (error: unknown) {
            return response.status(500).send("failed to write data to the database: " + error);
        }
    });
})();

(async () => {
    app.post("/sqlInsert/reservation", authenticateToken, upload.fields([
        { name: "data" }
    ]), async (request: express.Request, response: express.Response) => {
        const jsonData: Reservation = JSON.parse(request.body.data);
        try {
            ReservationModel.create(jsonData);
            wssServer.clients.forEach(async (client: WebSocket) => {
                client.send("wss:update");
            })
            return response.status(200).send();
        } catch (error: unknown) {
            return response.status(500).send(`Failed to write reservation data to the database: ${error}`);
        }
    });
})();

(async () => {
    app.post("/sqlInsert/rentalCarStatus", authenticateToken, async (request: express.Request, response: express.Response) => {
        const rentalCarStatus: RentalCarStatus = request.body.rentalCarStatus;

        try {
            RentalCarStatusModel.create(rentalCarStatus);
            wssServer.clients.forEach(async (client: WebSocket) => {
                client.send("wss:update");
            });
            return response.status(200).send("rentalcar status inserted.");
        } catch (error: unknown) {
            return response.status(500).send(error);
        }
    });
})();

(async () => {
    app.post("/sqlInsert/loanerRentalReservation", authenticateToken, async (request: express.Request, response: express.Response) => {
        const loanerRentalReservation: LoanerRentalReservation = request.body.loanerRentalReservation;

        try {
            LoanerRentalReservationModel.create(loanerRentalReservation);
            wssServer.clients.forEach(async (client: WebSocket) => {
                client.send("wss:update");
            });
        } catch (error: unknown) {
            return response.status(500).send();
        }

        console.log(loanerRentalReservation);
    });
})();
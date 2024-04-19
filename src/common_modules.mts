import fs from "fs";
import path from "path";
import { Model } from "sequelize";
import WebSocket from "ws";
import { wssServer } from "./main.mjs";
import { RentalCar } from "./@types/types.js";

export const updateRentalCarAndNotify = async (fileName: string, bufferImageUrl: Buffer, existingVehicleAttributes: Model<RentalCar, RentalCar>, newRentalCar: RentalCar) => {
    const targetDirectoryPath: string = path.join(".", "car_images");

    fs.writeFile(path.join(targetDirectoryPath, fileName), bufferImageUrl, "base64", async (writeError: unknown) => {
        if (writeError) {
            console.error(`Failed to write new image file: ${writeError}`);
        } else {
            newRentalCar.imageFileName = fileName;
            await existingVehicleAttributes.update(newRentalCar);

            wssServer.clients.forEach(async (client: WebSocket) => {
                client.send("wssUpdate:vehicleAttributes");
            });
        }
    });
}
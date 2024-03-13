import fs from "fs";
import path from "path";
import { Model } from "sequelize";
import WebSocket from "ws";
import { wssServer } from "./main.mjs";
import { VehicleAttributes } from "./@types/types.js";

export const updateAttributesAndNotify = async (fileName: string, bufferImageUrl: Buffer, existingVehicleAttributes: Model<VehicleAttributes, VehicleAttributes>, newVehicleAttributes: VehicleAttributes) => {
    const targetDirectoryPath: string = "./car_images/";

    fs.writeFile(path.join(targetDirectoryPath, fileName), bufferImageUrl, "base64", async (writeError: unknown) => {
        if (writeError) {
            console.error(`Failed to write new image file: ${writeError}`);
        } else {
            newVehicleAttributes.imageFileName = fileName;
            await existingVehicleAttributes.update(newVehicleAttributes);

            wssServer.clients.forEach(async (client: WebSocket) => {
                client.send("wssUpdate:vehicleAttributes");
            });
        }
    });
}
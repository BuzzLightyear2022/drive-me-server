import fs from "fs";
import path from "path";
import { Model } from "sequelize";
import { wssServer } from "../main.mjs";
import { RentalCar } from "../@types/types.js";

export const updateRentalCarAndNotify = async (args: { fileName: string, bufferImageUrl: Buffer, existingRentalcar: Model<RentalCar, RentalCar>, newRentalcar: RentalCar }) => {
    const targetDirectoryPath: string = path.join(".", "car_images");
    const newImagePath: string = path.join(targetDirectoryPath, args.fileName);

    fs.writeFileSync(newImagePath, args.bufferImageUrl);

    args.newRentalcar.imageFileName = args.fileName;
    await args.existingRentalcar.update(args.newRentalcar);

    wssServer.clients.forEach(async (client) => {
        client.send("wssUpdate:rentalcar");
    });

    // fs.writeFile(path.join(targetDirectoryPath, fileName), bufferImageUrl, "base64", async (writeError: unknown) => {
    //     if (writeError) {
    //         console.error(`Failed to write new image file: ${writeError}`);
    //     } else {
    //         newRentalCar.imageFileName = fileName;
    //         await existingVehicleAttributes.update(newRentalCar);

    //         wssServer.clients.forEach(async (client: WebSocket) => {
    //             client.send("wssUpdate:rentalcar");
    //         });
    //     }
    // });
}
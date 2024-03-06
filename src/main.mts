import { app } from "./app_setup.mjs";
import * as login from "./login.mjs";
import * as sqlSelectProcess from "./sql_select_process.mjs";
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { Model } from "sequelize";
import { VehicleAttributesModel, ReservationDataModel, UsersModel } from "./sql_setup.mjs";
import { VehicleAttributes, ReservationData } from "./@types/types.js";
import WebSocket from "ws";
import dotenv from "dotenv";
dotenv.config();

// const wsServer = new WebSocket.Server({ noServer: true });

// wsServer.on("connection", (ws) => {
// 	console.log("Client connected");
// });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
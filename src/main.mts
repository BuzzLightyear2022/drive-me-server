import { app } from "./app_setup.mjs";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import https from "https";
import { Model, Sequelize, Op } from "sequelize";
import { VehicleAttributesModel, ReservationDataModel, UsersModel } from "./sql_handler.mjs";
import { Users, VehicleAttributes, ReservationData } from "./@types/types.js";
import WebSocket from "ws";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import { getUserData } from "./login.mjs";

// app.use(csurf({ cookie: true }));
app.use(cors());
app.use("/C2cFbaAZ", express.static("./car_images"));
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
// 	if (err && err.code === "EBADCSRFTOKEN") {
// 		res.status(400).send("Invalid CSRF token");
// 	} else {
// 		next(err);
// 	}
// });

const httpsPort: string = process.env.HTTPS_PORT as string;

const letsencryptDirectory = path.join("/", "etc", "letsencrypt", "live", "drive-me-test.com");
const privateKeyPath = path.join(letsencryptDirectory, "privkey.pem");
const certificatePath = path.join(letsencryptDirectory, "cert.pem");
const chainFilePath = path.join(letsencryptDirectory, "chain.pem");

const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const certificate = fs.readFileSync(certificatePath, "utf8");
const chainFile = fs.readFileSync(chainFilePath, "utf8");

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: chainFile
}

const httpsServer = https.createServer(credentials, app);
// const wsServer = new WebSocket.Server({ noServer: true });

httpsServer.listen(httpsPort, () => {
	console.log(`HTTPS Server running on port: ${httpsPort}`);
});

// wsServer.on("connection", (ws) => {
// 	console.log("Client connected");
// });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

type partOfVehicleAttributes =
	| typeof VehicleAttributesModel["prototype"]["id"]
	| typeof VehicleAttributesModel["prototype"]["carModel"]
	| typeof VehicleAttributesModel["prototype"]["rentalClass"]
	| typeof VehicleAttributesModel["prototype"]["licensePlateRegion"]
	| typeof VehicleAttributesModel["prototype"]["licensePlateCode"]
	| typeof VehicleAttributesModel["prototype"]["licensePlateHiragana"]
	| typeof VehicleAttributesModel["prototype"]["licensePlateNumber"];

getUserData();

const fetchJson = (args: { endPoint: string, fileName: string }): void => {
	const { endPoint, fileName } = args;

	app.post(endPoint, (request: express.Request, response: express.Response): void => {
		const jsonFilePath: string = path.join("json_files", fileName);

		fs.readFile(jsonFilePath, "utf8", (error: unknown, data: string): express.Response => {
			try {
				const jsonData: JSON = JSON.parse(data);
				return response.json(jsonData);
			} catch (parseError: unknown) {
				return response.status(500).json({ "error": parseError });
			}
		});
	});
}

fetchJson({ endPoint: "/fetchJson/carCatalog", fileName: "car_catalog.json" });
fetchJson({ endPoint: "/fetchJson/navigations", fileName: "navigations.json" });

app.post("/sqlSelect/vehicleAttributes", async (request: express.Request, response: express.Response) => {
	try {
		const vehicleAttributes: Model<VehicleAttributes, VehicleAttributes>[] = await VehicleAttributesModel.findAll();
		return response.json(vehicleAttributes);
	} catch (error: unknown) {
		console.error(`Failed to select vehicleAttributes: ${error}`);
		return response.status(500).json({ error: "Internal Server Error." });
	}
});

app.post("/sqlSelect/vehicleAttributesById", async (request: express.Request, response: express.Response) => {
	const vehicleId: string = request.body.vehicleId;

	try {
		const vehicleAttributes: Model<VehicleAttributes, VehicleAttributes> | null = await VehicleAttributesModel.findOne({
			where: {
				id: vehicleId
			}
		});

		if (vehicleAttributes) {
			return response.json(vehicleAttributes);
		} else {
			return response.status(404).json({ error: "VehicleAttributes not found" });
		}
	} catch (error: unknown) {
		console.error(`Failed to select VehicleAttributes by id: ${Error}`);
		return response.status(500).json({ error: error });
	}
});

app.post("/sqlSelect/vehicleAttributesByClass", async (request: express.Request, response: express.Response) => {
	const rentalClass: string = request.body.rentalClass;

	try {
		let whereClause = {};

		if (rentalClass !== null) {
			whereClause = {
				rentalClass: rentalClass
			}
		}

		const vehicleAttributes: Model<VehicleAttributes, VehicleAttributes>[] | null = await VehicleAttributesModel.findAll({
			where: whereClause
		});

		if (vehicleAttributes) {
			return response.json(vehicleAttributes);
		} else {
			return response.status(404).json({ error: "vehicleAttributes not found" });
		}
	} catch (error: unknown) {
		console.error(`Failed to select VehicleAttributes by class ${error}`);
		return response.status(500).json({ error: error });
	}
});

app.post("/sqlSelect/vehicleAttributes/rentalClasses", async (request: express.Request, response: express.Response) => {
	const selectedSmoking: string = request.body["selectedSmoking"];

	try {
		switch (selectedSmoking) {
			case "non-smoking":
				const nonSmokingRentalClasses: partOfVehicleAttributes = await VehicleAttributesModel.findAll({
					attributes: ["rentalClass"],
					where: {
						nonSmoking: true
					},
					group: "rentalClass"
				});
				const nonSmokingRentalClassesArray: string[] = nonSmokingRentalClasses.map((rentalClass: partOfVehicleAttributes): string => {
					return rentalClass.rentalClass;
				});
				return response.json(nonSmokingRentalClassesArray);
			case "ok-smoking":
				const smokingRentalClasses: partOfVehicleAttributes = await VehicleAttributesModel.findAll({
					attributes: ["rentalClass"],
					where: {
						nonSmoking: false
					},
					group: "rentalClass"
				});
				const smokingRentalClassesArray: string[] = smokingRentalClasses.map((rentalClass: partOfVehicleAttributes): string => {
					return rentalClass.rentalClass;
				});
				return response.json(smokingRentalClassesArray);
			case "none-specification":
				const rentalClasses: partOfVehicleAttributes = await VehicleAttributesModel.findAll({
					attributes: ["rentalClass"],
					group: "rentalClass"
				});
				const rentalClassesArray: string[] = rentalClasses.map((rentalClass: partOfVehicleAttributes): string => {
					return rentalClass.rentalClass;
				});
				return response.json(rentalClassesArray);
		}
	} catch (error: unknown) {
		console.error(`failed to fetch rentalClass: ${error}`);
		return response.status(500).json({ error: "Internal Server Error" });
	}
});

app.post("/sqlSelect/vehicleAttributes/carModels", async (request: express.Request, response: express.Response) => {
	const selectedSmoking: string = request.body.selectedSmoking;
	const selectedRentalClass: string = request.body.selectedRentalClass;

	try {
		switch (selectedSmoking) {
			case "non-smoking":
				const nonSmokingCarModels: partOfVehicleAttributes = await VehicleAttributesModel.findAll({
					attributes: ["carModel"],
					where: {
						nonSmoking: true,
						rentalClass: selectedRentalClass
					},
					group: "carModel"
				});
				const nonSmokingRentalClassesArray: string[] = nonSmokingCarModels.map((carModel: partOfVehicleAttributes): string => {
					return carModel.carModel;
				});
				return response.json(nonSmokingRentalClassesArray);
			case "ok-smoking":
				const smokingCarModels: partOfVehicleAttributes = await VehicleAttributesModel.findAll({
					attributes: ["carModel"],
					where: {
						nonSmoking: false,
						rentalClass: selectedRentalClass
					},
					group: "carModel"
				});
				const smokingCarModelsArray: string[] = smokingCarModels.map((carModel: partOfVehicleAttributes): string => {
					return carModel.carModel;
				});
				return response.json(smokingCarModelsArray);
			case "none-specification":
				const carModels: partOfVehicleAttributes = await VehicleAttributesModel.findAll({
					attributes: ["carModel"],
					where: {
						rentalClass: selectedRentalClass
					},
					group: "carModel"
				});
				const carModelsArray: string[] = carModels.map((carModel: partOfVehicleAttributes): string => {
					return carModel.carModel;
				});
				return response.json(carModelsArray);
		}
	} catch (error: unknown) {
		console.error(`failed to fetch carModels: ${error}`);
		return response.status(500).json({ error: "Internal Server Error" });
	}
});

app.post("/sqlSelect/vehicleAttributes/licensePlates", async (request: express.Request, response: express.Response) => {
	const selectedSmoking: string = request.body.selectedSmoking;
	const selectedCarModel: string = request.body.selectedCarModel;

	try {
		switch (selectedSmoking) {
			case "non-smoking":
				const nonSmokingLicensePlates: partOfVehicleAttributes = await VehicleAttributesModel.findAll({
					attributes: ["id", "licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber"],
					where: {
						nonSmoking: true,
						carModel: selectedCarModel
					}
				});
				const nonSmokingLicensePlatesData: string[] = nonSmokingLicensePlates.map((licensePlate: partOfVehicleAttributes) => {
					const licensePlateString: string = `${licensePlate.licensePlateRegion} ${licensePlate.licensePlateCode} ${licensePlate.licensePlateHiragana} ${licensePlate.licensePlateNumber}`;
					const licensePlateData = {
						id: licensePlate.id,
						licensePlate: licensePlateString
					}
					return licensePlateData;
				});
				return response.json(nonSmokingLicensePlatesData);
			case "ok-smoking":
				const smokingLicensePlates: partOfVehicleAttributes = await VehicleAttributesModel.findAll({
					attributes: ["id", "licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber"],
					where: {
						nonSmoking: false,
						carModel: selectedCarModel
					}
				});
				const smokingLicensePlatesData: string[] = smokingLicensePlates.map((licensePlate: partOfVehicleAttributes) => {
					const licensePlateString: string = `${licensePlate.licensePlateRegion} ${licensePlate.licensePlateCode} ${licensePlate.licensePlateHiragana} ${licensePlate.licensePlateNumber}`;
					const licensePlateData = {
						id: licensePlate.id,
						licensePlate: licensePlateString
					}
					return licensePlateData;
				});
				return response.json(smokingLicensePlatesData);
			case "none-specification":
				const licensePlates: partOfVehicleAttributes = await VehicleAttributesModel.findAll({
					attributes: ["id", "licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber"],
					where: {
						carModel: selectedCarModel
					}
				});
				const licensePlatesData: string[] = licensePlates.map((licensePlate: partOfVehicleAttributes) => {
					const licensePlateString: string = `${licensePlate.licensePlateRegion} ${licensePlate.licensePlateCode} ${licensePlate.licensePlateHiragana} ${licensePlate.licensePlateNumber}`;
					const licensePlateData = {
						id: licensePlate.id,
						licensePlate: licensePlateString
					}
					return licensePlateData;
				});
				return response.json(licensePlatesData);
		}
	} catch (error: unknown) {
		console.error(`failed to fetch licensePlates: ${error}`);
		return response.status(500).json({ error: "Internal Server Error" });
	}
});

app.post("/sqlSelect/reservationData/filterByDateRange", async (request: express.Request, response: express.Response) => {
	const startDate: Date = request.body.startDate;
	const endDate: Date = request.body.endDate;

	try {
		const reservationData: Model<ReservationData, ReservationData>[] = await ReservationDataModel.findAll({
			where: {
				[Op.or]: [
					{
						pickupDateObject: {
							[Op.between]: [startDate, endDate]
						}
					},
					{
						returnDateObject: {
							[Op.between]: [startDate, endDate]
						}
					},
					{
						[Op.and]: [
							{ pickupDateObject: { [Op.lte]: startDate } },
							{ returnDateObject: { [Op.gte]: endDate } }
						]
					}
				]
			}
		});

		return response.json(reservationData);
	} catch (error: unknown) {
		console.error(`Failed to select reservation data: ${error}`);
		return response.status(500).json("Internal Server Error.");
	}
});

app.post("/sqlSelect/reservationData/selectById", async (request: express.Request, response: express.Response) => {
	const reservationId: string = request.body.reservationId;

	try {
		const reservationDataById: Model<ReservationData, ReservationData> | null = await ReservationDataModel.findOne({
			where: {
				id: reservationId
			}
		});

		if (reservationDataById) {
			return response.json(reservationDataById);
		} else {
			return response.status(404).json({ error: "Reservation not found" });
		}
	} catch (error: unknown) {
		console.error(`Failed to select reservation data by id: ${error}`);
		return response.status(500).json(`Internal server error: ${error}`);
	}
});

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
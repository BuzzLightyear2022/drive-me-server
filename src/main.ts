require("dotenv").config();

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import https from "https";
import { DataTypes, Model, ModelStatic, Sequelize, Op, where } from "sequelize";
import { Users, VehicleAttributes, ReservationData } from "./@types/types";
import WebSocket from "ws";

const bcrypt = require("bcrypt");

const app: express.Express = express();
app.use(express.json());
app.use(cors());
app.use("/C2cFbaAZ", express.static("./car_images"));

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
const wsServer = new WebSocket.Server({ noServer: true });

httpsServer.listen(httpsPort, () => {
	console.log(`HTTPS Server running on port: ${httpsPort}`);
});

wsServer.on("connection", (ws) => {
	console.log("Client connected");
});

const rds_host: string = process.env.RDS_HOST as string;
const rds_user: string = process.env.RDS_USER as string;
const rds_password: string = process.env.RDS_PASSWORD as string;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const sqlConnection: Sequelize = new Sequelize(
	"drive_me_test_since20230703",
	rds_user,
	rds_password,
	{
		host: rds_host,
		dialect: "mysql"
	}
);

const VehicleAttributes: ModelStatic<Model<VehicleAttributes>> = sqlConnection.define("VehicleAttribute", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	imageFileName: DataTypes.STRING,
	carModel: DataTypes.STRING,
	modelCode: DataTypes.STRING,
	nonSmoking: DataTypes.BOOLEAN,
	insurancePriority: DataTypes.BOOLEAN,
	licensePlateRegion: DataTypes.STRING,
	licensePlateCode: DataTypes.STRING,
	licensePlateHiragana: DataTypes.STRING,
	licensePlateNumber: DataTypes.STRING,
	bodyColor: DataTypes.STRING,
	driveType: DataTypes.STRING,
	seatingCapacity: DataTypes.INTEGER,
	transmission: DataTypes.STRING,
	rentalClass: DataTypes.STRING,
	navigation: DataTypes.STRING,
	hasBackCamera: DataTypes.BOOLEAN,
	hasDVD: DataTypes.BOOLEAN,
	hasTelevision: DataTypes.BOOLEAN,
	hasExternalInput: DataTypes.BOOLEAN,
	hasSpareKey: DataTypes.BOOLEAN,
	hasJAFCard: DataTypes.BOOLEAN,
	JAFCardNumber: DataTypes.STRING,
	JAFCardExp: DataTypes.DATE,
	otherFeatures: DataTypes.TEXT,
});

const Reservation: ModelStatic<Model<ReservationData>> = sqlConnection.define('Reservation', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	vehicleId: DataTypes.INTEGER,
	reservationName: DataTypes.STRING,
	rentalCategory: DataTypes.STRING,
	pickupLocation: DataTypes.STRING,
	returnLocation: DataTypes.STRING,
	pickupDateObject: DataTypes.DATE,
	returnDateObject: DataTypes.DATE,
	nonSmoking: DataTypes.STRING,
	comment: DataTypes.TEXT
});

const Users: ModelStatic<Model<Users>> = sqlConnection.define("Users", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false
	},
	hashed_password: {
		type: DataTypes.STRING,
		allowNull: false
	}
})

type partOfVehicleAttributes =
	| typeof VehicleAttributes["prototype"]["id"]
	| typeof VehicleAttributes["prototype"]["carModel"]
	| typeof VehicleAttributes["prototype"]["rentalClass"]
	| typeof VehicleAttributes["prototype"]["licensePlateRegion"]
	| typeof VehicleAttributes["prototype"]["licensePlateCode"]
	| typeof VehicleAttributes["prototype"]["licensePlateHiragana"]
	| typeof VehicleAttributes["prototype"]["licensePlateNumber"];

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

app.post("/login/sendUserData", async (request: express.Request, response: express.Response) => {
	const username = request.body.username;
	const inputtedPassword = request.body.password;
	const pPassword = request.body.pPassword;

	try {
		const userData = await Users.findOne({
			where: {
				username: username
			}
		});

		if (userData) {
			const username = userData.dataValues.username;

			// await bcrypt.compare(pPassword, storedPassword, (err: unknown, result: boolean) => {
			// 	if (err) {
			// 		console.error(err);
			// 	} else {
			// 		if (result) {
			// 			console.log(result);
			// 		} else {
			// 			console.log(result);
			// 		}
			// 	}
			// });
		}
	} catch (error) {
		return error;
	}
});

app.post("/sqlSelect/vehicleAttributes", async (request: express.Request, response: express.Response) => {
	try {
		const vehicleAttributes: Model<VehicleAttributes, VehicleAttributes>[] = await VehicleAttributes.findAll();
		return response.json(vehicleAttributes);
	} catch (error: unknown) {
		console.error(`Failed to select vehicleAttributes: ${error}`);
		return response.status(500).json({ error: "Internal Server Error." });
	}
});

app.post("/sqlSelect/vehicleAttributesById", async (request: express.Request, response: express.Response) => {
	const vehicleId: string = request.body.vehicleId;

	try {
		const vehicleAttributes: Model<VehicleAttributes, VehicleAttributes> | null = await VehicleAttributes.findOne({
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

		const vehicleAttributes: Model<VehicleAttributes, VehicleAttributes>[] | null = await VehicleAttributes.findAll({
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
				const nonSmokingRentalClasses: partOfVehicleAttributes = await VehicleAttributes.findAll({
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
				const smokingRentalClasses: partOfVehicleAttributes = await VehicleAttributes.findAll({
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
				const rentalClasses: partOfVehicleAttributes = await VehicleAttributes.findAll({
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
				const nonSmokingCarModels: partOfVehicleAttributes = await VehicleAttributes.findAll({
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
				const smokingCarModels: partOfVehicleAttributes = await VehicleAttributes.findAll({
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
				const carModels: partOfVehicleAttributes = await VehicleAttributes.findAll({
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
				const nonSmokingLicensePlates: partOfVehicleAttributes = await VehicleAttributes.findAll({
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
				const smokingLicensePlates: partOfVehicleAttributes = await VehicleAttributes.findAll({
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
				const licensePlates: partOfVehicleAttributes = await VehicleAttributes.findAll({
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
		const reservationData: Model<ReservationData, ReservationData>[] = await Reservation.findAll({
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
		const reservationDataById: Model<ReservationData, ReservationData> | null = await Reservation.findOne({
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
		VehicleAttributes.create(jsonData);
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
		const existingVehicleAttributes: Model<VehicleAttributes, VehicleAttributes> | null = await VehicleAttributes.findByPk(newVehicleAttributes.id);
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

			wsServer.clients.forEach(async (client: WebSocket) => {
				client.send("wsUpdate:vehicleAttributes");
			});
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
		Reservation.create(jsonData);
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
		await Reservation.update(updateFields, {
			where: { id: updateFields.id }
		});

		wsServer.clients.forEach((client: WebSocket) => {
			client.send("wsUpdate:reservationData");
		});

		return response.status(200).send("Reservation data saved successfully");
	} catch (error: unknown) {
		return response.status(500).send(`Failed to write reservation data to the database: ${error}`);
	}
});

(async () => {
	try {
		await sqlConnection.authenticate();
		console.log("Connected to the database successfully.");
	} catch (error: unknown) {
		console.error("Database Connection is failed: ", error);
	}
})();

(async () => {
	try {
		await sqlConnection.sync();
		console.log("Tables are created.");
	} catch (error: unknown) {
		console.error("Create Tables is failed: ", error);
	}
})();

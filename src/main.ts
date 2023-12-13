require("dotenv").config();

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { DataTypes, Model, ModelStatic, Sequelize, Op, where } from "sequelize";
import { VehicleAttributes, ReservationData } from "./@types/types";

const port: string = process.env.PORT as string;

const server: express.Express = express();
server.use(express.json());
server.use(cors());
server.use("/C2cFbaAZ", express.static("./car_images"));

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
	transmission: DataTypes.STRING,
	rentalClass: DataTypes.STRING,
	navigation: DataTypes.STRING,
	hasBackCamera: DataTypes.BOOLEAN,
	hasDVD: DataTypes.BOOLEAN,
	hasTelevision: DataTypes.BOOLEAN,
	hasExternalInput: DataTypes.BOOLEAN,
	hasSpareKey: DataTypes.BOOLEAN,
	otherFeatures: DataTypes.TEXT,
});

const Reservation: ModelStatic<Model<ReservationData>> = sqlConnection.define('Reservation', {
	vehicleId: DataTypes.INTEGER,
	reservationName: DataTypes.STRING,
	rentalCategory: DataTypes.STRING,
	departureStore: DataTypes.STRING,
	returnStore: DataTypes.STRING,
	departureDatetime: DataTypes.DATE,
	returnDatetime: DataTypes.DATE,
	nonSmoking: DataTypes.STRING,
	comment: DataTypes.TEXT
});

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

	server.post(endPoint, (request: express.Request, response: express.Response): void => {
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

fetchJson({ endPoint: "/fetchJson/carCatalog", fileName: "car_catalog.json" });
fetchJson({ endPoint: "/fetchJson/navigations", fileName: "navigations.json" });

server.post("/sqlSelect/vehicleAttributes", async (request: express.Request, response: express.Response) => {
	try {
		const vehicleAttributes: Model<VehicleAttributes, VehicleAttributes>[] = await VehicleAttributes.findAll();
		return response.json(vehicleAttributes);
	} catch (error: unknown) {
		console.error(`Failed to select vehicleAttributes: ${error}`);
		return response.status(500).json({ error: "Internal Server Error." });
	}
});

server.post("/sqlSelect/vehicleAttributes/rentalClasses", async (request: express.Request, response: express.Response) => {
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

server.post("/sqlSelect/vehicleAttributes/carModels", async (request: express.Request, response: express.Response) => {
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

server.post("/sqlSelect/vehicleAttributes/licensePlates", async (request: express.Request, response: express.Response) => {
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

server.post("/sqlSelect/reservationData/filterByDateRange", async (request: express.Request, response: express.Response) => {
	const startDate: Date = request.body.startDate;
	const endDate: Date = request.body.endDate;

	try {
		const reservationData: Model<ReservationData, ReservationData>[] = await Reservation.findAll({
			where: {
				departureDatetime: {
					[Op.between]: [
						startDate,
						endDate
					]
				}
			}
		});

		return response.json(reservationData);
	} catch (error: unknown) {
		console.error(`Failed to select reservation data: ${error}`);
		return response.status(500).json("Internal Server Error.");
	}
});

server.post("/sqlSelect/reservationData/selectById", async (request: express.Request, response: express.Response) => {
	const reservationId: string = request.body.reservationId;

	try {
		const reservationDataById: Model<ReservationData, ReservationData>[] = await Reservation.findAll({
			where: {
				id: reservationId
			}
		});
		return response.json(reservationDataById);
	} catch (error: unknown) {
		console.error(`Failed to select reservation data by id: ${error}`);
		return response.status(500).json(`Internal server error: ${error}`);
	}
});

server.post("/sqlInsert/vehicleAttributes", upload.fields([
	{ name: "imageUrl" },
	{ name: "data" }
]), (request: express.Request, response: express.Response) => {
	const targetDirectoryPath: string = "./car_images/";

	const imageFiles: { [fieldname: string]: Express.Multer.File[] | Express.Multer.File[] } = request.files as { [fieldname: string]: Express.Multer.File[] | Express.Multer.File[] };
	const jsonData: VehicleAttributes = JSON.parse(request.body["data"]);

	if (!fs.existsSync(targetDirectoryPath)) {
		fs.mkdirSync(targetDirectoryPath);
	}

	if (imageFiles && Array.isArray(imageFiles["imageUrl"])) {
		const imageDataField: Express.Multer.File = imageFiles["imageUrl"][0];
		const bufferImageUrl: Buffer = imageDataField.buffer;
		const fileName: string = imageDataField.originalname;

		if (!fileName.endsWith(".jpeg") && !fileName.endsWith(".jpg")) {
			return response.status(400).send("Invalid file format. Expected JPEG file.");
		}

		jsonData.imageFileName = fileName;

		fs.writeFile(targetDirectoryPath + fileName, bufferImageUrl, "base64", (error: unknown) => {
			if (error) {
				return response.status(500).send("Failed to write image file: " + error);
			}

			try {
				VehicleAttributes.create(jsonData);
				return response.status(200).send("Data saved successfully");
			} catch (error: unknown) {
				return response.status(500).send("failed to write data to the database: " + error);
			}
		});
	}
});

server.post("/sqlInsert/reservationData", upload.fields([
	{ name: "data" }
]), (request: express.Request, response: express.Response) => {
	const jsonData: ReservationData = JSON.parse(request.body.data);
	try {
		Reservation.create(jsonData);
		return response.status(200).send("Reservation data saved successfully");
	} catch (error: unknown) {
		return response.status(500).send(`Failed to write reservation data to the database: ${error}`);
	}
});

server.listen(port, () => {
	console.log("Server start on port: ", port);
});
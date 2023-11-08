require("dotenv").config();

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import bodyParser from "body-parser";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { VehicleAttributes, ReservationData, CarCatalog, FilesObject } from "./@types/types";

const port: string = process.env.PORT as string;

const server: express.Express = express();
server.use(bodyParser.json());
server.use(cors());
server.use("/C2cFbaAZ", express.static("carImages"));

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
	departingDatetime: DataTypes.DATE,
	returnDatetime: DataTypes.DATE,
	nonSmoking: DataTypes.STRING,
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

server.post("/fetchJSON/carCatalog", (request: express.Request, response: express.Response) => {
	const jsonFilePath: string = path.join("json_files", "car_catalog.json");

	fs.readFile(jsonFilePath, "utf8", (error: unknown, data: string) => {
		try {
			const carCatalog: CarCatalog = JSON.parse(data);
			response.json(carCatalog);
		} catch (parseError: unknown) {
			response.status(500).send("failed to parse carCatalog");
		}

		if (error) {
			response.status(500).send("failed to fetch carCatalog");
			return;
		}
	});
});

server.post("/sqlSelect/vehicleAttributes/rentalClasses", async (request: express.Request, response: express.Response) => {
	try {
		const rentalClasses: Model<VehicleAttributes, VehicleAttributes>[] = await VehicleAttributes.findAll({
			group: [
				"rentalClass"
			]
		});
		return rentalClasses;
	} catch (error: unknown) {
		console.error("failed to fetch rentalClasses: ", error);
	}
});

server.post("/sqlInsert/vehicleAttributes", upload.fields([
	{ name: "imageData" },
	{ name: "data" }
]), (request: express.Request, response: express.Response) => {
	const targetDirectoryPath: string = "./car_images/";

	const imageFiles: { [fieldname: string]: Express.Multer.File[] | Express.Multer.File[] } = request.files as { [fieldname: string]: Express.Multer.File[] | Express.Multer.File[] };
	const jsonData: VehicleAttributes = request.body["data"];

	if (imageFiles && Array.isArray(imageFiles["imageData"])) {
		const imageDataField: Express.Multer.File = imageFiles["imageData"][0];
		const fileName: string = imageDataField.originalname;

		fs.writeFile(targetDirectoryPath + fileName, imageDataField.buffer, "base64", (error: unknown) => {
			return "Failed to write file: " + error;
		});
	}

	console.log(jsonData);
	// return VehicleAttributes.create(jsonData);
});

server.listen(port, () => {
	console.log("Server start on port: ", port);
});
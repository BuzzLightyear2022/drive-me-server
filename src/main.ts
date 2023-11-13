require("dotenv").config();

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import bodyParser from "body-parser";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { VehicleAttributes, ReservationData } from "./@types/types";

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

type RentalClassType = typeof VehicleAttributes["prototype"]["rentalClass"];

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

server.post("/sqlSelect/vehicleAttributes/rentalClasses", async (request: express.Request, response: express.Response) => {
	try {
		const result: RentalClassType = await VehicleAttributes.findAll({
			attributes: ["rentalClass"],
			group: "rentalClass"
		});
		const rentalClassArray: string[] = result.map((record: RentalClassType) => record.rentalClass);
		return response.json(rentalClassArray);
	} catch (error: unknown) {
		console.error("failed to fetch rentalClasses: ", error);
		return response.status(500).json({ error: "Internal Server Error" });
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

server.listen(port, () => {
	console.log("Server start on port: ", port);
});
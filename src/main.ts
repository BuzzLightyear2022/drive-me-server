require("dotenv").config();

import express from "express";
import cors from "cors";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { VehicleAttributes, ReservationData } from "./@types/types";

const server: express.Express = express();
server.use(cors());
server.use("/C2cFbaAZ", express.static("carImages"));

const port: string = process.env.PORT as string;

const rds_host: string = process.env.RDS_HOST as string;
const rds_user: string = process.env.RDS_USER as string;
const rds_password: string = process.env.RDS_PASSWORD as string;

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

server.post("/sqlSelect/vehicleAttributes/rentalClasses", async (request: express.Request, response: express.Response) => {
	try {
		const rentalClasses = await VehicleAttributes.findAll({
			group: [
				"rentalClass"
			]
		});
	} catch (error: unknown) {
		console.error("failed to fetch rentalClasses: ", error);
	}
});
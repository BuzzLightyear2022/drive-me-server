"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sequelize_1 = require("sequelize");
const server = (0, express_1.default)();
server.use((0, cors_1.default)());
server.use("/C2cFbaAZ", express_1.default.static("carImages"));
const port = process.env.PORT;
const rds_host = process.env.RDS_HOST;
const rds_user = process.env.RDS_USER;
const rds_password = process.env.RDS_PASSWORD;
const sqlConnection = new sequelize_1.Sequelize("drive_me_test_since20230703", rds_user, rds_password, {
    host: rds_host,
    dialect: "mysql"
});
const VehicleAttributes = sqlConnection.define("VehicleAttribute", {
    imageFileName: sequelize_1.DataTypes.STRING,
    carModel: sequelize_1.DataTypes.STRING,
    modelCode: sequelize_1.DataTypes.STRING,
    nonSmoking: sequelize_1.DataTypes.BOOLEAN,
    insurancePriority: sequelize_1.DataTypes.BOOLEAN,
    licensePlateRegion: sequelize_1.DataTypes.STRING,
    licensePlateCode: sequelize_1.DataTypes.STRING,
    licensePlateHiragana: sequelize_1.DataTypes.STRING,
    licensePlateNumber: sequelize_1.DataTypes.STRING,
    bodyColor: sequelize_1.DataTypes.STRING,
    driveType: sequelize_1.DataTypes.STRING,
    transmission: sequelize_1.DataTypes.STRING,
    rentalClass: sequelize_1.DataTypes.STRING,
    navigation: sequelize_1.DataTypes.STRING,
    hasBackCamera: sequelize_1.DataTypes.BOOLEAN,
    hasDVD: sequelize_1.DataTypes.BOOLEAN,
    hasTelevision: sequelize_1.DataTypes.BOOLEAN,
    hasExternalInput: sequelize_1.DataTypes.BOOLEAN,
    hasSpareKey: sequelize_1.DataTypes.BOOLEAN,
    otherFeatures: sequelize_1.DataTypes.TEXT,
});
const Reservation = sqlConnection.define('Reservation', {
    vehicleId: sequelize_1.DataTypes.INTEGER,
    reservationName: sequelize_1.DataTypes.STRING,
    rentalCategory: sequelize_1.DataTypes.STRING,
    departureStore: sequelize_1.DataTypes.STRING,
    returnStore: sequelize_1.DataTypes.STRING,
    departingDatetime: sequelize_1.DataTypes.DATE,
    returnDatetime: sequelize_1.DataTypes.DATE,
    nonSmoking: sequelize_1.DataTypes.STRING,
});
(async () => {
    try {
        await sqlConnection.authenticate();
        console.log("Connected to the database successfully.");
    }
    catch (error) {
        console.error("Database Connection is failed: ", error);
    }
})();
(async () => {
    try {
        await sqlConnection.sync();
        console.log("Tables are created.");
    }
    catch (error) {
        console.error("Create Tables is failed: ", error);
    }
})();
server.post("/sqlSelect/vehicleAttributes/rentalClasses", async (request, response) => {
    try {
        const rentalClasses = await VehicleAttributes.findAll({
            group: [
                "rentalClass"
            ]
        });
    }
    catch (error) {
        console.error("failed to fetch rentalClasses: ", error);
    }
});
server.listen(port, () => {
    console.log("Server start on port: ", port);
});

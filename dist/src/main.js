"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const sequelize_1 = require("sequelize");
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
(async () => {
    try {
        await sqlConnection.authenticate();
        console.log("Connected to the database successfully.");
    }
    catch (error) {
        console.error("Database Connection: ", error);
    }
})();

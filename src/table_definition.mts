import { sqlConnection } from "./main.mjs";
import { VehicleAttributes, ReservationData, Users } from "./@types/types.js";
import { DataTypes, Model, ModelStatic, } from "sequelize";

export const VehicleAttributesModel: ModelStatic<Model<VehicleAttributes>> = sqlConnection.define("VehicleAttribute", {
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

export const ReservationDataModel: ModelStatic<Model<ReservationData>> = sqlConnection.define('Reservation', {
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

export const UsersModel: ModelStatic<Model<Users>> = sqlConnection.define("Users", {
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
});
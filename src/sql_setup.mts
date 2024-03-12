import { VehicleAttributes, ReservationData, VehicleStatuses, Users } from "./@types/types.js";
import { Sequelize, DataTypes, Model, ModelStatic } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const rds_host: string = process.env.RDS_HOST as string;
const rds_user: string = process.env.RDS_USER as string;
const rds_password: string = process.env.RDS_PASSWORD as string;

export const sqlConnection: Sequelize = new Sequelize(
    "drive_me_test_since20230703",
    rds_user,
    rds_password,
    {
        host: rds_host,
        dialect: "mysql"
    }
);

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
    modelTrim: DataTypes.STRING,
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

export const VehicleStatusesModel: ModelStatic<Model<VehicleStatuses>> = sqlConnection.define("VehicleStatus", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    vehicleId: DataTypes.INTEGER,
    currentLocation: DataTypes.STRING,
    isWashed: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
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

(async () => {
    try {
        await sqlConnection.authenticate();
    } catch (error: unknown) {
        console.error("Database Connection is failed: ", error);
    }

    try {
        await sqlConnection.sync();
    } catch (error: unknown) {
        console.error("Create Tables is failed: ", error);
    }
})();
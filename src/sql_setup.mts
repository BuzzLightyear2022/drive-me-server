import { RentalCar, Reservation, StatusOfRentalCar, User } from "./@types/types.js";
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

export const RentalCarModel: ModelStatic<Model<RentalCar>> = sqlConnection.define("RentalCars", {
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

export const ReservationModel: ModelStatic<Model<Reservation>> = sqlConnection.define('Reservations', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    isReplied: DataTypes.BOOLEAN,
    receptionDate: DataTypes.DATE,
    repliedDatetime: DataTypes.DATE,
    salesBranch: DataTypes.STRING,
    orderHandler: DataTypes.STRING,
    orderSource: DataTypes.STRING,
    userNameFurigana: DataTypes.STRING,
    nonSmoking: DataTypes.STRING,
    userName: DataTypes.STRING,
    preferredRentalClass: DataTypes.STRING,
    isElevatable: DataTypes.BOOLEAN,
    isClassSpecified: DataTypes.BOOLEAN,
    applicantName: DataTypes.STRING,
    preferredCarModel: DataTypes.STRING,
    applicantZipCode: DataTypes.STRING,
    applicantAddress: DataTypes.STRING,
    applicantPhoneNumber: DataTypes.STRING,
    pickupLocation: DataTypes.STRING,
    returnLocation: DataTypes.STRING,
    pickupDatetime: DataTypes.DATE,
    arrivalFlightCarrier: DataTypes.STRING,
    arrivalFlightNumber: DataTypes.STRING,
    arrivalFlightTime: DataTypes.TIME,
    returnDatetime: DataTypes.DATE,
    departureFlightCarrier: DataTypes.STRING,
    departureFlightNumber: DataTypes.STRING,
    departureFlightTime: DataTypes.TIME,
    selectedRentalClass: DataTypes.STRING,
    selectedCarModel: DataTypes.STRING,
    selectedVehicleId: DataTypes.STRING,
    comment: DataTypes.TEXT,
    isCanceled: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

export const StatusOfRentalCarModel: ModelStatic<Model<StatusOfRentalCar>> = sqlConnection.define("StatusOfRentalCars", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    rentalCarId: DataTypes.INTEGER,
    currentLocation: DataTypes.STRING,
    washState: DataTypes.STRING,
    comment: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

export const UserModel: ModelStatic<Model<User>> = sqlConnection.define("Users", {
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
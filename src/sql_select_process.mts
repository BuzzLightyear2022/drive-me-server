import express from "express";
import { Model, Op } from "sequelize";
import { app } from "./main.mjs";
import { authenticateToken } from "./login.mjs";
import { VehicleAttributesModel, ReservationDataModel } from "./sql_setup.mjs";
import { VehicleAttributes, ReservationData } from "./@types/types.js";

(async () => {
    app.post("/sqlSelect/vehicleAttributes", authenticateToken, async (request: express.Request, response: express.Response) => {
        try {
            const vehicleAttributes: Model<VehicleAttributes, VehicleAttributes>[] = await VehicleAttributesModel.findAll();
            return response.json(vehicleAttributes);
        } catch (error: unknown) {
            console.error(`Failed to select vehicleAttributes: ${error}`);
            return response.status(500).json({ error: "Internal Server Error." });
        }
    });
})();

(async () => {
    app.post("/sqlSelect/vehicleAttributesById", authenticateToken, async (request: express.Request, response: express.Response) => {
        const vehicleId: string = request.body.vehicleId;

        try {
            const vehicleAttributes: Model<VehicleAttributes, VehicleAttributes> | null = await VehicleAttributesModel.findOne({
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
})();

(async () => {
    app.post("/sqlSelect/vehicleAttributesByClass", authenticateToken, async (request: express.Request, response: express.Response) => {
        const rentalClass: string = request.body.rentalClass;

        try {
            let whereClause = {};

            if (rentalClass !== null) {
                whereClause = {
                    rentalClass: rentalClass
                }
            }

            const vehicleAttributes: Model<VehicleAttributes, VehicleAttributes>[] | null = await VehicleAttributesModel.findAll({
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
})();

(async () => {
    app.post("/sqlSelect/vehicleAttributes/rentalClasses", authenticateToken, async (request: express.Request, response: express.Response) => {
        const selectedSmoking = request.body["selectedSmoking"];

        try {
            switch (selectedSmoking) {
                case "non-smoking":
                    const nonSmokingRentalClasses = await VehicleAttributesModel.findAll({
                        attributes: ["rentalClass"],
                        where: {
                            nonSmoking: true
                        },
                        group: "rentalClass"
                    });
                    const nonSmokingRentalClassesArray: string[] = nonSmokingRentalClasses.map((rentalClass: any): string => {
                        return rentalClass.rentalClass;
                    });
                    return response.json(nonSmokingRentalClassesArray);
                case "ok-smoking":
                    const smokingRentalClasses = await VehicleAttributesModel.findAll({
                        attributes: ["rentalClass"],
                        where: {
                            nonSmoking: false
                        },
                        group: "rentalClass"
                    });
                    const smokingRentalClassesArray: string[] = smokingRentalClasses.map((rentalClass: any): string => {
                        return rentalClass.rentalClass;
                    });
                    return response.json(smokingRentalClassesArray);
                default:
                    const rentalClasses = await VehicleAttributesModel.findAll({
                        attributes: ["rentalClass"],
                        group: "rentalClass"
                    });
                    const rentalClassesArray: string[] = rentalClasses.map((rentalClass: any): string => {
                        return rentalClass.rentalClass;
                    });
                    return response.json(rentalClassesArray);
            }
        } catch (error: unknown) {
            console.error(`failed to fetch rentalClass: ${error}`);
            return response.status(500).json({ error: "Internal Server Error" });
        }
    });
})();

(async () => {
    app.post("/sqlSelect/vehicleAttributes/carModels", authenticateToken, async (request: express.Request, response: express.Response) => {
        const selectedSmoking: string = request.body.selectedSmoking;
        const selectedRentalClass: string = request.body.selectedRentalClass;

        try {
            switch (selectedSmoking) {
                case "non-smoking":
                    const nonSmokingCarModels = await VehicleAttributesModel.findAll({
                        attributes: ["carModel"],
                        where: {
                            nonSmoking: true,
                            rentalClass: selectedRentalClass
                        },
                        group: "carModel"
                    });
                    const nonSmokingRentalClassesArray: string[] = nonSmokingCarModels.map((carModel: any): string => {
                        return carModel.carModel;
                    });
                    return response.json(nonSmokingRentalClassesArray);
                case "ok-smoking":
                    const smokingCarModels = await VehicleAttributesModel.findAll({
                        attributes: ["carModel"],
                        where: {
                            nonSmoking: false,
                            rentalClass: selectedRentalClass
                        },
                        group: "carModel"
                    });
                    const smokingCarModelsArray: string[] = smokingCarModels.map((carModel: any): string => {
                        return carModel.carModel;
                    });
                    return response.json(smokingCarModelsArray);
                case "none-specification":
                    const carModels = await VehicleAttributesModel.findAll({
                        attributes: ["carModel"],
                        where: {
                            rentalClass: selectedRentalClass
                        },
                        group: "carModel"
                    });
                    const carModelsArray: string[] = carModels.map((carModel: any): string => {
                        return carModel.carModel;
                    });
                    return response.json(carModelsArray);
            }
        } catch (error: unknown) {
            console.error(`failed to fetch carModels: ${error}`);
            return response.status(500).json({ error: "Internal Server Error" });
        }
    });
})();

(async () => {
    app.post("/sqlSelect/vehicleAttributes/licensePlates", authenticateToken, async (request: express.Request, response: express.Response) => {
        const selectedSmoking: string = request.body.selectedSmoking;
        const selectedCarModel: string = request.body.selectedCarModel;

        try {
            switch (selectedSmoking) {
                case "non-smoking":
                    const nonSmokingLicensePlates = await VehicleAttributesModel.findAll({
                        attributes: ["id", "licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber"],
                        where: {
                            nonSmoking: true,
                            carModel: selectedCarModel
                        }
                    });
                    const nonSmokingLicensePlatesData = nonSmokingLicensePlates.map((licensePlate: any) => {
                        const licensePlateString: string = `${licensePlate.licensePlateRegion} ${licensePlate.licensePlateCode} ${licensePlate.licensePlateHiragana} ${licensePlate.licensePlateNumber}`;
                        const licensePlateData = {
                            id: licensePlate.id,
                            licensePlate: licensePlateString
                        }
                        return licensePlateData;
                    });
                    return response.json(nonSmokingLicensePlatesData);
                case "ok-smoking":
                    const smokingLicensePlates = await VehicleAttributesModel.findAll({
                        attributes: ["id", "licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber"],
                        where: {
                            nonSmoking: false,
                            carModel: selectedCarModel
                        }
                    });
                    const smokingLicensePlatesData = smokingLicensePlates.map((licensePlate: any) => {
                        const licensePlateString: string = `${licensePlate.licensePlateRegion} ${licensePlate.licensePlateCode} ${licensePlate.licensePlateHiragana} ${licensePlate.licensePlateNumber}`;
                        const licensePlateData = {
                            id: licensePlate.id,
                            licensePlate: licensePlateString
                        }
                        return licensePlateData;
                    });
                    return response.json(smokingLicensePlatesData);
                case "none-specification":
                    const licensePlates = await VehicleAttributesModel.findAll({
                        attributes: ["id", "licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber"],
                        where: {
                            carModel: selectedCarModel
                        }
                    });
                    const licensePlatesData = licensePlates.map((licensePlate: any) => {
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
})();

(async () => {
    app.post("/sqlSelect/reservationData/filterByDateRange", authenticateToken, async (request: express.Request, response: express.Response) => {
        const startDate: Date = request.body.startDate;
        const endDate: Date = request.body.endDate;

        try {
            const reservationData: Model<ReservationData, ReservationData>[] = await ReservationDataModel.findAll({
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
})();

(async () => {
    app.post("/sqlSelect/reservationData/selectById", authenticateToken, async (request: express.Request, response: express.Response) => {
        const reservationId: string = request.body.reservationId;

        try {
            const reservationDataById: Model<ReservationData, ReservationData> | null = await ReservationDataModel.findOne({
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
})();
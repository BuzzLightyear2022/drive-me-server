import express from "express";
import Sequelize, { Model, Op } from "sequelize";
import { app } from "./main.mjs";
import { authenticateToken } from "./login.mjs";
import { RentalCarModel, ReservationModel, RentalCarStatusModel, LoanerRentalReservationModel } from "./sql_setup.mjs";
import { RentalCar, Reservation, RentalCarStatus, LoanerRentalReservation } from "./@types/types.js";

(async () => {
    app.post("/sqlSelect/rentalCarById", authenticateToken, async (request: express.Request, response: express.Response) => {
        const rentalcarId: string = request.body.rentalcarId;

        try {
            const rentalCar: Model<RentalCar, RentalCar> | null = await RentalCarModel.findOne({
                where: {
                    id: rentalcarId
                }
            });

            if (rentalCar) {
                return response.json(rentalCar);
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
    app.post("/sqlSelect/rentalCars", authenticateToken, async (request: express.Request, response: express.Response) => {
        const rentalClass: string | null = request.body.rentalClass;

        try {
            let whereClause = {};

            if (rentalClass) {
                whereClause = {
                    rentalClass: rentalClass
                }
            }

            const rentalCars: Model<RentalCar, RentalCar>[] | null = await RentalCarModel.findAll({
                where: whereClause,
                include: [
                    {
                        model: RentalCarStatusModel,
                        required: false,
                        order: [["createdAt", "DESC"]],
                        limit: 1
                    }
                ]
            });

            if (rentalCars) {
                return response.json(rentalCars);
            } else {
                return response.status(404).json({ error: "rentalCar not found" });
            }
        } catch (error: unknown) {
            console.error(`Failed to select RentalCar: ${error}`);
            return response.status(500).json({ error: error });
        }
    });
})();

(async () => {
    app.post("/sqlSelect/existingRentalClasses", authenticateToken, async (request: express.Request, response: express.Response) => {
        const selectedSmoking = request.body["nonSmoking"];

        try {
            switch (selectedSmoking) {
                case "non-smoking":
                    const nonSmokingRentalClasses = await RentalCarModel.findAll({
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
                    const smokingRentalClasses = await RentalCarModel.findAll({
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
                    const rentalClasses = await RentalCarModel.findAll({
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
        const selectedSmoking: string | undefined = request.body.smoking;
        const selectedRentalClass: string = request.body.rentalClass;

        try {
            switch (selectedSmoking) {
                case "non-smoking":
                    const nonSmokingCarModels = await RentalCarModel.findAll({
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
                    const smokingCarModels = await RentalCarModel.findAll({
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
                default:
                    const carModels = await RentalCarModel.findAll({
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
        const selectedSmoking: string | undefined = request.body.smoking;
        const selectedCarModel: string = request.body.carModel;

        try {
            switch (selectedSmoking) {
                case "non-smoking":
                    const nonSmokingLicensePlates = await RentalCarModel.findAll({
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
                    const smokingLicensePlates = await RentalCarModel.findAll({
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
                default:
                    const licensePlates = await RentalCarModel.findAll({
                        attributes: ["id", "licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber", "nonSmoking"],
                        where: {
                            carModel: selectedCarModel
                        }
                    });
                    const licensePlatesData = licensePlates.map((licensePlate: any) => {
                        const licensePlateString: string = `${licensePlate.licensePlateRegion} ${licensePlate.licensePlateCode} ${licensePlate.licensePlateHiragana} ${licensePlate.licensePlateNumber}`;
                        const licensePlateData = {
                            id: licensePlate.id,
                            licensePlate: licensePlateString,
                            nonSmoking: licensePlate.nonSmoking
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
    app.post("/sqlSelect/reservations", authenticateToken, async (request: express.Request, response: express.Response) => {
        const startDate: Date | undefined = request.body.startDate;
        const endDate: Date | undefined = request.body.endDate;

        let whereClause = {}

        if (startDate && endDate) {
            whereClause = {
                [Op.or]: [
                    {
                        pickupDatetime: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        returnDatetime: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        [Op.and]: [
                            { pickupDatetime: { [Op.lte]: startDate } },
                            { returnDatetime: { [Op.gte]: endDate } }
                        ]
                    }
                ]
            }
        }

        try {
            const reservations: Model<Reservation, Reservation>[] = await ReservationModel.findAll({
                where: whereClause
            });

            if (reservations) {
                return response.json(reservations);
            } else {
                return response.status(404).json({ error: "reservations not found" });
            }
        } catch (error: unknown) {
            console.error(`Failed to select reservations: ${error}`);
            return response.status(500).json("Internal Server Error.");
        }
    });
})();

(async () => {
    app.post("/sqlSelect/reservationById", authenticateToken, async (request: express.Request, response: express.Response) => {
        const reservationId: string = request.body.reservationId;

        try {
            const reservationDataById: Model<Reservation, Reservation> | null = await ReservationModel.findOne({
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

(async () => {
    app.post("/sqlSelect/getRentalcarAttributesByCarModel", authenticateToken, async (request: express.Request, response: express.Response) => {
        const carModel: string = request.body.carModel;

        try {
            const rentalcarAttributesByCarModel: Model<RentalCar, RentalCar>[] | null = await RentalCarModel.findAll({
                attributes: [
                    "modelCode",
                    "modelTrim",
                    "bodyColor",
                    "driveType",
                    "transmission",
                    "navigation"
                ],
                where: {
                    carModel: carModel,
                }
            });

            console.log("rentalcar attributes by carmodel: ", rentalcarAttributesByCarModel);

            if (rentalcarAttributesByCarModel.length > 0) {
                const modelCodes = rentalcarAttributesByCarModel.map(item => item.get("modelCode")).filter(value => value !== "" && value !== null);
                const modelTrims = rentalcarAttributesByCarModel.map(item => item.get("modelTrim")).filter(value => value !== "" && value !== null);
                const driveTypes = rentalcarAttributesByCarModel.map(item => item.get("driveType")).filter(value => value !== "" && value !== null);
                const transmissions = rentalcarAttributesByCarModel.map(item => item.get("transmission")).filter(value => value !== "" && value !== null);
                const bodyColors = rentalcarAttributesByCarModel.map(item => item.get("bodyColor")).filter(value => value !== "" && value !== null);
                const navigations = rentalcarAttributesByCarModel.map(item => item.get("navigation")).filter(value => value !== "" && value !== null);

                const uniqueModelCodes = [...new Set(modelCodes)];
                const uniqueModelTrims = [...new Set(modelTrims)];
                const uniqueDriveTypes = [...new Set(driveTypes)];
                const uniqueTransmissions = [...new Set(transmissions)];
                const uniqueBodyColors = [...new Set(bodyColors)];
                const uniqueNavigations = [...new Set(navigations)];

                return response.status(200).json({
                    modelCodes: uniqueModelCodes,
                    modelTrims: uniqueModelTrims,
                    driveTypes: uniqueDriveTypes,
                    transmissions: uniqueTransmissions,
                    bodyColors: uniqueBodyColors,
                    navigations: uniqueNavigations
                });
            } else {
                return response.status(404).json({
                    error: 404,
                    message: "Failed to select rentalcar attributes by carModel"
                });
            }
        } catch (error: unknown) {
            return response.status(500).json({
                error: error,
                message: "Failed to select rentalcar attributes by carModel"
            });
        }
    });
})();

(async () => {

})();

// (async () => {
//     app.post("/sqlSelect/latestStatusOfRentalCars", authenticateToken, async (request: express.Request, response: express.Response) => {
//         const rentalClass: string | null = request.body.rentalClass;

//         try {
//             let queryOptions: any = {
//                 attributes: [
//                     "rentalCarId", [Sequelize.fn("MAX", Sequelize.col("createdAt")), "latestCreate"]
//                 ],
//                 group: ["rentalCarId"],
//                 raw: true,
//             }

// if (rentalClass) {
//     queryOptions.where = { rentalClass: rentalClass }
// }

//             const latestStatusOfRentalCars: Model<StatusOfRentalCar, StatusOfRentalCar>[] = await StatusOfRentalCarModel.findAll(queryOptions);

//             const latestRecords = await Promise.all(latestStatusOfRentalCars.map(async (item: any) => {
//                 return StatusOfRentalCarModel.findOne({
//                     where: {
//                         rentalCarId: item.rentalCarId,
//                         createdAt: item.latestCreate
//                     }
//                 });
//             }));

//             response.status(200).json(latestRecords);
//         } catch (error: unknown) {
//             return response.status(500);
//         }
//     });
// })();

(async () => {
    app.post("/sqlSelect/loanerRentalReservationById", authenticateToken, async (request: express.Request, response: express.Response) => {
        const reservationId: string = request.body.reservationId;

        try {
            const loanerRentalReservationById: Model<LoanerRentalReservation, LoanerRentalReservation> | null = await LoanerRentalReservationModel.findOne({
                where: {
                    id: reservationId
                }
            });

            if (loanerRentalReservationById) {
                return response.json(loanerRentalReservationById);
            } else {
                return response.status(404).send();
            }

        } catch (error: unknown) {
            console.error(error);
        }
    });
})();

(async () => {
    app.post("/sqlSelect/loanerRentalReservations", authenticateToken, async (request: express.Request, response: express.Response) => {
        const startDate: Date | undefined = request.body.startDate;
        const endDate: Date | undefined = request.body.endDate;

        let whereClause = {}

        if (startDate && endDate) {
            whereClause = {
                [Op.or]: [
                    {
                        dispatchDatetime: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        limitDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        [Op.and]: [
                            { dispatchDatetime: { [Op.lte]: startDate } },
                            { limitDate: { [Op.gte]: endDate } }
                        ]
                    }
                ]
            }
        }

        try {
            const loanerRentalReservations: Model<LoanerRentalReservation, LoanerRentalReservation>[] = await LoanerRentalReservationModel.findAll({
                where: whereClause
            });

            if (loanerRentalReservations) {
                return response.json(loanerRentalReservations);
            } else {
                return response.status(404).send();
            }
        } catch (error: unknown) {
            return response.status(500).send();
        }
    })
})();
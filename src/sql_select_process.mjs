"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
var main_mjs_1 = require("./main.mjs");
var login_mjs_1 = require("./login.mjs");
var sql_setup_mjs_1 = require("./sql_setup.mjs");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlSelect/vehicleAttributes", login_mjs_1.authenticateToken, function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var vehicleAttributes, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findAll()];
                    case 1:
                        vehicleAttributes = _a.sent();
                        return [2 /*return*/, response.json(vehicleAttributes)];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Failed to select vehicleAttributes: ".concat(error_1));
                        return [2 /*return*/, response.status(500).json({ error: "Internal Server Error." })];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); })();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlSelect/vehicleAttributesById", login_mjs_1.authenticateToken, function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var vehicleId, vehicleAttributes, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vehicleId = request.body.vehicleId;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findOne({
                                where: {
                                    id: vehicleId
                                }
                            })];
                    case 2:
                        vehicleAttributes = _a.sent();
                        if (vehicleAttributes) {
                            return [2 /*return*/, response.json(vehicleAttributes)];
                        }
                        else {
                            return [2 /*return*/, response.status(404).json({ error: "VehicleAttributes not found" })];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Failed to select VehicleAttributes by id: ".concat(Error));
                        return [2 /*return*/, response.status(500).json({ error: error_2 })];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); })();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlSelect/vehicleAttributesByClass", login_mjs_1.authenticateToken, function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var rentalClass, whereClause, vehicleAttributes, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rentalClass = request.body.rentalClass;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        whereClause = {};
                        if (rentalClass !== null) {
                            whereClause = {
                                rentalClass: rentalClass
                            };
                        }
                        return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findAll({
                                where: whereClause
                            })];
                    case 2:
                        vehicleAttributes = _a.sent();
                        if (vehicleAttributes) {
                            return [2 /*return*/, response.json(vehicleAttributes)];
                        }
                        else {
                            return [2 /*return*/, response.status(404).json({ error: "vehicleAttributes not found" })];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error("Failed to select VehicleAttributes by class ".concat(error_3));
                        return [2 /*return*/, response.status(500).json({ error: error_3 })];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); })();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlSelect/vehicleAttributes/rentalClasses", function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var selectedSmoking, _a, nonSmokingRentalClasses, nonSmokingRentalClassesArray, smokingRentalClasses, smokingRentalClassesArray, rentalClasses, rentalClassesArray, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        selectedSmoking = request.body["selectedSmoking"];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        _a = selectedSmoking;
                        switch (_a) {
                            case "non-smoking": return [3 /*break*/, 2];
                            case "ok-smoking": return [3 /*break*/, 4];
                            case "none-specification": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findAll({
                            attributes: ["rentalClass"],
                            where: {
                                nonSmoking: true
                            },
                            group: "rentalClass"
                        })];
                    case 3:
                        nonSmokingRentalClasses = _b.sent();
                        nonSmokingRentalClassesArray = nonSmokingRentalClasses.map(function (rentalClass) {
                            return rentalClass.rentalClass;
                        });
                        return [2 /*return*/, response.json(nonSmokingRentalClassesArray)];
                    case 4: return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findAll({
                            attributes: ["rentalClass"],
                            where: {
                                nonSmoking: false
                            },
                            group: "rentalClass"
                        })];
                    case 5:
                        smokingRentalClasses = _b.sent();
                        smokingRentalClassesArray = smokingRentalClasses.map(function (rentalClass) {
                            return rentalClass.rentalClass;
                        });
                        return [2 /*return*/, response.json(smokingRentalClassesArray)];
                    case 6: return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findAll({
                            attributes: ["rentalClass"],
                            group: "rentalClass"
                        })];
                    case 7:
                        rentalClasses = _b.sent();
                        rentalClassesArray = rentalClasses.map(function (rentalClass) {
                            return rentalClass.rentalClass;
                        });
                        return [2 /*return*/, response.json(rentalClassesArray)];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_4 = _b.sent();
                        console.error("failed to fetch rentalClass: ".concat(error_4));
                        return [2 /*return*/, response.status(500).json({ error: "Internal Server Error" })];
                    case 10: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); })();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlSelect/vehicleAttributes/carModels", function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var selectedSmoking, selectedRentalClass, _a, nonSmokingCarModels, nonSmokingRentalClassesArray, smokingCarModels, smokingCarModelsArray, carModels, carModelsArray, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        selectedSmoking = request.body.selectedSmoking;
                        selectedRentalClass = request.body.selectedRentalClass;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        _a = selectedSmoking;
                        switch (_a) {
                            case "non-smoking": return [3 /*break*/, 2];
                            case "ok-smoking": return [3 /*break*/, 4];
                            case "none-specification": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findAll({
                            attributes: ["carModel"],
                            where: {
                                nonSmoking: true,
                                rentalClass: selectedRentalClass
                            },
                            group: "carModel"
                        })];
                    case 3:
                        nonSmokingCarModels = _b.sent();
                        nonSmokingRentalClassesArray = nonSmokingCarModels.map(function (carModel) {
                            return carModel.carModel;
                        });
                        return [2 /*return*/, response.json(nonSmokingRentalClassesArray)];
                    case 4: return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findAll({
                            attributes: ["carModel"],
                            where: {
                                nonSmoking: false,
                                rentalClass: selectedRentalClass
                            },
                            group: "carModel"
                        })];
                    case 5:
                        smokingCarModels = _b.sent();
                        smokingCarModelsArray = smokingCarModels.map(function (carModel) {
                            return carModel.carModel;
                        });
                        return [2 /*return*/, response.json(smokingCarModelsArray)];
                    case 6: return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findAll({
                            attributes: ["carModel"],
                            where: {
                                rentalClass: selectedRentalClass
                            },
                            group: "carModel"
                        })];
                    case 7:
                        carModels = _b.sent();
                        carModelsArray = carModels.map(function (carModel) {
                            return carModel.carModel;
                        });
                        return [2 /*return*/, response.json(carModelsArray)];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_5 = _b.sent();
                        console.error("failed to fetch carModels: ".concat(error_5));
                        return [2 /*return*/, response.status(500).json({ error: "Internal Server Error" })];
                    case 10: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); })();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlSelect/vehicleAttributes/licensePlates", function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var selectedSmoking, selectedCarModel, _a, nonSmokingLicensePlates, nonSmokingLicensePlatesData, smokingLicensePlates, smokingLicensePlatesData, licensePlates, licensePlatesData, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        selectedSmoking = request.body.selectedSmoking;
                        selectedCarModel = request.body.selectedCarModel;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        _a = selectedSmoking;
                        switch (_a) {
                            case "non-smoking": return [3 /*break*/, 2];
                            case "ok-smoking": return [3 /*break*/, 4];
                            case "none-specification": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findAll({
                            attributes: ["id", "licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber"],
                            where: {
                                nonSmoking: true,
                                carModel: selectedCarModel
                            }
                        })];
                    case 3:
                        nonSmokingLicensePlates = _b.sent();
                        nonSmokingLicensePlatesData = nonSmokingLicensePlates.map(function (licensePlate) {
                            var licensePlateString = "".concat(licensePlate.licensePlateRegion, " ").concat(licensePlate.licensePlateCode, " ").concat(licensePlate.licensePlateHiragana, " ").concat(licensePlate.licensePlateNumber);
                            var licensePlateData = {
                                id: licensePlate.id,
                                licensePlate: licensePlateString
                            };
                            return licensePlateData;
                        });
                        return [2 /*return*/, response.json(nonSmokingLicensePlatesData)];
                    case 4: return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findAll({
                            attributes: ["id", "licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber"],
                            where: {
                                nonSmoking: false,
                                carModel: selectedCarModel
                            }
                        })];
                    case 5:
                        smokingLicensePlates = _b.sent();
                        smokingLicensePlatesData = smokingLicensePlates.map(function (licensePlate) {
                            var licensePlateString = "".concat(licensePlate.licensePlateRegion, " ").concat(licensePlate.licensePlateCode, " ").concat(licensePlate.licensePlateHiragana, " ").concat(licensePlate.licensePlateNumber);
                            var licensePlateData = {
                                id: licensePlate.id,
                                licensePlate: licensePlateString
                            };
                            return licensePlateData;
                        });
                        return [2 /*return*/, response.json(smokingLicensePlatesData)];
                    case 6: return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findAll({
                            attributes: ["id", "licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber"],
                            where: {
                                carModel: selectedCarModel
                            }
                        })];
                    case 7:
                        licensePlates = _b.sent();
                        licensePlatesData = licensePlates.map(function (licensePlate) {
                            var licensePlateString = "".concat(licensePlate.licensePlateRegion, " ").concat(licensePlate.licensePlateCode, " ").concat(licensePlate.licensePlateHiragana, " ").concat(licensePlate.licensePlateNumber);
                            var licensePlateData = {
                                id: licensePlate.id,
                                licensePlate: licensePlateString
                            };
                            return licensePlateData;
                        });
                        return [2 /*return*/, response.json(licensePlatesData)];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_6 = _b.sent();
                        console.error("failed to fetch licensePlates: ".concat(error_6));
                        return [2 /*return*/, response.status(500).json({ error: "Internal Server Error" })];
                    case 10: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); })();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlSelect/reservationData/filterByDateRange", login_mjs_1.authenticateToken, function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var startDate, endDate, reservationData, error_7;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        startDate = request.body.startDate;
                        endDate = request.body.endDate;
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, sql_setup_mjs_1.ReservationDataModel.findAll({
                                where: (_a = {},
                                    _a[sequelize_1.Op.or] = [
                                        {
                                            pickupDateObject: (_b = {},
                                                _b[sequelize_1.Op.between] = [startDate, endDate],
                                                _b)
                                        },
                                        {
                                            returnDateObject: (_c = {},
                                                _c[sequelize_1.Op.between] = [startDate, endDate],
                                                _c)
                                        },
                                        (_d = {},
                                            _d[sequelize_1.Op.and] = [
                                                { pickupDateObject: (_e = {}, _e[sequelize_1.Op.lte] = startDate, _e) },
                                                { returnDateObject: (_f = {}, _f[sequelize_1.Op.gte] = endDate, _f) }
                                            ],
                                            _d)
                                    ],
                                    _a)
                            })];
                    case 2:
                        reservationData = _g.sent();
                        return [2 /*return*/, response.json(reservationData)];
                    case 3:
                        error_7 = _g.sent();
                        console.error("Failed to select reservation data: ".concat(error_7));
                        return [2 /*return*/, response.status(500).json("Internal Server Error.")];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); })();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlSelect/reservationData/selectById", login_mjs_1.authenticateToken, function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var reservationId, reservationDataById, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reservationId = request.body.reservationId;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, sql_setup_mjs_1.ReservationDataModel.findOne({
                                where: {
                                    id: reservationId
                                }
                            })];
                    case 2:
                        reservationDataById = _a.sent();
                        if (reservationDataById) {
                            return [2 /*return*/, response.json(reservationDataById)];
                        }
                        else {
                            return [2 /*return*/, response.status(404).json({ error: "Reservation not found" })];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _a.sent();
                        console.error("Failed to select reservation data by id: ".concat(error_8));
                        return [2 /*return*/, response.status(500).json("Internal server error: ".concat(error_8))];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); })();

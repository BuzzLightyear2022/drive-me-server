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
var main_mjs_1 = require("./main.mjs");
var multer_1 = require("multer");
var fs_1 = require("fs");
var path_1 = require("path");
var sql_setup_mjs_1 = require("./sql_setup.mjs");
var storage = multer_1.default.memoryStorage();
var upload = (0, multer_1.default)({ storage: storage });
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlUpdate/vehicleAttributes", upload.fields([
            { name: "imageUrl" },
            { name: "data" }
        ]), function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var newVehicleAttributes, targetDirectoryPath, imageFiles, existingVehicleAttributes_1, existingVehicleAttributesJson, imageDataField, bufferImageUrl_1, fileName_1, currentImagePath_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newVehicleAttributes = JSON.parse(request.body["data"]);
                        targetDirectoryPath = "./car_images/";
                        imageFiles = request.files;
                        if (!fs_1.default.existsSync(targetDirectoryPath)) {
                            fs_1.default.mkdirSync(targetDirectoryPath);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, sql_setup_mjs_1.VehicleAttributesModel.findByPk(newVehicleAttributes.id)];
                    case 2:
                        existingVehicleAttributes_1 = _a.sent();
                        existingVehicleAttributesJson = existingVehicleAttributes_1 === null || existingVehicleAttributes_1 === void 0 ? void 0 : existingVehicleAttributes_1.get({ plain: true });
                        if (!existingVehicleAttributes_1) return [3 /*break*/, 4];
                        if (imageFiles && Array.isArray(imageFiles["imageUrl"])) {
                            imageDataField = imageFiles["imageUrl"][0];
                            bufferImageUrl_1 = imageDataField.buffer;
                            fileName_1 = imageDataField.originalname;
                            if (existingVehicleAttributesJson && existingVehicleAttributesJson.imageFileName) {
                                currentImagePath_1 = "./car_images/".concat(existingVehicleAttributesJson.imageFileName);
                                fs_1.default.access(currentImagePath_1, fs_1.default.constants.F_OK, function (imageNotFoundError) {
                                    if (!imageNotFoundError) {
                                        fs_1.default.unlink(currentImagePath_1, function (unlinkError) {
                                            if (unlinkError) {
                                                console.error("Failed to delete existing image file: ".concat(unlinkError));
                                            }
                                        });
                                        fs_1.default.writeFile(path_1.default.join(targetDirectoryPath, fileName_1), bufferImageUrl_1, "base64", function (writeError) { return __awaiter(void 0, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!writeError) return [3 /*break*/, 1];
                                                        console.error("Failed to write new image file: ".concat(writeError));
                                                        return [3 /*break*/, 3];
                                                    case 1:
                                                        newVehicleAttributes.imageFileName = fileName_1;
                                                        return [4 /*yield*/, existingVehicleAttributes_1.update(newVehicleAttributes)];
                                                    case 2:
                                                        _a.sent();
                                                        _a.label = 3;
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                    }
                                    else {
                                        fs_1.default.writeFile(path_1.default.join(targetDirectoryPath, fileName_1), bufferImageUrl_1, "base64", function (writeError) { return __awaiter(void 0, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!writeError) return [3 /*break*/, 1];
                                                        console.error("Failed to write new image file: ".concat(writeError));
                                                        return [3 /*break*/, 3];
                                                    case 1:
                                                        newVehicleAttributes.imageFileName = fileName_1;
                                                        return [4 /*yield*/, existingVehicleAttributes_1.update(newVehicleAttributes)];
                                                    case 2:
                                                        _a.sent();
                                                        _a.label = 3;
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                    }
                                });
                            }
                            else {
                                fs_1.default.writeFile(path_1.default.join(targetDirectoryPath, fileName_1), bufferImageUrl_1, "base64", function (writeError) { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!writeError) return [3 /*break*/, 1];
                                                console.error("Failed to write new image file: ".concat(writeError));
                                                return [3 /*break*/, 3];
                                            case 1:
                                                newVehicleAttributes.imageFileName = fileName_1;
                                                return [4 /*yield*/, existingVehicleAttributes_1.update(newVehicleAttributes)];
                                            case 2:
                                                _a.sent();
                                                _a.label = 3;
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); });
                            }
                        }
                        return [4 /*yield*/, existingVehicleAttributes_1.update(newVehicleAttributes)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        return [2 /*return*/, response.status(500).send("Failed to updata data on the database: ".concat(error_1))];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); })();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlUpdate/reservationData", upload.fields([
            { name: "data" }
        ]), function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var updateFields, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        updateFields = JSON.parse(request.body.data);
                        return [4 /*yield*/, sql_setup_mjs_1.ReservationDataModel.update(updateFields, {
                                where: { id: updateFields.id }
                            })];
                    case 1:
                        _a.sent();
                        // wsServer.clients.forEach((client: WebSocket) => {
                        // 	client.send("wsUpdate:reservationData");
                        // });
                        return [2 /*return*/, response.status(200).send("Reservation data saved successfully")];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, response.status(500).send("Failed to write reservation data to the database: ".concat(error_2))];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); })();

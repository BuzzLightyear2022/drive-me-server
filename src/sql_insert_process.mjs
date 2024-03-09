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
var sql_setup_mjs_1 = require("./sql_setup.mjs");
var storage = multer_1.default.memoryStorage();
var upload = (0, multer_1.default)({ storage: storage });
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlInsert/vehicleAttributes", upload.fields([
            { name: "imageUrl" },
            { name: "data" }
        ]), function (request, response) {
            var targetDirectoryPath = "./car_images/";
            var imageFiles = request.files;
            var jsonData = JSON.parse(request.body["data"]);
            if (!fs_1.default.existsSync(targetDirectoryPath)) {
                fs_1.default.mkdirSync(targetDirectoryPath);
            }
            if (imageFiles && Array.isArray(imageFiles["imageUrl"])) {
                var imageDataField = imageFiles["imageUrl"][0];
                var bufferImageUrl = imageDataField.buffer;
                var fileName = imageDataField.originalname;
                if (!fileName.endsWith(".jpeg") && !fileName.endsWith(".jpg" || "png")) {
                    return response.status(400).send("Invalid file format. Expected JPEG file.");
                }
                jsonData.imageFileName = fileName;
                fs_1.default.writeFile(targetDirectoryPath + fileName, bufferImageUrl, "base64", function (error) {
                    if (error) {
                        return response.status(500).send("Failed to write image file: " + error);
                    }
                });
            }
            try {
                sql_setup_mjs_1.VehicleAttributesModel.create(jsonData);
                return response.status(200).send("Data saved successfully");
            }
            catch (error) {
                return response.status(500).send("failed to write data to the database: " + error);
            }
        });
        return [2 /*return*/];
    });
}); })();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/sqlInsert/reservationData", upload.fields([
            { name: "data" }
        ]), function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var jsonData;
            return __generator(this, function (_a) {
                jsonData = JSON.parse(request.body.data);
                try {
                    sql_setup_mjs_1.ReservationDataModel.create(jsonData);
                    return [2 /*return*/, response.status(200).send("Reservation data saved successfully")];
                }
                catch (error) {
                    return [2 /*return*/, response.status(500).send("Failed to write reservation data to the database: ".concat(error))];
                }
                return [2 /*return*/];
            });
        }); });
        return [2 /*return*/];
    });
}); })();

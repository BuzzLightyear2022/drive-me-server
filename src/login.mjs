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
exports.authenticateToken = void 0;
var main_mjs_1 = require("./main.mjs");
var sql_setup_mjs_1 = require("./sql_setup.mjs");
var bcrypt = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var authenticateToken = function (request, response, next) {
    // @ts-ignore
    var token = request.headers.authorization;
    var secretKey = process.env.SECRET_KEY;
    if (!token) {
        return response.status(401).send("Unauthorized");
    }
    jsonwebtoken_1.default.verify(token, secretKey, function (error, user) {
        if (error) {
            console.log(error);
            return response.status(403);
        }
        // @ts-ignore
        request.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        main_mjs_1.app.post("/login/getSessionData", function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
            var secretKey, username, password, userData, hashedPassword, isPwCorrect, payload, token, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        secretKey = process.env.SECRET_KEY;
                        username = request.body.username;
                        password = request.body.password;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, sql_setup_mjs_1.UsersModel.findOne({
                                where: {
                                    username: username
                                }
                            })];
                    case 2:
                        userData = _a.sent();
                        if (!userData) return [3 /*break*/, 4];
                        hashedPassword = userData.dataValues.hashed_password;
                        return [4 /*yield*/, bcrypt.compare(password, hashedPassword)];
                    case 3:
                        isPwCorrect = _a.sent();
                        if (isPwCorrect) {
                            payload = {
                                userID: userData.dataValues.id,
                                username: userData.dataValues.username
                            };
                            token = jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: "1h" });
                            return [2 /*return*/, response.json(token)];
                        }
                        else {
                            return [2 /*return*/, response.json({
                                    error: "Invalid username or password"
                                })];
                        }
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        return [2 /*return*/, "An error occurred"];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); })();

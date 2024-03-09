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
exports.app = void 0;
var express_1 = require("express");
var cors_1 = require("cors");
var https_1 = require("https");
var ws_1 = require("ws");
var path_1 = require("path");
var fs_1 = require("fs");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
exports.app.use("/C2cFbaAZ", express_1.default.static("./car_images"));
var letsencryptDirectory = path_1.default.join("/", "etc", "letsencrypt", "live", "drive-me-test.com");
var privateKeyPath = path_1.default.join(letsencryptDirectory, "privkey.pem");
var certificatePath = path_1.default.join(letsencryptDirectory, "cert.pem");
var chainFilePath = path_1.default.join(letsencryptDirectory, "chain.pem");
var privateKey = fs_1.default.readFileSync(privateKeyPath, "utf8");
var certificate = fs_1.default.readFileSync(certificatePath, "utf8");
var chainFile = fs_1.default.readFileSync(chainFilePath, "utf8");
var credentials = {
    key: privateKey,
    cert: certificate,
    ca: chainFile
};
var httpsPort = process.env.HTTPS_PORT;
var httpsServer = https_1.default.createServer(credentials, exports.app);
httpsServer.listen(httpsPort, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("HTTPS Server running on port: ".concat(httpsPort));
                return [4 /*yield*/, Promise.resolve().then(function () { return require("./login.mjs"); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require("./sql_insert_process.mjs"); })];
            case 2:
                _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require("./sql_select_process.mjs"); })];
            case 3:
                _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require("./sql_update_process.mjs"); })];
            case 4:
                _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require("./fetch_json_process.mjs"); })];
            case 5:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
var wssServer = new ws_1.WebSocketServer({ server: httpsServer });
wssServer.on("connection", function () {
    console.log("Wss client connected");
});

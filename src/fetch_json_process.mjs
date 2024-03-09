"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main_mjs_1 = require("./main.mjs");
var path_1 = require("path");
var fs_1 = require("fs");
var fetchJson = function (args) {
    var endPoint = args.endPoint, fileName = args.fileName;
    main_mjs_1.app.post(endPoint, function (request, response) {
        var jsonFilePath = path_1.default.join("json_files", fileName);
        fs_1.default.readFile(jsonFilePath, "utf8", function (error, data) {
            try {
                var jsonData = JSON.parse(data);
                return response.json(jsonData);
            }
            catch (parseError) {
                return response.status(500).json({ "error": parseError });
            }
        });
    });
};
fetchJson({ endPoint: "/fetchJson/carCatalog", fileName: "car_catalog.json" });
fetchJson({ endPoint: "/fetchJson/navigations", fileName: "navigations.json" });

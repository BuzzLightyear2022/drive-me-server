import { app } from "./main.mjs";
import express from "express";
import path from "path";
import fs from "fs";

const fetchJson = (args: { endPoint: string, fileName: string }): void => {
    const { endPoint, fileName } = args;

    app.post(endPoint, (request: express.Request, response: express.Response): void => {
        const jsonFilePath: string = path.join("json_files", fileName);

        fs.readFile(jsonFilePath, "utf8", (error: unknown, data: string): express.Response => {
            try {
                const jsonData: JSON = JSON.parse(data);
                return response.json(jsonData);
            } catch (parseError: unknown) {
                return response.status(500).json({ "error": parseError });
            }
        });
    });
}

fetchJson({ endPoint: "/fetchJson/carCatalog", fileName: "car_catalog.json" });
fetchJson({ endPoint: "/fetchJson/navigations", fileName: "navigations.json" });
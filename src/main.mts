import express from "express";
import cors from "cors";
import https from "https";
import { WebSocketServer } from "ws";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

import { getSessionData } from "./login.mjs";
import "./sql_select_process.mjs";
import "./sql_update_process.mjs";
import "./fetch_json_process.mjs";
import "./sql_insert_process.mjs";

export const app: express.Express = express();

app.use(cors());
app.use("/C2cFbaAZ", express.static("./car_images"));

const letsencryptDirectory = path.join("/", "etc", "letsencrypt", "live", "drive-me-test.com");
const privateKeyPath = path.join(letsencryptDirectory, "privkey.pem");
const certificatePath = path.join(letsencryptDirectory, "cert.pem");
const chainFilePath = path.join(letsencryptDirectory, "chain.pem");

const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const certificate = fs.readFileSync(certificatePath, "utf8");
const chainFile = fs.readFileSync(chainFilePath, "utf8");

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: chainFile
}

const httpsPort: string = process.env.HTTPS_PORT as string;

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(httpsPort, () => {
    console.log(`HTTPS Server running on port: ${httpsPort}`);
});

const wssServer = new WebSocketServer({ server: httpsServer });
wssServer.on("connection", () => {
    console.log("Wss client connected");
});

getSessionData();
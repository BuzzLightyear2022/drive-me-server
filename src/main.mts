import express from "express";
import cors from "cors";
import https from "https";
import { WebSocketServer } from "ws";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const app: express.Express = express();

app.use(express.json());
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
httpsServer.listen(httpsPort, async () => {
    console.log(`HTTPS Server running on port: ${httpsPort}`);

    await import("./login.mjs");
    await import("./sql_insert_process.mjs");
    await import("./sql_select_process.mjs");
    await import("./sql_update_process.mjs");
    await import("./fetch_json_process.mjs");
});

export const wssServer = new WebSocketServer({ server: httpsServer });

const clients = new Map();

wssServer.on("connection", (ws, req) => {
    console.log("Wss client connected");

    ws.on("message", (message) => {
        console.log("Received message:", message);

        try {
            const { type, clientId } = JSON.parse(message.toString());

            if (type === "register") {
                console.log("Registering client:", clientId);

                if (clients.has(clientId)) {
                    console.log("Client already registered, closing old connection");
                    const oldWs = clients.get(clientId);
                    if (oldWs) oldWs.close();
                }

                clients.set(clientId, ws);
            } else {
                console.log("not a registration message");
            }
        } catch (error: unknown) {
            console.error("Error processing message:", error);
        }
    });

    ws.on("close", () => {
        for (let [clientId, clientWs] of clients.entries()) {
            if (clientWs === ws) {
                clients.delete(clientId);
                break;
            }
        }
        console.log("Updated clients:", clients);
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});
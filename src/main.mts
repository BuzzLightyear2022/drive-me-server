import { app } from "./app_setup.mjs";
import "./login.mjs";
import "./sql_select_process.mjs";
import "./sql_update_process.mjs";
import "./fetch_json_process.mjs";
import "./sql_insert_process.mjs";
import WebSocket from "ws";

// const wsServer = new WebSocket.Server({ noServer: true });

// wsServer.on("connection", (ws) => {
// 	console.log("Client connected");
// });
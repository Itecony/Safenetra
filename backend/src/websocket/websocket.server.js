import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

import {
    register_client,
    remove_client
} from "./websocket.registry.js";

import {
    subscribe,
    remove_ws_from_all_channels
} from "./websocket.channels.js";

let wss;

export const init_websocket = (server) => {

    wss = new WebSocketServer({
        server,
        path: "/ws"
    });

    wss.on("connection", (ws, req) => {

        try {

            const url = new URL(req.url, "http://localhost");

            const token = url.searchParams.get("token");

            if (!token) {
                ws.close(4001, "Authentication token missing");
                return;
            }

            const user = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            register_client(ws, user);

            console.log(`WebSocket connected → user ${user.id}`);

            // auto subscribe to user channel
            subscribe(ws, `user:${user.id}`);

            // operators automatically join operators channel
            if (user.role === "OPERATOR") {
                subscribe(ws, "operators");
            }

            ws.on("message", (message) => {

                try {

                    const data = JSON.parse(message);

                    if (data.type === "SUBSCRIBE_INCIDENT") {

                        subscribe(ws, `incident:${data.incident_id}`);

                        console.log(
                            `User ${user.id} subscribed to incident:${data.incident_id}`
                        );
                    }

                } catch (err) {
                    console.error("WS message error:", err.message);
                }

            });

            ws.on("close", () => {

                remove_ws_from_all_channels(ws);
                remove_client(ws);

                console.log(`WebSocket disconnected → user ${user.id}`);

            });

        } catch (err) {

            console.error("WebSocket auth failed:", err.message);

            ws.close(4002, "Authentication failed");

        }

    });

};
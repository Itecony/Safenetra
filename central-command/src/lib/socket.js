// lib/socket.js
const WS_URL = "wss://safe-n-core.onrender.com/ws";

export const createOperatorSocket = (token) => {
    // The backend expects the token as a query parameter
    return new WebSocket(`${WS_URL}?token=${token}`);
};
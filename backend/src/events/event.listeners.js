import { event_bus } from "./event.bus.js";
import {
    broadcast_location_update,
    broadcast_incident_created,
    broadcast_incident_resolved,
    broadcast_incident_cancelled
} from "../websocket/websocket.broadcast.js";

// LOCATION
event_bus.on("LOCATION_UPDATED", (payload) => {
    broadcast_location_update(payload);
});

// INCIDENT CREATED
event_bus.on("INCIDENT_CREATED", (payload) => {
    broadcast_incident_created(payload);
});

// RESOLVED
event_bus.on("INCIDENT_RESOLVED", (payload) => {
    broadcast_incident_resolved(payload);
});

// CANCELLED
event_bus.on("INCIDENT_CANCELLED", (payload) => {
    broadcast_incident_cancelled(payload);
});
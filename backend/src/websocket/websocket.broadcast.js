import { get_channel_clients, has_channel } from "./websocket.channels.js";

const send = (channel, type, payload) => {

    if (!has_channel(channel)) return;

    const message = JSON.stringify({
        type,
        data: payload
    });

    const clients = get_channel_clients(channel);

    for (const client of clients) {

        if (client.readyState === 1) {
            client.send(message);
        }

    }

};

export const broadcast_incident_created = (incident) => {

    send("operators", "INCIDENT_CREATED", incident);
    send(`user:${incident.user_id}`, "INCIDENT_CREATED", incident);

};

export const broadcast_location_update = (location) => {

    send(`incident:${location.incident_id}`, "LOCATION_UPDATE", location);
    send(`user:${location.user_id}`, "LOCATION_UPDATE", location);
    // ✅ NEW: Send to operators for immediate visibility
    send("operators", "LOCATION_UPDATE", location);

};

export const broadcast_incident_resolved = (incident) => {

    send(`incident:${incident.incident_id}`, "INCIDENT_RESOLVED", incident);
    send(`user:${incident.user_id}`, "INCIDENT_RESOLVED", incident);

};

export const broadcast_incident_cancelled = (incident) => {

    send(`incident:${incident.incident_id}`, "INCIDENT_CANCELLED", incident);
    send(`user:${incident.user_id}`, "INCIDENT_CANCELLED", incident);

};
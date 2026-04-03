import pkg from "../../models/index.cjs";
import { AppError } from "../../utils/app_error.js";
import { event_bus } from "../../events/event.bus.js";

const { Incident, IncidentLocation, sequelize } = pkg;

/**
 * Trigger SOS (Idempotent + Location Capture)
 */
export const trigger_sos_service = async (user, payload) => {
    const { location, trigger_type = "ONE_TAP" } = payload;
    const recorded_at = new Date();

    if (!location?.latitude || !location?.longitude) {
        throw new AppError(
            "Location is required",
            400,
            "LOCATION_REQUIRED"
        );
    }

    const transaction = await sequelize.transaction();

    try {
        // 1️⃣ Check existing ACTIVE incident
        const existing = await Incident.findOne({
            where: {
                user_id: user.id,
                status: "ACTIVE"
            },
            transaction
        });

        if (existing) {
            await transaction.commit();
            return {
                incident_id: existing.id,
                status: existing.status,
                tracking_required: true,
                is_existing: true
            };
        }

        // 2️⃣ Create Incident
        const incident = await Incident.create(
            {
                user_id: user.id,
                status: "ACTIVE",
                trigger_type,
                triggered_at: recorded_at // ✅ FIXED
            },
            { transaction }
        );

        // 3️⃣ Create Initial Location Record
        await IncidentLocation.create(
            {
                incident_id: incident.id,
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy || null,
                recorded_at
            },
            { transaction }
        );

        await transaction.commit();

        // 🔔 Emit incident created
        event_bus.emit("INCIDENT_CREATED", {
            incident_id: incident.id,
            user_id: user.id,
            status: incident.status,
            triggered_at: incident.triggered_at // ✅ FIXED
        });

        // 🔔 Emit initial location
        event_bus.emit("LOCATION_UPDATED", {
            incident_id: incident.id,
            user_id: user.id,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy || null,
            recorded_at
        });

        return {
            incident_id: incident.id,
            status: incident.status,
            tracking_required: true,
            is_existing: false
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


/**
 * Resolve Incident
 */
export const resolve_incident_service = async (incident_id, user) => {

    const incident = await Incident.findByPk(incident_id);

    if (!incident) {
        throw new AppError("Incident not found", 404, "INCIDENT_NOT_FOUND");
    }

    if (incident.status !== "ACTIVE") {
        throw new AppError("Incident is not active", 400, "INCIDENT_NOT_ACTIVE");
    }

    if (user.role === "USER" && incident.user_id !== user.id) {
        throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    const resolved_at = new Date();

    await incident.update({
        status: "RESOLVED",
        resolved_at
    });

    event_bus.emit("INCIDENT_RESOLVED", {
        incident_id: incident.id,
        user_id: incident.user_id,
        status: "RESOLVED",
        resolved_at
    });

    return {
        incident_id: incident.id,
        status: "RESOLVED"
    };
};


/**
 * Cancel Incident
 */
export const cancel_incident_service = async (incident_id, user) => {

    const incident = await Incident.findByPk(incident_id);

    if (!incident) {
        throw new AppError("Incident not found", 404, "INCIDENT_NOT_FOUND");
    }

    if (incident.status !== "ACTIVE") {
        throw new AppError("Incident is not active", 400, "INCIDENT_NOT_ACTIVE");
    }

    if (incident.user_id !== user.id) {
        throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    const resolved_at = new Date();

    await incident.update({
        status: "CANCELLED",
        resolved_at
    });

    event_bus.emit("INCIDENT_CANCELLED", {
        incident_id: incident.id,
        user_id: incident.user_id,
        status: "CANCELLED",
        resolved_at
    });

    return {
        incident_id: incident.id,
        status: "CANCELLED"
    };
};


/**
 * Add Location Update (Real-Time Tracking)
 */
export const add_incident_location_service = async (
    incident_id,
    user,
    payload
) => {
    const { location } = payload;
    const recorded_at = new Date();

    if (!location?.latitude || !location?.longitude) {
        throw new AppError(
            "Location is required",
            400,
            "LOCATION_REQUIRED"
        );
    }

    const incident = await Incident.findByPk(incident_id);

    if (!incident) {
        throw new AppError("Incident not found", 404, "INCIDENT_NOT_FOUND");
    }

    if (incident.status !== "ACTIVE") {
        throw new AppError("Incident is not active", 400, "INCIDENT_NOT_ACTIVE");
    }

    if (user.role === "USER" && incident.user_id !== user.id) {
        throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    // ✅ Deduplication / Throttling
    const lastLocation = await IncidentLocation.findOne({
        where: { incident_id },
        order: [["recorded_at", "DESC"]]
    });

    if (lastLocation) {
        const timeDiff = new Date(recorded_at) - new Date(lastLocation.recorded_at);

        if (timeDiff < 3000) {
            return {
                incident_id,
                location_skipped: true
            };
        }
    }

    await IncidentLocation.create({
        incident_id,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || null,
        recorded_at
    });

    // ✅ FIXED: use incident_id (not incident.id)
    event_bus.emit("LOCATION_UPDATED", {
        incident_id,
        user_id: user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || null,
        recorded_at
    });

    return {
        incident_id,
        location_recorded: true
    };
};


/**
 * Get Incidents (Operator View)
 */
export const get_incidents_service = async (query) => {

    const { status } = query;

    const where = {};
    if (status) where.status = status;

    const incidents = await Incident.findAll({
        where,
        order: [["created_at", "DESC"]]
    });

    return incidents;
};


/**
 * Get Incident Details
 */
export const get_incident_by_id_service = async (incident_id) => {

    const incident = await Incident.findByPk(incident_id, {
        include: [
            {
                model: IncidentLocation,
                as: "locations",
                order: [["recorded_at", "ASC"]]
            }
        ]
    });

    if (!incident) {
        throw new AppError("Incident not found", 404, "INCIDENT_NOT_FOUND");
    }

    return incident;
};
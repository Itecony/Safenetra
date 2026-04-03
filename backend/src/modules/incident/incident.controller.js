import { async_handler } from "../../utils/async_handler.js";
import { success_response } from "../../utils/response_formatter.js";
import {
    trigger_sos_service,
    resolve_incident_service,
    cancel_incident_service,
    add_incident_location_service,
    get_incidents_service,
    get_incident_by_id_service
} from "./incident.service.js";

/**
 * POST /api/incidents/sos
 */
export const trigger_sos = async_handler(async (req, res) => {

    const result = await trigger_sos_service(req.user, req.body);

    return success_response(res, {
        status_code: result.is_existing ? 200 : 201,
        message: result.is_existing
            ? "Active incident already exists"
            : "SOS triggered successfully",
        data: result
    });
});


/**
 * PATCH /api/incidents/:incident_id/resolve
 */
export const resolve_incident = async_handler(async (req, res) => {

    const result = await resolve_incident_service(
        req.params.incident_id,
        req.user
    );

    return success_response(res, {
        message: "Incident resolved successfully",
        data: result
    });
});


/**
 * PATCH /api/incidents/:incident_id/cancel
 */
export const cancel_incident = async_handler(async (req, res) => {

    const result = await cancel_incident_service(
        req.params.incident_id,
        req.user
    );

    return success_response(res, {
        message: "Incident cancelled successfully",
        data: result
    });
});


/**
 * POST /api/incidents/:incident_id/location
 */
export const add_incident_location = async_handler(async (req, res) => {

    const result = await add_incident_location_service(
        req.params.incident_id,
        req.user,
        req.body
    );

    return success_response(res, {
        message: "Location updated successfully",
        data: result
    });
});

/**
 * GET /api/incidents
 */
export const get_incidents = async_handler(async (req, res) => {

    const result = await get_incidents_service(req.query);

    return success_response(res, {
        message: "Incidents fetched successfully",
        data: result
    });
});

/**
 * GET /api/incidents/:incident_id
 */
export const get_incident_by_id = async_handler(async (req, res) => {

    const result = await get_incident_by_id_service(
        req.params.incident_id
    );

    return success_response(res, {
        message: "Incident fetched successfully",
        data: result
    });
});

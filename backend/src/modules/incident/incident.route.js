import express from "express";
import {
    trigger_sos,
    resolve_incident,
    cancel_incident,
    add_incident_location,
    get_incidents,
    get_incident_by_id
} from "./incident.controller.js";
import { authenticate, authorize } from "../../middlewares/auth_middleware.js";

const router = express.Router();

router.post("/sos", authenticate, trigger_sos);

router.patch("/:incident_id/resolve", authenticate, resolve_incident);
router.patch("/:incident_id/cancel", authenticate, cancel_incident);

router.post("/:incident_id/location", authenticate, add_incident_location);

router.get("/", authenticate, authorize("OPERATOR"), get_incidents);
router.get("/:incident_id", authenticate, authorize("OPERATOR"), get_incident_by_id);


export default router;
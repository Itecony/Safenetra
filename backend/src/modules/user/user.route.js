import express from "express";
import {
    get_me,
    get_user_by_id,
    get_all_users,
    update_me,
    delete_user
} from "./user.controller.js";
import { authenticate, authorize } from "../../middlewares/auth_middleware.js";

const router = express.Router();

router.get("/me", authenticate, get_me);
router.patch("/me", authenticate, update_me);

router.get("/", authenticate, authorize("USER", "ADMIN", "OPERATOR"), get_all_users);
router.get("/:id", authenticate, authorize("USER", "ADMIN", "OPERATOR"), get_user_by_id);
router.delete("/:id", authenticate, authorize("USER", "ADMIN", "OPERATOR"), delete_user);

export default router;
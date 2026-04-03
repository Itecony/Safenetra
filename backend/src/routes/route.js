import express from "express";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const router = express.Router();
const modules_path = path.join(process.cwd(), "src/modules");

const module_names = fs.readdirSync(modules_path);

for (const module_name of module_names) {
    const route_file = path.join(
        modules_path,
        module_name,
        `${module_name}.route.js`
    );

    if (fs.existsSync(route_file)) {
        const file_url = pathToFileURL(route_file).href; // ✅ convert to file:// URL
        const module_routes = await import(file_url);
        router.use(`/${module_name}`, module_routes.default);
    }
}

export default router;

import fs from "fs";
import path from "path";

const source = path.resolve("config/web.config");
const destination = path.resolve("dist/web.config");

fs.copyFileSync(source, destination);

console.log("web.config copied to dist/");

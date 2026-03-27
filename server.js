import { createServer } from "http";
import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, "dist");
const port = process.env.PORT || 3000;

const types = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

createServer((req, res) => {
  let path = join(dist, req.url === "/" ? "index.html" : req.url);
  if (!existsSync(path)) path = join(dist, "index.html");
  const ext = extname(path);
  res.writeHead(200, { "Content-Type": types[ext] || "text/html" });
  res.end(readFileSync(path));
}).listen(port, () => console.log("Listening on " + port));

// tools/filesystem/server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const workspaceDir = process.env.FS_DIR || path.resolve("./workspace");

app.get("/list", (req, res) => {
  fs.readdir(workspaceDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const output = files.map((name) => {
      const fullPath = path.join(workspaceDir, name);
      const stats = fs.statSync(fullPath);
      return {
        name,
        size: stats.size,
        modified: stats.mtime,
        type: stats.isDirectory() ? "directory" : "file",
      };
    });
    res.json(output);
  });
});

app.get("/read", (req, res) => {
  const requestedPath = req.query.path || "";
  const filePath = path.resolve(workspaceDir, requestedPath);

  const relative = path.relative(workspaceDir, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return res.status(403).json({ error: "Unauthorized path" });
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ name: path.basename(filePath), content: data });
  });
});

const port = process.env.FILESYSTEM_PORT || 4001;
app.listen(port, () => {
  console.log(`📂 Filesystem tool running at http://localhost:${port}`);
  console.log(`📁 Serving directory: ${workspaceDir}`);
});

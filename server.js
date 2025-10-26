import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import the tunnel update script
import './updateTunnelLink.js'; // <-- This runs automatically when server starts

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const mediaDir = path.join(__dirname, "public/media");
const publicDir = path.join(__dirname, "public");

app.use("/media", express.static(mediaDir));
app.use(express.static(publicDir));

app.get("/playlist", (req, res) => {
  try {
    const videos = fs.readdirSync(path.join(mediaDir, "videos"))
      .filter(f => f.match(/\.(mp4|mov|m4v)$/i))
      .map(f => ({ type: "video", file: `videos/${f}` }));

    const images = fs.readdirSync(path.join(mediaDir, "images"))
      .filter(f => f.match(/\.(png|jpg|jpeg)$/i))
      .map(f => ({ type: "image", file: `images/${f}` }));

    res.json([...videos, ...images]);
  } catch (err) {
    res.status(500).json({ error: "Folder read error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(3000, () => console.log("✅ Server running at http://localhost:3000"));

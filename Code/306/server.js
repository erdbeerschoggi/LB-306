const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jumpnrun";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB verbunden"))
  .catch(err => console.error("MongoDB Fehler:", err.message));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true }
});

const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timeMs: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Score = mongoose.model("Score", scoreSchema);

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.substring(7) : null;
  if (!token) return res.status(401).json({ message: "Nicht angemeldet" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Ungültiger Token" });
  }
}

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || password.length < 4) {
      return res.status(400).json({ message: "Benutzername und Passwort min. 4 Zeichen" });
    }

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: "Benutzer existiert bereits" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    res.status(201).json({ message: "Registrierung erfolgreich", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Serverfehler" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Login fehlgeschlagen" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Login fehlgeschlagen" });

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ message: "Login erfolgreich", token, username: user.username });
});

app.post("/api/scores", auth, async (req, res) => {
  const { timeMs } = req.body;
  if (!Number.isFinite(timeMs) || timeMs <= 0) {
    return res.status(400).json({ message: "Ungültige Zeit" });
  }

  const score = await Score.create({ userId: req.user.id, timeMs });
  res.status(201).json({ message: "Zeit gespeichert", score });
});

app.get("/api/scores/top3", auth, async (req, res) => {
  const scores = await Score.find({ userId: req.user.id })
    .sort({ timeMs: 1 })
    .limit(3);
  res.json(scores);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));

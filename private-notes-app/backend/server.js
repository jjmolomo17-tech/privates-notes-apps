// Import dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware to protect routes
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// ---------------- AUTH ROUTES ----------------

// Signup
app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "User created", user: data.user });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  // Create JWT
  const token = jwt.sign({ id: data.user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true });
  res.json({ message: "Logged in" });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// ---------------- NOTES ROUTES ----------------

// Get notes
app.get("/api/notes", authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", req.user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create note
app.post("/api/notes", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const { data, error } = await supabase
    .from("notes")
    .insert([{ title, content, user_id: req.user.id }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update note
app.put("/api/notes/:id", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const { data, error } = await supabase
    .from("notes")
    .update({ title, content })
    .eq("id", req.params.id)
    .eq("user_id", req.user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Delete note
app.delete("/api/notes/:id", authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Start server
app.listen(5000, () => console.log("Backend running on http://localhost:5000"));

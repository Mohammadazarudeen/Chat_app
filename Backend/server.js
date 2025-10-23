import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { pool } from "./db.js";
import { register, login } from "./controllers/authController.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.post("/api/register", register);
app.post("/api/login", login);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    const { userId, text } = data;
    const result = await pool.query(
      "INSERT INTO messages (user_id, text) VALUES ($1, $2) RETURNING *",
      [userId, text]
    );
    io.emit("receiveMessage", result.rows[0]);
  });

  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

server.listen(process.env.PORT, async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50),
      email VARCHAR(100) UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      text TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log(`✅ Server running on port ${process.env.PORT}`);
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join a room based on user id
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // handle private messages
  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, text } = data;

    const result = await pool.query(
      "INSERT INTO messages (user_id, receiver_id, text) VALUES ($1, $2, $3) RETURNING *",
      [senderId, receiverId, text]
    );

    const message = result.rows[0];

    // emit to sender and receiver rooms only
    io.to(`user_${senderId}`).emit("receiveMessage", message);
    io.to(`user_${receiverId}`).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/messages/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;
  const result = await pool.query(
    `SELECT * FROM messages
     WHERE (user_id=$1 AND receiver_id=$2)
     OR (user_id=$2 AND receiver_id=$1)
     ORDER BY created_at ASC`,
    [senderId, receiverId]
  );
  res.json(result.rows);
});

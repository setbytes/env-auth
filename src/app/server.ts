import express, { Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import { CorsMiddleware } from "@/app/middlewares/CorsMiddleware";

// declarations
const app = express();
const sessions = new Map<string, string>();

// middleware
app.use(morgan("dev"));
app.use(cors(CorsMiddleware.apply));

// socket
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    sessions.set(token, socket.id);
    return next();
  }
  return next(new Error("Unauthorized"));
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    for (const [id, session] of sessions.entries()) {
      if (session === socket.id) sessions.delete(id);
    }
  });
});

// controllers
app.get("/callback", (request: Request, response: Response): void => {
  io.to(sessions.get((request.query as any).state) as any).emit("github", request.query);
  response.send("✅ Login successful! You can return to the terminal.");
});

app.get("/health", (request: Request, response: Response): void => {
  response.status(200).send("✅ Server is healthy.");
});

httpServer.listen(process.env.PORT || 3000, () => {
  console.log(`OAuth broker running at http://localhost:${process.env.PORT || 3000}`);
});

import express from "express";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import path from "path";
import cors from "cors";

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors({
    origin: process.env.APP_URL,
    credentials: true
  }));
  app.use(express.json());

  // API Routes
  app.get("/api/students", async (req, res) => {
    try {
      const students = await prisma.student.findMany({
        orderBy: { created_at: 'desc' }
      });
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.post("/api/students", async (req, res) => {
    const { name, email, phone, status, plan } = req.body;
    try {
      const newStudent = await prisma.student.create({
        data: {
          name,
          email,
          phone,
          status: status || 'Ativo',
          plan
        }
      });
      res.status(201).json(newStudent);
    } catch (error) {
      res.status(500).json({ error: "Failed to create student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      await prisma.student.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), "frontend"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "frontend", "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "frontend", "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VOLL Candidate running on http://localhost:${PORT}`);
  });
}

startServer();

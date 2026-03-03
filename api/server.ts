import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3001;

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

  // Schedule Routes
  app.get("/api/schedules", async (req, res) => {
    try {
      const schedules = await prisma.schedule.findMany({
        include: { student: true },
        orderBy: { dateTime: 'asc' }
      });
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    const { studentId, dateTime, notes } = req.body;
    try {
      const newSchedule = await prisma.schedule.create({
        data: {
          studentId: parseInt(studentId),
          dateTime: new Date(dateTime),
          notes,
          status: 'Agendado'
        },
        include: { student: true }
      });
      res.status(201).json(newSchedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create schedule" });
    }
  });

  app.delete("/api/schedules/:id", async (req, res) => {
    try {
      await prisma.schedule.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete schedule" });
    }
  });

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    const path = await import("path");
    const frontendDist = path.join(process.cwd(), "frontend", "dist");
    app.use(express.static(frontendDist));
    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API Server running on http://localhost:${PORT}`);
  });
}

startServer();

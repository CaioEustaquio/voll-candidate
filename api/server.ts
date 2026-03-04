import "dotenv/config";
process.stdout.write("SERVER.TS LOADED\n");
import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

async function startServer() {
  console.log("Starting API Server...");
  let prisma: PrismaClient;
  try {
    let dbUrl = process.env.DATABASE_URL || "";
    
    if (!dbUrl) {
      console.error("ERROR: DATABASE_URL is not defined in environment variables.");
    }

    // Auto-fix for Supabase Pooler (port 6543)
    if (dbUrl.includes(":6543") && !dbUrl.includes("pgbouncer=true")) {
      dbUrl += (dbUrl.includes("?") ? "&" : "?") + "pgbouncer=true";
      process.env.DATABASE_URL = dbUrl;
      console.log("Detected Supabase Pooler port 6543. Appended ?pgbouncer=true to DATABASE_URL");
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    });
    
    const host = dbUrl.split("@")[1] || "unknown host";
    console.log(`Prisma Client initialized. Target host: ${host.split("/")[0]}`);
  } catch (e) {
    console.error("Failed to initialize Prisma Client:", e);
    // Don't exit, let the server start so we can see errors in routes
  }
  
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV, time: new Date().toISOString() });
  });

  app.get("/api/students", async (req, res) => {
    console.log("GET /api/students");
    try {
      const students = await prisma.student.findMany({
        orderBy: { created_at: 'desc' }
      });
      res.json(students);
    } catch (error) {
      console.error("Prisma Error (students):", error);
      res.status(500).json({ error: "Failed to fetch students", details: error instanceof Error ? error.message : String(error) });
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
      console.error("Prisma Error (create student):", error);
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
      console.error("Prisma Error (delete student):", error);
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
      console.error("Prisma Error (schedules):", error);
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

  // Transaction Routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await prisma.transaction.findMany({
        orderBy: { dueDate: 'desc' }
      });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    const { description, amount, type, category, dueDate, status } = req.body;
    try {
      const newTransaction = await prisma.transaction.create({
        data: {
          description,
          amount: parseFloat(amount),
          type,
          category,
          dueDate: new Date(dueDate),
          status: status || 'Pendente'
        }
      });
      res.status(201).json(newTransaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      await prisma.transaction.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete transaction" });
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

  const host = "0.0.0.0";
  app.listen(Number(PORT), host, () => {
    process.stdout.write(`API Server is listening on http://${host}:${PORT}\n`);
  });
}

startServer();

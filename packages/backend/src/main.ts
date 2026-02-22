import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env["PORT"] ?? 3000);

// Middleware
app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API info
app.get("/api", (_req: Request, res: Response) => {
  res.json({ message: "Inventory Management API", version: "1.0.0" });
});

// Products placeholder
app.get("/api/products", (_req: Request, res: Response) => {
  res.json({
    data: [
      { id: 1, name: "Widget A", sku: "WGT-001", stock: 150, price: 29.99 },
      { id: 2, name: "Gadget B", sku: "GDG-002", stock: 23, price: 79.99 },
      { id: 3, name: "Component C", sku: "CMP-003", stock: 5, price: 14.99 },
    ],
    total: 3,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API:    http://localhost:${PORT}/api`);
});

export default app;

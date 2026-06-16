import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  initialUsers, 
  sampleStores, 
  sampleCategories, 
  sampleSuppliers, 
  sampleProducts, 
  samplePurchaseOrders, 
  sampleTransactions, 
  sampleCustomers, 
  sampleEmployees, 
  sampleNotifications 
} from "./src/mockData";
import { Product, SalesTransaction, PurchaseOrder, SystemNotification } from "./src/types";

const DB_FILE = path.join(process.cwd(), "src", "database.json");

// Define basic seed structure
interface DatabaseSchema {
  products: any[];
  transactions: any[];
  stores: any[];
  categories: any[];
  suppliers: any[];
  purchaseOrders: any[];
  notifications: any[];
  employees: any[];
  customers: any[];
  users: any[];
}

// Function to read the database
function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read database file, resetting to defaults...", err);
  }

  // Fallback / Seed initial data
  const defaultDb: DatabaseSchema = {
    products: sampleProducts,
    transactions: sampleTransactions,
    stores: sampleStores,
    categories: sampleCategories,
    suppliers: sampleSuppliers,
    purchaseOrders: samplePurchaseOrders,
    notifications: sampleNotifications,
    employees: sampleEmployees,
    customers: sampleCustomers,
    users: initialUsers,
  };
  writeDatabase(defaultDb);
  return defaultDb;
}

// Function to write the database
function writeDatabase(data: DatabaseSchema) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to database file", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body-parsing
  app.use(express.json());

  // --- API ROUTING ENDPOINTS ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", type: "express-node-backend" });
  });

  // --- PRODUCTS ---
  app.get(["/api/products", "/api/products/"], (req, res) => {
    const db = readDatabase();
    res.json(db.products);
  });

  app.post(["/api/products", "/api/products/"], (req, res) => {
    const db = readDatabase();
    const body = req.body;

    const quantity = Number(body.quantity) || 0;
    const reorderLevel = Number(body.reorderLevel) || 10;
    const status = quantity <= reorderLevel ? "Critical" : "Healthy";

    const newProduct: Product = {
      ...body,
      id: "PRD-" + Math.floor(100 + Math.random() * 900),
      costPrice: Number(body.costPrice) || 0,
      sellingPrice: Number(body.sellingPrice) || 0,
      quantity,
      reorderLevel,
      status,
    };

    db.products.unshift(newProduct);
    writeDatabase(db);
    res.status(201).json(newProduct);
  });

  app.patch(["/api/products/:id", "/api/products/:id/"], (req, res) => {
    const db = readDatabase();
    const id = req.params.id;
    const body = req.body;

    const prdIndex = db.products.findIndex((p) => p.id === id);
    if (prdIndex === -1) {
       res.status(404).json({ error: "Product not found" });
       return;
    }

    const prd = db.products[prdIndex];

    // Handle both fields (snake_case from django_api and camelCase)
    if (body.quantity !== undefined) {
      prd.quantity = Number(body.quantity);
      prd.status = prd.quantity <= prd.reorderLevel ? "Critical" : "Healthy";
    }
    if (body.selling_price !== undefined) {
      prd.sellingPrice = Number(body.selling_price);
    }
    if (body.sellingPrice !== undefined) {
      prd.sellingPrice = Number(body.sellingPrice);
    }

    db.products[prdIndex] = prd;
    writeDatabase(db);
    res.json(prd);
  });

  app.delete(["/api/products/:id", "/api/products/:id/"], (req, res) => {
    const db = readDatabase();
    const id = req.params.id;

    const initialLength = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);

    if (db.products.length === initialLength) {
       res.status(444).json({ error: "Product not found" });
       return;
    }

    writeDatabase(db);
    res.status(204).end();
  });

  // --- TRANSACTIONS ---
  app.get(["/api/transactions", "/api/transactions/"], (req, res) => {
    const db = readDatabase();
    res.json(db.transactions);
  });

  app.post(["/api/transactions", "/api/transactions/"], (req, res) => {
    const db = readDatabase();
    const body = req.body;

    const id = body.id || "#TRX-" + Math.floor(1000 + Math.random() * 9000);
    const newTrx: SalesTransaction = {
      ...body,
      id,
      dateTime: body.dateTime || "Just Now",
      amount: Number(body.amount) || 0,
      status: body.status || "Completed",
    };

    // Update quantities of purchased items in product catalog
    if (Array.isArray(body.items)) {
      body.items.forEach((item: any) => {
        const prd = db.products.find((p) => p.id === item.productId);
        if (prd) {
          prd.quantity = Math.max(0, prd.quantity - (Number(item.quantity) || 1));
          prd.status = prd.quantity <= prd.reorderLevel ? "Critical" : "Healthy";
        }
      });
    }

    // Update corresponding customer's spend totals and loyalty points on the server side
    if (body.customerName) {
      const cust = db.customers.find((c) => c.name.toLowerCase() === body.customerName.toLowerCase());
      if (cust) {
        cust.totalSpend = Number(((cust.totalSpend || 0) + newTrx.amount).toFixed(2));
        cust.loyaltyPoints = (cust.loyaltyPoints || 0) + Math.floor(newTrx.amount * 0.1);
      }
    }

    db.transactions.unshift(newTrx);
    writeDatabase(db);
    res.status(201).json(newTrx);
  });

  // --- STORES ---
  app.get(["/api/stores", "/api/stores/"], (req, res) => {
    const db = readDatabase();
    res.json(db.stores);
  });

  app.post(["/api/stores", "/api/stores/"], (req, res) => {
    const db = readDatabase();
    const body = req.body;
    const newStore = {
      ...body,
      id: body.id || "STR-" + Math.floor(100 + Math.random() * 900),
      dailySales: Number(body.dailySales) || 0,
      salesGrowth: Number(body.salesGrowth) || 0,
      inventoryCount: Number(body.inventoryCount) || 120,
      inventoryCapacityPct: Number(body.inventoryCapacityPct) || 45,
      status: body.status || "Online"
    };
    db.stores.unshift(newStore);
    writeDatabase(db);
    res.status(201).json(newStore);
  });

  // --- EMPLOYEES ---
  app.get(["/api/employees", "/api/employees/"], (req, res) => {
    const db = readDatabase();
    res.json(db.employees);
  });

  app.post(["/api/employees", "/api/employees/"], (req, res) => {
    const db = readDatabase();
    const body = req.body;
    const newEmployee = {
      ...body,
      id: body.id || "EMP-" + Math.floor(1000 + Math.random() * 9000),
      salary: Number(body.salary) || 42000,
      joinedDate: body.joinedDate || "Just Now",
      status: body.status || "Active"
    };
    db.employees.unshift(newEmployee);
    writeDatabase(db);
    res.status(201).json(newEmployee);
  });

  // --- CUSTOMERS ---
  app.get(["/api/customers", "/api/customers/"], (req, res) => {
    const db = readDatabase();
    res.json(db.customers);
  });

  app.post(["/api/customers", "/api/customers/"], (req, res) => {
    const db = readDatabase();
    const body = req.body;
    const newCustomer = {
      ...body,
      id: body.id || "CUS-" + Math.floor(1000 + Math.random() * 9000),
      totalSpend: Number(body.totalSpend) || 0,
      loyaltyPoints: Number(body.loyaltyPoints) || 0,
      segment: body.segment || "New Client"
    };
    db.customers.unshift(newCustomer);
    writeDatabase(db);
    res.status(201).json(newCustomer);
  });

  // --- SUPPLIERS ---
  app.get(["/api/suppliers", "/api/suppliers/"], (req, res) => {
    const db = readDatabase();
    res.json(db.suppliers);
  });

  app.post(["/api/suppliers", "/api/suppliers/"], (req, res) => {
    const db = readDatabase();
    const body = req.body;
    const newSupplier = {
      ...body,
      id: body.id || "SPL-" + Math.floor(100 + Math.random() * 900),
      outstandingBalance: Number(body.outstandingBalance) || 0,
      fulfillmentRatePct: Number(body.fulfillmentRatePct) || 98,
      status: body.status || "Standard"
    };
    db.suppliers.unshift(newSupplier);
    writeDatabase(db);
    res.status(201).json(newSupplier);
  });

  // --- PURCHASE ORDERS (POs) ---
  app.get(["/api/purchase-orders", "/api/purchase-orders/"], (req, res) => {
    const db = readDatabase();
    res.json(db.purchaseOrders);
  });

  app.post(["/api/purchase-orders", "/api/purchase-orders/"], (req, res) => {
    const db = readDatabase();
    const body = req.body;
    const newPo = {
      ...body,
      id: body.id || "PO-" + Math.floor(10000 + Math.random() * 89999),
      createdAt: "Just Now",
      itemCount: Number(body.itemCount) || 10,
      totalAmount: Number(body.totalAmount) || 1200,
      status: body.status || "PENDING",
      deliveryStatus: body.deliveryStatus || "Scheduled"
    };
    db.purchaseOrders.unshift(newPo);

    // Dynamic warning alert in system notifier
    const alertNotif = {
      id: "NTF-PO-" + Math.floor(1000 + Math.random() * 9000),
      type: "purchase_order",
      title: "New Procurement Drafted",
      message: `Purchase Order ${newPo.id} has been registered for supplier ${newPo.supplierName} with budget outline of $${newPo.totalAmount.toLocaleString()}.`,
      timestamp: "Just Now",
      urgency: "info",
      unread: true
    };
    db.notifications.unshift(alertNotif);
    writeDatabase(db);
    res.status(201).json(newPo);
  });

  app.patch(["/api/purchase-orders/:id", "/api/purchase-orders/:id/"], (req, res) => {
    const db = readDatabase();
    const id = req.params.id;
    const body = req.body;

    const poIndex = db.purchaseOrders.findIndex((p) => p.id === id);
    if (poIndex === -1) {
       res.status(404).json({ error: "Purchase Order not found" });
       return;
    }

    const po = db.purchaseOrders[poIndex];
    if (body.status !== undefined) {
      po.status = body.status;
      if (body.status === "APPROVED") {
        po.deliveryStatus = "In-Transit";

        // Update supplier's outstanding balance
        const sup = db.suppliers.find((s) => s.id === po.supplierId);
        if (sup) {
          sup.outstandingBalance = (Number(sup.outstandingBalance) || 0) + (Number(po.totalAmount) || 0);
        }
      }
    }

    db.purchaseOrders[poIndex] = po;
    writeDatabase(db);
    res.json(po);
  });

  // --- NOTIFICATIONS ---
  app.get(["/api/notifications", "/api/notifications/"], (req, res) => {
    const db = readDatabase();
    res.json(db.notifications);
  });

  app.patch(["/api/notifications/:id", "/api/notifications/:id/"], (req, res) => {
    const db = readDatabase();
    const id = req.params.id;
    const body = req.body;

    const notifIndex = db.notifications.findIndex((n) => n.id === id);
    if (notifIndex === -1) {
       res.status(404).json({ error: "Notification not found" });
       return;
    }

    const notif = db.notifications[notifIndex];
    if (body.unread !== undefined) {
      notif.unread = !!body.unread;
    }

    db.notifications[notifIndex] = notif;
    writeDatabase(db);
    res.json(notif);
  });

  // --- VITE DEV / PRODUCTION STATIC MIDDLES ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ShopNest Full-Stack] Server running on http://localhost:${PORT}`);
  });
}

startServer();

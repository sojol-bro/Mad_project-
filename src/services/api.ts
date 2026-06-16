import { Product, SalesTransaction, Store, Employee, Customer, Supplier, SystemNotification, PurchaseOrder } from "../types";

// Base API URL Config
// Defaults to local Django backend but can be adjusted or swapped to live endpoints
const DJANGO_API_URL = "http://localhost:8000/api";

/**
 * Enterprise API Adapter class designed for the React Native/Web application
 * to integrate with our Django REST Framework backend.
 */
export const ShopNestAPI = {
  // --- Products Service ---
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${DJANGO_API_URL}/products/`);
    if (!response.ok) throw new Error("Failed to fetch products from Django");
    return response.json();
  },

  async createProduct(product: Omit<Product, "id" | "status">): Promise<Product> {
    const response = await fetch(`${DJANGO_API_URL}/products/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error("Failed to register product on Django backend");
    return response.json();
  },

  async updateProductQuantity(productId: string, quantity: number): Promise<Product> {
    const response = await fetch(`${DJANGO_API_URL}/products/${productId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error("Failed to update product quantity on Django backend");
    return response.json();
  },

  async applyMarkdown(productId: string, sellingPrice: number): Promise<Product> {
    const response = await fetch(`${DJANGO_API_URL}/products/${productId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selling_price: sellingPrice }),
    });
    if (!response.ok) throw new Error("Failed to apply markdown on Django backend");
    return response.json();
  },

  async deleteProduct(productId: string): Promise<void> {
    const response = await fetch(`${DJANGO_API_URL}/products/${productId}/`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to purge product from Django registry");
  },

  // --- Transactions Service ---
  async getTransactions(): Promise<SalesTransaction[]> {
    const response = await fetch(`${DJANGO_API_URL}/transactions/`);
    if (!response.ok) throw new Error("Failed to fetch transactions ledger");
    return response.json();
  },

  async createTransaction(transaction: Omit<SalesTransaction, "id">): Promise<SalesTransaction> {
    const response = await fetch(`${DJANGO_API_URL}/transactions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error("Failed to persist sales checkout session");
    return response.json();
  },

  // --- Stores Service ---
  async getStores(): Promise<Store[]> {
    const response = await fetch(`${DJANGO_API_URL}/stores/`);
    if (!response.ok) throw new Error("Failed to retrieve system locations");
    return response.json();
  },

  // --- Employees Service ---
  async getEmployees(): Promise<Employee[]> {
    const response = await fetch(`${DJANGO_API_URL}/employees/`);
    if (!response.ok) throw new Error("Failed to retrieve registered workforce");
    return response.json();
  },

  // --- Customers (CRM) Service ---
  async getCustomers(): Promise<Customer[]> {
    const response = await fetch(`${DJANGO_API_URL}/customers/`);
    if (!response.ok) throw new Error("Failed to retrieve VIP customer directories");
    return response.json();
  },

  // --- Suppliers Service ---
  async getSuppliers(): Promise<Supplier[]> {
    const response = await fetch(`${DJANGO_API_URL}/suppliers/`);
    if (!response.ok) throw new Error("Failed to retrieve supplier index records");
    return response.json();
  },

  // --- Purchase Orders Service ---
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const response = await fetch(`${DJANGO_API_URL}/purchase-orders/`);
    if (!response.ok) throw new Error("Failed to retrieve purchase orders logs");
    return response.json();
  },

  async approvePurchaseOrder(poId: string): Promise<PurchaseOrder> {
    const response = await fetch(`${DJANGO_API_URL}/purchase-orders/${poId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    if (!response.ok) throw new Error("Failed to sign budget contract PO");
    return response.json();
  },

  // --- System Notifications Service ---
  async getNotifications(): Promise<SystemNotification[]> {
    const response = await fetch(`${DJANGO_API_URL}/notifications/`);
    if (!response.ok) throw new Error("Failed to load active system alarm logs");
    return response.json();
  },

  async markNotificationRead(notifId: string): Promise<SystemNotification> {
    const response = await fetch(`${DJANGO_API_URL}/notifications/${notifId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unread: false }),
    });
    if (!response.ok) throw new Error("Failed to clear system notification record");
    return response.json();
  },

  // --- CRM & Directory Creations ---
  async createCustomer(customer: Omit<Customer, "id" | "totalSpend" | "loyaltyPoints">): Promise<Customer> {
    const response = await fetch(`${DJANGO_API_URL}/customers/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    });
    if (!response.ok) throw new Error("Failed to register customer to CRM directory");
    return response.json();
  },

  async createEmployee(employee: Omit<Employee, "id" | "joinedDate">): Promise<Employee> {
    const response = await fetch(`${DJANGO_API_URL}/employees/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });
    if (!response.ok) throw new Error("Failed to register employee in database");
    return response.json();
  },

  async createSupplier(supplier: Omit<Supplier, "id" | "outstandingBalance" | "fulfillmentRatePct">): Promise<Supplier> {
    const response = await fetch(`${DJANGO_API_URL}/suppliers/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supplier),
    });
    if (!response.ok) throw new Error("Failed to link vendor partner in registry");
    return response.json();
  },

  async createStore(store: Omit<Store, "id" | "dailySales" | "salesGrowth">): Promise<Store> {
    const response = await fetch(`${DJANGO_API_URL}/stores/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(store),
    });
    if (!response.ok) throw new Error("Failed to configure system store branch");
    return response.json();
  },

  async createPurchaseOrder(po: Omit<PurchaseOrder, "id" | "createdAt" | "status">): Promise<PurchaseOrder> {
    const response = await fetch(`${DJANGO_API_URL}/purchase-orders/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(po),
    });
    if (!response.ok) throw new Error("Failed to draft replenishment order");
    return response.json();
  },
};

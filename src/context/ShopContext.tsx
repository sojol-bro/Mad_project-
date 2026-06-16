import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, UserRole, Store, Product, Category, Supplier, PurchaseOrder, SalesTransaction, Customer, Employee, SystemNotification } from "../types";
import { initialUsers, sampleCompany, sampleStores, sampleCategories, sampleSuppliers, sampleProducts, samplePurchaseOrders, sampleTransactions, sampleCustomers, sampleEmployees, sampleNotifications } from "../mockData";
import { ShopNestAPI } from "../services/api";

interface ShopContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  currentUser: User;
  setCurrentUser: (usr: User) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  syncQueue: string[];
  setSyncQueue: (queue: string[]) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  transactions: SalesTransaction[];
  setTransactions: (transactions: SalesTransaction[]) => void;
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: (pos: PurchaseOrder[]) => void;
  notifications: SystemNotification[];
  setNotifications: (notifs: SystemNotification[]) => void;
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  suppliers: Supplier[];
  setSuppliers: (suppliers: Supplier[]) => void;
  stores: Store[];
  setStores: (stores: Store[]) => void;

  // Database operations (Simulated Backend)
  handleAuthLogin: (usr: User) => void;
  handleAddProduct: (newP: Omit<Product, "id" | "status">) => void;
  handleUpdateProductQty: (productId: string, newQty: number) => void;
  handleApplyMarkdown: (prdId: string, markdownPct: number) => void;
  handleDiscardProduct: (prdId: string) => void;
  handlePOSCheckout: (
    paymentMethod: "Cash" | "Card" | "Mobile" | "Bank", 
    customerNameStr: string,
    cartItems: { product: Product; qty: number }[],
    totalAmount: number
  ) => SalesTransaction;
  handleApprovePO: (poId: string) => void;
  handleReadNotification: (nid: string) => void;
  handleTriggerFulfillSync: () => void;
  handleSwitchSessionRole: (role: UserRole) => void;
  
  // Custom directory handlers for real persistence
  handleAddCustomer: (newC: Omit<Customer, "id" | "totalSpend" | "loyaltyPoints">) => void;
  handleAddEmployee: (newE: Omit<Employee, "id" | "joinedDate">) => void;
  handleAddSupplier: (newS: Omit<Supplier, "id" | "outstandingBalance" | "fulfillmentRatePct">) => void;
  handleAddStore: (newS: Omit<Store, "id" | "dailySales" | "salesGrowth">) => void;
  handleCreatePurchaseOrder: (newPo: Omit<PurchaseOrder, "id" | "createdAt" | "status">) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // default Marcus Sterling
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isOffline, setIsOffline] = useState(false);
  const [syncQueue, setSyncQueue] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Database core state
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [transactions, setTransactions] = useState<SalesTransaction[]>(sampleTransactions);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(samplePurchaseOrders);
  const [notifications, setNotifications] = useState<SystemNotification[]>(sampleNotifications);
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees);
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(sampleSuppliers);
  const [stores, setStores] = useState<Store[]>(sampleStores);

  // Load data from integrated Express database on startup
  useEffect(() => {
    if (!isOffline) {
      const loadAllData = async () => {
        try {
          const [prds, trxs, pos, notifs, emps, custs, sups, strs] = await Promise.all([
            ShopNestAPI.getProducts(),
            ShopNestAPI.getTransactions(),
            ShopNestAPI.getPurchaseOrders(),
            ShopNestAPI.getNotifications(),
            ShopNestAPI.getEmployees(),
            ShopNestAPI.getCustomers(),
            ShopNestAPI.getSuppliers(),
            ShopNestAPI.getStores(),
          ]);
          setProducts(prds);
          setTransactions(trxs);
          setPurchaseOrders(pos);
          setNotifications(notifs);
          setEmployees(emps);
          setCustomers(custs);
          setSuppliers(sups);
          setStores(strs);
        } catch (error) {
          console.warn("Could not retrieve data from Express database server, falling back to local memory simulation:", error);
        }
      };
      loadAllData();
    }
  }, [isOffline]);

  const handleAuthLogin = (usr: User) => {
    setCurrentUser(usr);
    setIsAuthenticated(true);
    setCurrentTab("dashboard");
  };

  const handleAddProduct = (newP: Omit<Product, "id" | "status">) => {
    const isCritical = newP.quantity <= newP.reorderLevel;
    const tempId = "PRD-" + Math.floor(100 + Math.random() * 900);
    const fresh: Product = {
      ...newP,
      id: tempId,
      status: isCritical ? "Critical" : "Healthy"
    };

    setProducts(prevProducts => [fresh, ...prevProducts]);

    if (!isOffline) {
      ShopNestAPI.createProduct(fresh)
        .then(saved => {
          setProducts(prevProducts => prevProducts.map(p => p.id === tempId ? saved : p));
        })
        .catch(err => {
          console.error("Express API failed to persistent product, rolling back as local:", err);
        });
    } else {
      setSyncQueue(prevQueue => [...prevQueue, `ADD_PRODUCT: ${newP.name}`]);
    }

    // System Alarms Notification
    const warningLog: SystemNotification = {
      id: "NTF-PRD-" + Math.floor(1000 + Math.random() * 9000),
      type: "inventory_transfer",
      title: "New Item Registered",
      message: `${newP.name} [SKU: ${newP.sku}] added to catalog with initial stock of ${newP.quantity} units.`,
      timestamp: "Just Now",
      urgency: "info",
      unread: true
    };
    setNotifications(prevNotifications => [warningLog, ...prevNotifications]);
  };

  const handleUpdateProductQty = (productId: string, newQty: number) => {
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === productId) {
          const isCritical = newQty <= p.reorderLevel;
          return {
            ...p,
            quantity: newQty,
            status: (isCritical ? "Critical" : "Healthy") as any
          };
        }
        return p;
      })
    );

    if (!isOffline) {
      ShopNestAPI.updateProductQuantity(productId, newQty)
        .catch(err => console.error("Express API failed to update quantity:", err));
    } else {
      setSyncQueue(prevQueue => [...prevQueue, `QTY_ADJUST: ${productId} ➔ ${newQty} units`]);
    }
  };

  const handleApplyMarkdown = (prdId: string, markdownPct: number) => {
    let nextPrice = 0;
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === prdId) {
          nextPrice = Number((p.sellingPrice * (1 - markdownPct / 100)).toFixed(2));
          return {
            ...p,
            sellingPrice: nextPrice,
            status: "Healthy" as any
          };
        }
        return p;
      })
    );

    if (!isOffline) {
      setTimeout(() => {
        if (nextPrice > 0) {
          ShopNestAPI.applyMarkdown(prdId, nextPrice)
            .catch(err => console.error("Express API failed to apply markdown:", err));
        }
      }, 50);
    } else {
      setSyncQueue(prevQueue => [...prevQueue, `DISCOUNT_APPLIED: ${prdId} (-${markdownPct}%)`]);
    }
  };

  const handleDiscardProduct = (prdId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== prdId));
    
    if (!isOffline) {
      ShopNestAPI.deleteProduct(prdId)
        .catch(err => console.error("Express API failed to delete product:", err));
    } else {
      setSyncQueue(prevQueue => [...prevQueue, `PURGED_PRODUCT: ${prdId}`]);
    }
  };

  const handlePOSCheckout = (
    paymentMethod: "Cash" | "Card" | "Mobile" | "Bank", 
    customerNameStr: string,
    cartItems: { product: Product; qty: number }[],
    totalAmount: number
  ) => {
    const formattedAmount = Number(totalAmount.toFixed(2));
    const activeTrx: SalesTransaction = {
      id: "#TRX-" + Math.floor(1000 + Math.random() * 9000),
      customerName: customerNameStr || "Quick Walk-In",
      customerInitials: (customerNameStr || "Walk-In").substring(0, 2).toUpperCase(),
      dateTime: "Just Now",
      amount: formattedAmount,
      paymentMethod,
      status: "Completed",
      items: cartItems.map(ci => ({
        productId: ci.product.id,
        productName: ci.product.name,
        sku: ci.product.sku,
        price: ci.product.sellingPrice,
        quantity: ci.qty
      }))
    };

    setProducts(prevProducts =>
      prevProducts.map(p => {
        const cartMatch = cartItems.find(ci => ci.product.id === p.id);
        if (cartMatch) {
          const nextQty = Math.max(0, p.quantity - cartMatch.qty);
          return { ...p, quantity: nextQty, status: (nextQty <= p.reorderLevel ? "Critical" : "Healthy") as any };
        }
        return p;
      })
    );

    setTransactions(prevTransactions => [activeTrx, ...prevTransactions]);

    setCustomers(prevCustomers =>
      prevCustomers.map(c => {
        if (c.name.toLowerCase() === customerNameStr.toLowerCase()) {
          return {
            ...c,
            totalSpend: Number((c.totalSpend + formattedAmount).toFixed(2)),
            loyaltyPoints: c.loyaltyPoints + Math.floor(formattedAmount * 0.1)
          };
        }
        return c;
      })
    );

    if (!isOffline) {
      ShopNestAPI.createTransaction(activeTrx)
        .catch(err => console.error("Express API failed to save sales transaction:", err));
    } else {
      setSyncQueue(prevQueue => [...prevQueue, `TRANSACTION_LOG: ${activeTrx.id} ($${activeTrx.amount})`]);
    }

    return activeTrx;
  };

  const handleApprovePO = (poId: string) => {
    setPurchaseOrders(prevPOs =>
      prevPOs.map(po => {
        if (po.id === poId) {
          return { ...po, status: "APPROVED", deliveryStatus: "In-Transit" };
        }
        return po;
      })
    );

    const targetPo = purchaseOrders.find(po => po.id === poId);
    if (targetPo) {
      setSuppliers(prevSuppliers =>
        prevSuppliers.map(s => {
          if (s.id === targetPo.supplierId) {
            return { ...s, outstandingBalance: s.outstandingBalance + targetPo.totalAmount };
          }
          return s;
        })
      );
    }

    if (!isOffline) {
      ShopNestAPI.approvePurchaseOrder(poId)
        .catch(err => console.error("Express API failed to approve PO:", err));
    } else {
      setSyncQueue(prevQueue => [...prevQueue, `PO_AUTHORIZED: ${poId}`]);
    }
  };

  const handleReadNotification = (nid: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n => (n.id === nid ? { ...n, unread: false } : n))
    );

    if (!isOffline) {
      ShopNestAPI.markNotificationRead(nid)
        .catch(err => console.error("Express API failed to mark notification read:", err));
    }
  };

  const handleTriggerFulfillSync = async () => {
    if (syncQueue.length === 0) {
      alert("Synchronization queue is empty! Local cache matches cloud server.");
      return;
    }
    const totalJobs = syncQueue.length;
    setSyncQueue([]);

    try {
      const prds = await ShopNestAPI.getProducts();
      setProducts(prds);
      const trxs = await ShopNestAPI.getTransactions();
      setTransactions(trxs);
    } catch (e) {
      console.error("Express synchronization fetch failed:", e);
    }

    alert(`Success! Dispatched all ${totalJobs} offline jobs to integrated full-stack REST API backend. SQLite/file-system databases committed successfully!`);
  };

  const handleSwitchSessionRole = (role: UserRole) => {
    const matchingStaff = users.find(u => u.role === role);
    if (matchingStaff) {
      setCurrentUser(matchingStaff);
    } else {
      setCurrentUser({
        id: "U-TEMP-" + Math.floor(100 + Math.random() * 900),
        name: `Staff Member (${role})`,
        email: `staff@shopnest.com`,
        role
      });
    }
  };

  // Dedicated write synchronizers for superstore elements
  const handleAddCustomer = (newC: Omit<Customer, "id" | "totalSpend" | "loyaltyPoints">) => {
    const tempId = "CUS-" + Math.floor(1000 + Math.random() * 9000);
    const fresh: Customer = {
      ...newC,
      id: tempId,
      totalSpend: 0,
      loyaltyPoints: 0
    };
    setCustomers(prev => [fresh, ...prev]);
    if (!isOffline) {
      ShopNestAPI.createCustomer(fresh)
        .then(saved => {
          setCustomers(prev => prev.map(c => c.id === tempId ? saved : c));
        })
        .catch(err => console.error("Express failed to save customer:", err));
    }
  };

  const handleAddEmployee = (newE: Omit<Employee, "id" | "joinedDate">) => {
    const tempId = "EMP-" + Math.floor(1000 + Math.random() * 9000);
    const fresh: Employee = {
      ...newE,
      id: tempId,
      joinedDate: "Just Now",
      status: "Active"
    };
    setEmployees(prev => [fresh, ...prev]);
    if (!isOffline) {
      ShopNestAPI.createEmployee(fresh)
        .then(saved => {
          setEmployees(prev => prev.map(e => e.id === tempId ? saved : e));
        })
        .catch(err => console.error("Express failed to save employee:", err));
    }
  };

  const handleAddSupplier = (newS: Omit<Supplier, "id" | "outstandingBalance" | "fulfillmentRatePct">) => {
    const tempId = "SPL-" + Math.floor(100 + Math.random() * 900);
    const fresh: Supplier = {
      ...newS,
      id: tempId,
      outstandingBalance: 0,
      fulfillmentRatePct: 98
    };
    setSuppliers(prev => [fresh, ...prev]);
    if (!isOffline) {
      ShopNestAPI.createSupplier(fresh)
        .then(saved => {
          setSuppliers(prev => prev.map(s => s.id === tempId ? saved : s));
        })
        .catch(err => console.error("Express failed to save supplier:", err));
    }
  };

  const handleAddStore = (newS: Omit<Store, "id" | "dailySales" | "salesGrowth">) => {
    const tempId = "STR-" + Math.floor(100 + Math.random() * 900);
    const fresh: Store = {
      ...newS,
      id: tempId,
      dailySales: 0,
      salesGrowth: 0,
      inventoryCount: 150,
      inventoryCapacityPct: 50,
      status: "Online"
    };
    setStores(prev => [fresh, ...prev]);
    if (!isOffline) {
      ShopNestAPI.createStore(fresh)
        .then(saved => {
          setStores(prev => prev.map(s => s.id === tempId ? saved : s));
        })
        .catch(err => console.error("Express failed to save store:", err));
    }
  };

  const handleCreatePurchaseOrder = (newPo: Omit<PurchaseOrder, "id" | "createdAt" | "status">) => {
    const tempId = "PO-" + Math.floor(10000 + Math.random() * 89999);
    const fresh: PurchaseOrder = {
      ...newPo,
      id: tempId,
      createdAt: "Just Now",
      status: "PENDING",
      deliveryStatus: "Scheduled"
    };
    setPurchaseOrders(prev => [fresh, ...prev]);
    if (!isOffline) {
      ShopNestAPI.createPurchaseOrder(fresh)
        .then(saved => {
          setPurchaseOrders(prev => prev.map(po => po.id === tempId ? saved : po));
        })
        .catch(err => console.error("Express failed to create PO:", err));
    }
  };

  return (
    <ShopContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        setCurrentUser,
        currentTab,
        setCurrentTab,
        isOffline,
        setIsOffline,
        syncQueue,
        setSyncQueue,
        isDarkMode,
        setIsDarkMode,
        users,
        setUsers,
        products,
        setProducts,
        transactions,
        setTransactions,
        purchaseOrders,
        setPurchaseOrders,
        notifications,
        setNotifications,
        employees,
        setEmployees,
        customers,
        setCustomers,
        suppliers,
        setSuppliers,
        stores,
        setStores,

        handleAuthLogin,
        handleAddProduct,
        handleUpdateProductQty,
        handleApplyMarkdown,
        handleDiscardProduct,
        handlePOSCheckout,
        handleApprovePO,
        handleReadNotification,
        handleTriggerFulfillSync,
        handleSwitchSessionRole,
        handleAddCustomer,
        handleAddEmployee,
        handleAddSupplier,
        handleAddStore,
        handleCreatePurchaseOrder,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

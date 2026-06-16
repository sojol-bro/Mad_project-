import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
import { Store, Employee, SalesTransaction, Customer, Supplier, PurchaseOrder, SystemNotification } from "../types";
import { 
  Bell, 
  AlertTriangle, 
  Search, 
  Store as StoreIcon, 
  Users, 
  ShoppingBag, 
  User as UserIcon, 
  Truck, 
  CheckCircle, 
  ChevronRight, 
  Calendar, 
  Sliders,
  DollarSign,
  AlertOctagon,
  MapPin,
  Sparkles,
  Award,
  CircleDot
} from "lucide-react";

interface AdminModulesProps {
  activeSection: string;
  stores: Store[];
  employees: Employee[];
  transactions: SalesTransaction[];
  customers: Customer[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  notifications: SystemNotification[];
  onApprovePO: (poId: string) => void;
  onNavigateToScreen: (screen: string) => void;
  onReadNotification: (nid: string) => void;
  onAddCustomer: (newC: Omit<Customer, "id" | "totalSpend" | "loyaltyPoints">) => void;
  onAddEmployee: (newE: Omit<Employee, "id" | "joinedDate">) => void;
  onAddSupplier: (newS: Omit<Supplier, "id" | "outstandingBalance" | "fulfillmentRatePct">) => void;
  onAddStore: (newS: Omit<Store, "id" | "dailySales" | "salesGrowth">) => void;
  onCreatePO: (newPo: Omit<PurchaseOrder, "id" | "createdAt" | "status">) => void;
  isDarkMode: boolean;
}

export default function EnterpriseAdminModules({
  activeSection,
  stores,
  employees,
  transactions,
  customers,
  suppliers,
  purchaseOrders,
  notifications,
  onApprovePO,
  onReadNotification,
  onAddCustomer,
  onAddEmployee,
  onAddSupplier,
  onAddStore,
  onCreatePO,
  isDarkMode
}: AdminModulesProps) {
  // Form toggles
  const [showPOForm, setShowPOForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);

  // Form states for PO
  const [poSupplierId, setPoSupplierId] = useState("");
  const [poSupplierName, setPoSupplierName] = useState("");
  const [poItemCount, setPoItemCount] = useState("15");
  const [poTotalAmount, setPoTotalAmount] = useState("4500");
  const [poCreatedBy, setPoCreatedBy] = useState("Procurement Officer");

  // Form states for Employee
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPhone, setEmpPhone] = useState("");
  const [empRole, setEmpRole] = useState("Cashier");
  const [empSalary, setEmpSalary] = useState("32000");
  const [empStoreId, setEmpStoreId] = useState("");
  const [empStoreName, setEmpStoreName] = useState("");

  // Form states for Customer Register
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custSegment, setCustSegment] = useState<"VIP Member" | "Standard" | "New Client" | "At Risk">("New Client");

  // Form states for Supplier Vendor
  const [supName, setSupName] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [supEmail, setSupEmail] = useState("");
  const [supAddress, setSupAddress] = useState("");
  const [supLicense, setSupLicense] = useState("");
  const [supStatus, setSupStatus] = useState<"Preferred" | "Standard" | "Overdue">("Standard");

  // Form states for Branch Store
  const [storeName, setStoreName] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeManagerId, setStoreManagerId] = useState("MGR-3101");
  const [storeManagerName, setStoreManagerName] = useState("");
  const [storeStatus, setStoreStatus] = useState<"Online" | "Offline" | "Maintenance">("Online");

  // Filters & State helpers
  const [customerSearch, setCustomerSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState(""); // search supplier
  const [salesTimeframe, setSalesTimeframe] = useState<"7days" | "30days" | "YTD">("7days");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);

  const getDynamicStyles = () => ({
    cardBg: isDarkMode ? "#1E293B" : "#FFFFFF",
    borderColor: isDarkMode ? "#334155" : "#E2E8F0",
    textColor: isDarkMode ? "#F1F5F9" : "#0F172A",
    textMuted: isDarkMode ? "#94A3B8" : "#64748B",
    canvasBg: isDarkMode ? "#0F172A" : "#F8FAFC",
    accentGlow: isDarkMode ? "rgba(56, 189, 248, 0.15)" : "rgba(37, 99, 233, 0.05)",
    accentColor: isDarkMode ? "#38BDF8" : "#2563EB",
    inputBg: isDarkMode ? "#0F172A" : "#F8FAFC",
    successColor: isDarkMode ? "#34D399" : "#10B981"
  });

  const ds = getDynamicStyles();

  // Search logic
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.segment.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    e.role.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    e.storeName.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: ds.canvasBg }]}>
      
      {/* =========================================================
           1. PROCUREMENT / PURCHASE ORDERS VIEW
         ========================================================= */}
      {activeSection === "purchases" && (
        <ScrollView style={styles.scrollBlock} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeadingBlock}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <ShoppingBag size={18} color={ds.accentColor} />
              <Text style={[styles.sectionTitle, { color: ds.textColor, marginBottom: 0 }]}>Master Procurement Orders (PO)</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: ds.textMuted }]}>
              Authorize replenishment budgets and trace shipment cargos with pre-registered manufacturers.
            </Text>
          </View>

          {/* Form Trigger button */}
          <View style={{ paddingHorizontal: 14, paddingBottom: 10, alignItems: "flex-end" }}>
            <TouchableOpacity 
              style={{ backgroundColor: ds.accentColor, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 6 }}
              onPress={() => {
                setShowPOForm(!showPOForm);
                if (!poSupplierId && suppliers.length > 0) {
                  setPoSupplierId(suppliers[0].id);
                  setPoSupplierName(suppliers[0].name);
                }
              }}
            >
              <Sparkles size={14} color="#FFF" />
              <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>
                {showPOForm ? "Collapse Drafting Form" : "Draft New Procurement PO"}
              </Text>
            </TouchableOpacity>
          </View>

          {showPOForm && (
            <View style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor, marginHorizontal: 14, marginBottom: 14, padding: 16, borderRadius: 12 }]}>
              <Text style={{ fontSize: 12, fontWeight: "bold", color: ds.textColor, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: ds.borderColor, paddingBottom: 6 }}>
                New replenishment budget drafting
              </Text>

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>SELECT TARGET VENDOR SUPPLIER</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {suppliers.length === 0 ? (
                  <Text style={{ fontSize: 10, color: ds.textMuted }}>No registered vendors. Go to Suppliers tab to Register a Vendor.</Text>
                ) : (
                  suppliers.map(sup => (
                    <TouchableOpacity
                      key={sup.id}
                      style={{
                        borderWidth: 1,
                        borderColor: poSupplierId === sup.id ? ds.accentColor : ds.borderColor,
                        backgroundColor: poSupplierId === sup.id ? ds.accentGlow : ds.inputBg,
                        paddingVertical: 5,
                        paddingHorizontal: 8,
                        borderRadius: 6
                      }}
                      onPress={() => {
                        setPoSupplierId(sup.id);
                        setPoSupplierName(sup.name);
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: "bold", color: poSupplierId === sup.id ? ds.accentColor : ds.textColor }}>
                        {sup.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>TOTAL UNITS ENROUTE</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={poItemCount}
                onChangeText={setPoItemCount}
                placeholder="Number of cases/boxes"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>TOTAL BUDGET ALLOCATED ($)</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={poTotalAmount}
                onChangeText={setPoTotalAmount}
                placeholder="Budget cap in US Dollars"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>AUTHOR SIGNATURE NAME</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 16, outlineStyle: "none" as any }}
                value={poCreatedBy}
                onChangeText={setPoCreatedBy}
                placeholder="Manager full name"
              />

              <TouchableOpacity
                style={{ backgroundColor: ds.successColor, paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
                onPress={() => {
                  if (!poSupplierName) {
                    alert("Please select or register a vendor first!");
                    return;
                  }
                  onCreatePO({
                    supplierId: poSupplierId,
                    supplierName: poSupplierName,
                    itemCount: Number(poItemCount) || 12,
                    totalAmount: Number(poTotalAmount) || 4500,
                    createdByName: poCreatedBy || "Procurement Officer",
                  });
                  setShowPOForm(false);
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "bold" }}>Register Replenishment PO</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.list}>
            {purchaseOrders.map((po, idx) => {
              const isApproved = po.status === "APPROVED" || po.status === "RECEIVED";
              return (
                <View key={idx} style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={[styles.cardTitle, { color: ds.textColor }]}>Budget Key: {po.id}</Text>
                      <Text style={[styles.cardSubCap, { color: ds.textMuted }]}>Inbound creator: {po.createdByName} • {po.createdAt}</Text>
                    </View>
                    <View style={[
                      styles.statusPill, 
                      { backgroundColor: isApproved ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)" }
                    ]}>
                      <Text style={[styles.statusText, { color: isApproved ? ds.successColor : "#F59E0B" }]}>
                        {po.status}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.poDetailsRow, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
                    <View style={styles.poDetailCol}>
                      <Text style={[styles.poLabel, { color: ds.textMuted }]}>Vendor Manufacturer</Text>
                      <Text style={[styles.poVal, { color: ds.textColor }]} numberOfLines={1}>{po.supplierName}</Text>
                    </View>
                    <View style={styles.poDetailCol}>
                      <Text style={[styles.poLabel, { color: ds.textMuted }]}>Inbound Items</Text>
                      <Text style={[styles.poVal, { color: ds.textColor }]}>{po.itemCount} units</Text>
                    </View>
                    <View style={styles.poDetailCol}>
                      <Text style={[styles.poLabel, { color: ds.textMuted }]}>Allocated Sum</Text>
                      <Text style={[styles.poVal, { color: ds.textColor, fontWeight: "bold" }]}>${po.totalAmount.toLocaleString()}</Text>
                    </View>
                  </View>

                  {/* Shipment milestones */}
                  <View style={styles.shipmentTracking}>
                    <Text style={[styles.trackingLabel, { color: ds.textMuted }]}>Shipment Milestones:</Text>
                    <View style={styles.stepRail}>
                      <View style={[styles.stepItem, { backgroundColor: ds.accentGlow }]}>
                        <Text style={[styles.stepText, { color: ds.accentColor }]}>1. Draft</Text>
                      </View>
                      <View style={[styles.stepItem, isApproved ? { backgroundColor: "rgba(16, 185, 129, 0.15)" } : { backgroundColor: ds.borderColor }]}>
                        <Text style={[styles.stepText, { color: isApproved ? ds.successColor : ds.textMuted }]}>2. Approved</Text>
                      </View>
                      <View style={[styles.stepItem, po.status === "RECEIVED" ? { backgroundColor: "rgba(16, 185, 129, 0.15)" } : { backgroundColor: ds.borderColor }]}>
                        <Text style={[styles.stepText, { color: po.status === "RECEIVED" ? ds.successColor : ds.textMuted }]}>3. Docked</Text>
                      </View>
                    </View>
                  </View>

                  {po.status === "PENDING" && (
                    <TouchableOpacity 
                      style={[styles.approveContractBtn, { backgroundColor: ds.accentColor }]}
                      onPress={() => {
                        onApprovePO(po.id);
                        alert(`Purchase Order ${po.id} successfully authorized! Inbound shipment status changed to In-Transit.`);
                      }}
                      id={`btn_approve_po_${po.id}`}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <CheckCircle size={14} color="#0F172A" />
                        <Text style={styles.approveContractBtnText}>Authorize replenishment budget contract</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* =========================================================
           2. LEDGER / REPORTS & ANALYTICS VIEW
         ========================================================= */}
      {activeSection === "sales" && (
        <ScrollView style={styles.scrollBlock} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeadingBlock}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <DollarSign size={18} color={ds.accentColor} />
              <Text style={[styles.sectionTitle, { color: ds.textColor, marginBottom: 0 }]}>Ledger Reports & Performance Analytics</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: ds.textMuted }]}>
              Tactical insights module. Filter regional sales channels and read permanent terminal checkout logs.
            </Text>
          </View>

          {/* Timeframe selector pills */}
          <View style={[styles.timeframePillsRow, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
            <TouchableOpacity 
              style={[styles.timeframeBtn, salesTimeframe === "7days" && { backgroundColor: ds.accentColor }]}
              onPress={() => setSalesTimeframe("7days")}
              id="btn_sales_tf_7"
            >
              <Text style={[styles.timeframeText, { color: salesTimeframe === "7days" ? "#0F172A" : ds.textColor }]}>Last 7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeBtn, salesTimeframe === "30days" && { backgroundColor: ds.accentColor }]}
              onPress={() => setSalesTimeframe("30days")}
              id="btn_sales_tf_30"
            >
              <Text style={[styles.timeframeText, { color: salesTimeframe === "30days" ? "#0F172A" : ds.textColor }]}>30 Days Tracker</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeBtn, salesTimeframe === "YTD" && { backgroundColor: ds.accentColor }]}
              onPress={() => setSalesTimeframe("YTD")}
              id="btn_sales_tf_ytd"
            >
              <Text style={[styles.timeframeText, { color: salesTimeframe === "YTD" ? "#0F172A" : ds.textColor }]}>Year-to-Date Net</Text>
            </TouchableOpacity>
          </View>

          {/* Graphical Analytics Card */}
          <View style={[styles.analyticsCard, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
            <Text style={[styles.analyticsCardTitle, { color: ds.textColor }]}>Revenue Distribution Index</Text>
            <Text style={[styles.analyticsCardSubtitle, { color: ds.textMuted }]}>Comparing actual results to pre-budget targets</Text>

            <View style={[styles.graphHolderBox, { backgroundColor: isDarkMode ? "#121A2A" : "#F8FAFC", borderColor: ds.borderColor }]}>
              {/* Dynamic SVG bar visual distribution */}
              <svg viewBox="0 0 320 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <line x1="10" y1="20" x2="310" y2="20" stroke={isDarkMode ? "#1E293B" : "#E2E8F0"} strokeWidth="1" />
                <line x1="10" y1="60" x2="310" y2="60" stroke={isDarkMode ? "#1E293B" : "#E2E8F0"} strokeWidth="1" />
                <line x1="10" y1="100" x2="310" y2="100" stroke={isDarkMode ? "#1E293B" : "#E2E8F0"} strokeWidth="1" />
                <line x1="10" y1="110" x2="310" y2="110" stroke={isDarkMode ? "#334155" : "#94A3B8"} strokeWidth="1.5" />

                <rect x="35" y={salesTimeframe === "7days" ? "50" : salesTimeframe === "30days" ? "35" : "20"} width="18" height={salesTimeframe === "7days" ? "60" : salesTimeframe === "30days" ? "75" : "90"} rx="4" fill={ds.accentColor} />
                <rect x="58" y="70" width="18" height="40" rx="4" fill="#10B981" opacity="0.6" />

                <rect x="115" y={salesTimeframe === "7days" ? "65" : salesTimeframe === "30days" ? "45" : "30"} width="18" height={salesTimeframe === "7days" ? "45" : salesTimeframe === "30days" ? "65" : "80"} rx="4" fill={ds.accentColor} />
                <rect x="138" y="55" width="18" height="55" rx="4" fill="#10B981" opacity="0.6" />

                <rect x="195" y={salesTimeframe === "7days" ? "40" : salesTimeframe === "30days" ? "25" : "15"} width="18" height={salesTimeframe === "7days" ? "70" : salesTimeframe === "30days" ? "85" : "95"} rx="4" fill={ds.accentColor} />
                <rect x="218" y="45" width="18" height="65" rx="4" fill="#10B981" opacity="0.6" />
              </svg>

              <View style={styles.graphLegends}>
                <View style={[styles.legendIndicatorGroup]}>
                  <View style={[styles.legendDot, { backgroundColor: ds.accentColor }]} />
                  <Text style={[styles.legendLabelText, { color: ds.textColor }]}>Digital Catalog Outflow</Text>
                </View>
                <View style={[styles.legendIndicatorGroup]}>
                  <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                  <Text style={[styles.legendLabelText, { color: ds.textColor }]}>Regional Walk-In Sales</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Ledger audit trail rows list */}
          <Text style={[styles.analyticsCardTitle, { color: ds.textColor, marginTop: 14, marginBottom: 8 }]}>Daily Cash Audit Ledgers</Text>
          <View style={styles.list}>
            {transactions.map((t, index) => (
              <View key={index} style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor, padding: 12 }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text style={[styles.auditPrdName, { color: ds.textColor }]}>{t.customerName}</Text>
                    <Text style={[styles.auditMeta, { color: ds.textMuted }]}>{t.dateTime} • operator checkout log</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.auditPrice, { color: ds.accentColor }]}>${t.amount.toFixed(2)}</Text>
                    <Text style={[styles.auditPlatformBadge, { backgroundColor: ds.inputBg, color: ds.textColor }]}>
                      {t.paymentMethod.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* =========================================================
           3. CRM / CUSTOMERS VIEW
         ========================================================= */}
      {activeSection === "customers" && (
        <View style={styles.splitViewportRow}>
          {/* List panel */}
          <View style={styles.splitLeftCol}>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
              <View style={[styles.catalogLookupField, { backgroundColor: ds.cardBg, borderColor: ds.borderColor, flex: 1 }]}>
                <View style={{ marginLeft: 8, marginRight: 4, transform: [{ translateY: 1 }] }}>
                  <Search size={14} color={ds.textMuted} />
                </View>
                <TextInput 
                  style={[styles.catalogLookupInput, { color: ds.textColor }]}
                  placeholder="Search CRM loyalties..."
                  placeholderTextColor={ds.textMuted}
                  value={customerSearch}
                  onChangeText={setCustomerSearch}
                  id="input_crm_lookup"
                />
              </View>
              <TouchableOpacity
                style={{ backgroundColor: ds.accentColor, borderRadius: 8, paddingHorizontal: 12, justifyContent: "center" }}
                onPress={() => setShowCustomerForm(!showCustomerForm)}
              >
                <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>
                  {showCustomerForm ? "Close Form" : "Add Client"}
                </Text>
              </TouchableOpacity>
            </View>

            {showCustomerForm && (
              <View style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor, padding: 12, borderRadius: 10, marginBottom: 8 }]}>
                <Text style={{ fontSize: 11, fontWeight: "bold", color: ds.textColor, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: ds.borderColor, paddingBottom: 4 }}>
                  Register Loyal Client
                </Text>

                <Text style={{ fontSize: 8, fontWeight: "bold", color: ds.textMuted, marginBottom: 2 }}>CLIENT FULL NAME</Text>
                <TextInput
                  style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, fontSize: 10, marginBottom: 8, outlineStyle: "none" as any }}
                  value={custName}
                  onChangeText={setCustName}
                  placeholder="e.g. Alice Cooper"
                />

                <Text style={{ fontSize: 8, fontWeight: "bold", color: ds.textMuted, marginBottom: 2 }}>EMAIL ADDRESS</Text>
                <TextInput
                  style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, fontSize: 10, marginBottom: 8, outlineStyle: "none" as any }}
                  value={custEmail}
                  onChangeText={setCustEmail}
                  placeholder="e.g. alice@example.com"
                />

                <Text style={{ fontSize: 8, fontWeight: "bold", color: ds.textMuted, marginBottom: 2 }}>TELEPHONE PHONE</Text>
                <TextInput
                  style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, fontSize: 10, marginBottom: 8, outlineStyle: "none" as any }}
                  value={custPhone}
                  onChangeText={setCustPhone}
                  placeholder="e.g. +1 (555) 723-9118"
                />

                <Text style={{ fontSize: 8, fontWeight: "bold", color: ds.textMuted, marginBottom: 2 }}>SEGMENT LEVEL</Text>
                <View style={{ flexDirection: "row", gap: 3, marginBottom: 10 }}>
                  {(["VIP Member", "Standard", "New Client", "At Risk"] as const).map(seg => (
                    <TouchableOpacity
                      key={seg}
                      style={{
                        borderWidth: 1,
                        borderColor: custSegment === seg ? ds.accentColor : ds.borderColor,
                        backgroundColor: custSegment === seg ? ds.accentGlow : ds.inputBg,
                        paddingVertical: 3,
                        paddingHorizontal: 6,
                        borderRadius: 4
                      }}
                      onPress={() => setCustSegment(seg)}
                    >
                      <Text style={{ fontSize: 8, color: custSegment === seg ? ds.accentColor : ds.textColor }}>
                        {seg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={{ backgroundColor: ds.successColor, paddingVertical: 6, borderRadius: 6, alignItems: "center" }}
                  onPress={() => {
                    if (!custName) {
                      alert("Please type a customer name.");
                      return;
                    }
                    onAddCustomer({
                      name: custName,
                      email: custEmail || "no-email@shopnest.com",
                      phone: custPhone || "N/A",
                      segment: custSegment
                    });
                    setCustName("");
                    setCustEmail("");
                    setCustPhone("");
                    setShowCustomerForm(false);
                  }}
                >
                  <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>Submit Customer Profile</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView style={styles.posGridScroll} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 8 }}>
                {filteredCustomers.map((cus) => (
                  <TouchableOpacity 
                    key={cus.id}
                    style={[
                      styles.crmContactNode, 
                      { backgroundColor: ds.cardBg, borderColor: selectedCustomer?.id === cus.id ? ds.accentColor : ds.borderColor }
                    ]}
                    onPress={() => setSelectedCustomer(cus)}
                    id={`btn_customer_row_${cus.id}`}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={[styles.avatarCircle, { backgroundColor: ds.accentGlow }]}>
                        <Text style={[styles.avatarText, { color: ds.accentColor }]}>{cus.name.substring(0, 2).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.crmContactName, { color: ds.textColor }]} numberOfLines={1}>{cus.name}</Text>
                        <Text style={[styles.crmContactSpecs, { color: ds.textMuted }]}>
                          Segment: {cus.segment} • points: {cus.loyaltyPoints}
                        </Text>
                      </View>
                      <ChevronRight size={14} color={ds.textMuted} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Focus Panel */}
          <View style={[styles.splitRightCol, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
            {selectedCustomer ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  <View style={[styles.userLargeAvatar, { backgroundColor: ds.accentGlow }]}>
                    <Text style={[styles.userLargeAvatarTxt, { color: ds.accentColor }]}>
                      {selectedCustomer.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.userLargeName, { color: ds.textColor }]}>{selectedCustomer.name}</Text>
                  <Text style={[styles.userLargeMail, { color: ds.textMuted }]}>{selectedCustomer.email}</Text>
                </View>

                {/* Points Card */}
                <View style={[styles.pointsIndicatorLayout, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" }}>
                    <Award size={16} color="#F59E0B" />
                    <Text style={{ fontSize: 13, fontWeight: "900", color: ds.textColor }}>
                      {selectedCustomer.loyaltyPoints} points
                    </Text>
                  </View>
                  <Text style={{ fontSize: 8, color: ds.textMuted, textAlign: "center", marginTop: 4 }}>
                    Active CRM balance. Redeems at next register transaction.
                  </Text>
                </View>

                {/* Metrics */}
                <View style={{ gap: 8 }}>
                  <View style={[styles.specMetaLine, { borderBottomColor: ds.borderColor }]}>
                    <Text style={[styles.specMetaLabelDef, { color: ds.textMuted }]}>Client Segment</Text>
                    <Text style={[styles.specMetaValDef, { color: ds.textColor }]}>{selectedCustomer.segment}</Text>
                  </View>
                  <View style={[styles.specMetaLine, { borderBottomColor: ds.borderColor }]}>
                    <Text style={[styles.specMetaLabelDef, { color: ds.textMuted }]}>Registered phone</Text>
                    <Text style={[styles.specMetaValDef, { color: ds.textColor }]}>{selectedCustomer.phone}</Text>
                  </View>
                  <View style={[styles.specMetaLine, { borderBottomColor: ds.borderColor }]}>
                    <Text style={[styles.specMetaLabelDef, { color: ds.textMuted }]}>Acquisitions Count</Text>
                    <Text style={[styles.specMetaValDef, { color: ds.textColor }]}>24 invoices fulfilled</Text>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                <UserIcon size={32} color={ds.textMuted} style={{ marginBottom: 10 }} />
                <Text style={{ fontSize: 11, color: ds.textMuted, textAlign: "center" }}>
                  Select any CRM profile from the left column to review point history ledger logs.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* =========================================================
           4. STORES / BRANCHES VIEW
         ========================================================= */}
      {activeSection === "stores" && (
        <ScrollView style={styles.scrollBlock} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeadingBlock}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <StoreIcon size={18} color={ds.accentColor} />
              <Text style={[styles.sectionTitle, { color: ds.textColor, marginBottom: 0 }]}>Physical Outlets Network</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: ds.textMuted }]}>
              Monitor real-time warehouse capacities and sales expansion progress across all geographical retail branches.
            </Text>
          </View>

          {/* Form Trigger button */}
          <View style={{ paddingHorizontal: 14, paddingBottom: 10, alignItems: "flex-end" }}>
            <TouchableOpacity 
              style={{ backgroundColor: ds.accentColor, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 6 }}
              onPress={() => setShowStoreForm(!showStoreForm)}
            >
              <Sparkles size={14} color="#FFF" />
              <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>
                {showStoreForm ? "Collapse Branch Form" : "Commission New Store Branch"}
              </Text>
            </TouchableOpacity>
          </View>

          {showStoreForm && (
            <View style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor, marginHorizontal: 14, marginBottom: 14, padding: 16, borderRadius: 12 }]}>
              <Text style={{ fontSize: 12, fontWeight: "bold", color: ds.textColor, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: ds.borderColor, paddingBottom: 6 }}>
                Commission New Physical Branch
              </Text>

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>BRANCH NAME</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={storeName}
                onChangeText={valName => {
                  setStoreName(valName);
                  if (!storeCode) {
                    const initials = valName.split(" ").map(w => w[0]).join("").toUpperCase();
                    setStoreCode("SN-" + initials + "-" + Math.floor(10 + Math.random() * 90));
                  }
                }}
                placeholder="e.g. ShopNest West Coast"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>BRANCH CODE</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={storeCode}
                onChangeText={setStoreCode}
                placeholder="e.g. SN-WC-88"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>GEOGRAPHICAL ADDRESS</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={storeAddress}
                onChangeText={setStoreAddress}
                placeholder="Street address city, state"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>BRANCH CONTACT PHONE</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={storePhone}
                onChangeText={setStorePhone}
                placeholder="+1 (555) 102-1920"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>ASSIGNED MANAGER NAME</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={storeManagerName}
                onChangeText={setStoreManagerName}
                placeholder="Manager full name"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>MANAGER ASSIGNED ID</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 16, outlineStyle: "none" as any }}
                value={storeManagerId}
                onChangeText={setStoreManagerId}
                placeholder="e.g. MGR-1218"
              />

              <TouchableOpacity
                style={{ backgroundColor: ds.successColor, paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
                onPress={() => {
                  if (!storeName || !storeCode) {
                    alert("Please provide store branch name and unique branch code!");
                    return;
                  }
                  onAddStore({
                    name: storeName,
                    code: storeCode,
                    address: storeAddress || "N/A",
                    phone: storePhone || "N/A",
                    managerId: storeManagerId,
                    managerName: storeManagerName || "Principal Manager",
                    status: storeStatus,
                  });
                  setStoreName("");
                  setStoreCode("");
                  setStoreAddress("");
                  setStorePhone("");
                  setStoreManagerName("");
                  setShowStoreForm(false);
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "bold" }}>Commission Store Branch</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.list}>
            {stores.map((st, i) => (
              <View key={i} style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
                <View style={[styles.cardHeader, { marginBottom: 10 }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <MapPin size={18} color={ds.accentColor} />
                    <View>
                      <Text style={[styles.cardTitle, { color: ds.textColor }]}>{st.name}</Text>
                      <Text style={[styles.cardSubCap, { color: ds.textMuted }]}>Branch code: {st.code}</Text>
                    </View>
                  </View>
                </View>

                {/* Capacity statistics metrics */}
                <View style={[styles.branchSpecsBar, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ fontSize: 8, fontWeight: "900", color: ds.textMuted }}>CURRENT SHELF CAPACITY</Text>
                      <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textColor }}>{st.inventoryCapacityPct}% occupied</Text>
                    </View>
                    <View style={{ height: 4, borderRadius: 99, backgroundColor: isDarkMode ? "#334155" : "#E2E8F0", overflow: "hidden" }}>
                      <View style={{ height: "100%", width: `${st.inventoryCapacityPct}%`, backgroundColor: st.inventoryCapacityPct > 80 ? "#EF4444" : ds.accentColor }} />
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                  <Text style={{ fontSize: 10, color: ds.textMuted }}>Permanent Employees: 8 personnel</Text>
                  <Text style={{ fontSize: 10, color: ds.successColor, fontWeight: "900" }}>GROWTH SPREAD: {st.salesGrowth}%</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* =========================================================
           5. EMPLOYEES / PERSONNEL VIEW
         ========================================================= */}
      {activeSection === "employees" && (
        <ScrollView style={styles.scrollBlock} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeadingBlock}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Users size={18} color={ds.accentColor} />
              <Text style={[styles.sectionTitle, { color: ds.textColor, marginBottom: 0 }]}>Personnel & Cashiers Directory</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: ds.textMuted }]}>
              Control permissions, reset access logins, and evaluate personnel assignments across network registers.
            </Text>
          </View>

          {/* Form Trigger button */}
          <View style={{ paddingHorizontal: 14, paddingBottom: 10, alignItems: "flex-end" }}>
            <TouchableOpacity 
              style={{ backgroundColor: ds.accentColor, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 6 }}
              onPress={() => {
                setShowEmployeeForm(!showEmployeeForm);
                if (!empStoreId && stores.length > 0) {
                  setEmpStoreId(stores[0].id);
                  setEmpStoreName(stores[0].name);
                }
              }}
            >
              <Sparkles size={14} color="#FFF" />
              <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>
                {showEmployeeForm ? "Collapse Hiring Form" : "Hire New Staff Member"}
              </Text>
            </TouchableOpacity>
          </View>

          {showEmployeeForm && (
            <View style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor, marginHorizontal: 14, marginBottom: 14, padding: 16, borderRadius: 12 }]}>
              <Text style={{ fontSize: 12, fontWeight: "bold", color: ds.textColor, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: ds.borderColor, paddingBottom: 6 }}>
                Hiring Registry & Onboarding
              </Text>

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>EMPLOYEE FULL NAME</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={empName}
                onChangeText={setEmpName}
                placeholder="e.g. John Doe"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>EMAIL ADDRESS</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={empEmail}
                onChangeText={setEmpEmail}
                placeholder="e.g. doe@shopnest.com"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>TELEPHONE NO</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={empPhone}
                onChangeText={setEmpPhone}
                placeholder="+1 (555) 555-5555"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>ASSIGNED ROLE</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={empRole}
                onChangeText={setEmpRole}
                placeholder="e.g. Lead Cashier"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>ANNUAL SALARY BUDGET ($)</Text>
              <TextInput
                style={{ backgroundColor: ds.inputBg, color: ds.textColor, borderWidth: 1, borderColor: ds.borderColor, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11, marginBottom: 12, outlineStyle: "none" as any }}
                value={empSalary}
                onChangeText={setEmpSalary}
                placeholder="e.g. 35000"
              />

              <Text style={{ fontSize: 9, fontWeight: "bold", color: ds.textMuted, marginBottom: 4 }}>ASSIGN COMPASS RETAIL BRANCH</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {stores.length === 0 ? (
                  <Text style={{ fontSize: 10, color: ds.textMuted }}>No registered store branches to select.</Text>
                ) : (
                  stores.map(st => (
                    <TouchableOpacity
                      key={st.id}
                      style={{
                        borderWidth: 1,
                        borderColor: empStoreId === st.id ? ds.accentColor : ds.borderColor,
                        backgroundColor: empStoreId === st.id ? ds.accentGlow : ds.inputBg,
                        paddingVertical: 5,
                        paddingHorizontal: 8,
                        borderRadius: 6
                      }}
                      onPress={() => {
                        setEmpStoreId(st.id);
                        setEmpStoreName(st.name);
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: "bold", color: empStoreId === st.id ? ds.accentColor : ds.textColor }}>
                        {st.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <TouchableOpacity
                style={{ backgroundColor: ds.successColor, paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
                onPress={() => {
                  if (!empName) {
                    alert("Please type the employee name!");
                    return;
                  }
                  if (!empStoreName) {
                    alert("Please select a store branch to assign this employee!");
                    return;
                  }
                  onAddEmployee({
                    name: empName,
                    email: empEmail || `${empName.toLowerCase().replace(" ", "")}@shopnest.com`,
                    phone: empPhone || "N/A",
                    role: empRole,
                    salary: Number(empSalary) || 30000,
                    storeId: empStoreId,
                    storeName: empStoreName,
                    status: "Active"
                  });
                  setEmpName("");
                  setEmpEmail("");
                  setEmpPhone("");
                  setEmpRole("Cashier");
                  setEmpSalary("32000");
                  setShowEmployeeForm(false);
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "bold" }}>Register Staff Member</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.catalogLookupField, { backgroundColor: ds.cardBg, borderColor: ds.borderColor, marginBottom: 14 }]}>
            <View style={{ marginLeft: 8, marginRight: 4, transform: [{ translateY: 1 }] }}>
              <Search size={14} color={ds.textMuted} />
            </View>
            <TextInput 
              style={[styles.catalogLookupInput, { color: ds.textColor }]}
              placeholder="Search personnel directory..."
              placeholderTextColor={ds.textMuted}
              value={employeeSearch}
              onChangeText={setEmployeeSearch}
              id="input_employee_search"
            />
          </View>

          <View style={styles.list}>
            {filteredEmployees.map((e, index) => (
              <View key={index} style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor, padding: 12 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.avatarCircle, { backgroundColor: ds.accentGlow }]}>
                    <Text style={[styles.avatarText, { color: ds.accentColor }]}>{e.name.substring(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.employeeNameText, { color: ds.textColor }]}>{e.name}</Text>
                    <Text style={[styles.employeeRoleText, { color: ds.textMuted }]}>
                      {e.role} • Registered Store Outlet: {e.storeName}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: e.status === "Active" ? "rgba(16, 185, 129, 0.12)" : "rgba(100, 116, 139, 0.12)" }]}>
                    <Text style={[styles.statusText, { color: e.status === "Active" ? ds.successColor : ds.textMuted }]}>
                      {e.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* =========================================================
           6. NOTIFICATIONS VIEW
         ========================================================= */}
      {activeSection === "notifications" && (
        <ScrollView style={styles.scrollBlock} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeadingBlock}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Bell size={18} color={ds.accentColor} />
              <Text style={[styles.sectionTitle, { color: ds.textColor, marginBottom: 0 }]}>Real-Time Security Alert Broadcasts</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: ds.textMuted }]}>
              Critical automated updates from warehouses regarding low stock thresholds, lot expirations and purchase order changes.
            </Text>
          </View>

          <View style={styles.list}>
            {notifications.map((n, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.card, 
                  { backgroundColor: ds.cardBg, borderColor: ds.borderColor, opacity: !n.unread ? 0.65 : 1 }
                ]}
                onPress={() => onReadNotification(n.id)}
                id={`btn_notification_read_${n.id}`}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View style={{ marginTop: 2 }}>
                    {n.urgency === "critical" ? (
                      <AlertOctagon size={16} color="#EF4444" />
                    ) : (
                      <CircleDot size={16} color={ds.accentColor} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <Text style={[styles.cardTitle, { color: ds.textColor }]}>{n.title}</Text>
                      {n.unread && (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#38BDF8", position: "absolute", right: 12, top: 12 }} />
                      )}
                    </View>
                    <Text style={[styles.cardSubCap, { color: ds.textColor }]}>{n.message}</Text>
                    <Text style={[styles.cardSubCap, { color: ds.textMuted, marginTop: 4 }]}>{n.timestamp}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  scrollBlock: {
    flex: 1,
  },
  sectionHeadingBlock: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
  },
  sectionDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "900",
  },
  cardSubCap: {
    fontSize: 9,
    marginTop: 2,
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  poDetailsRow: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    gap: 10,
    marginTop: 10,
  },
  poDetailCol: {
    flex: 1,
  },
  poLabel: {
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  poVal: {
    fontSize: 11,
    fontWeight: "800",
    fontFamily: "monospace",
    marginTop: 2,
  },
  shipmentTracking: {
    marginTop: 12,
    gap: 4,
  },
  trackingLabel: {
    fontSize: 9,
    fontWeight: "700",
  },
  stepRail: {
    flexDirection: "row",
    gap: 6,
  },
  stepItem: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: "center",
  },
  stepText: {
    fontSize: 9,
    fontWeight: "900",
  },
  approveContractBtn: {
    marginTop: 14,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center",
  },
  approveContractBtnText: {
    color: "#0F172A",
    fontSize: 10,
    fontWeight: "900",
  },
  timeframePillsRow: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    padding: 4,
    gap: 4,
    marginBottom: 14,
  },
  timeframeBtn: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  timeframeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  analyticsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  analyticsCardTitle: {
    fontSize: 12,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
  },
  analyticsCardSubtitle: {
    fontSize: 9,
    marginTop: 2,
    marginBottom: 12,
  },
  graphHolderBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    height: 150,
  },
  graphLegends: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginTop: 8,
  },
  legendIndicatorGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
  },
  legendLabelText: {
    fontSize: 9,
    fontWeight: "600",
  },
  auditPrdName: {
    fontSize: 11,
    fontWeight: "900",
  },
  auditMeta: {
    fontSize: 9,
    marginTop: 1,
  },
  auditPrice: {
    fontSize: 11,
    fontWeight: "900",
    fontFamily: "monospace",
  },
  auditPlatformBadge: {
    fontSize: 8,
    fontWeight: "900",
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 4,
    marginTop: 3,
  },
  splitViewportRow: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
  },
  splitLeftCol: {
    flex: 1.5,
    gap: 12,
  },
  splitRightCol: {
    flex: 1.1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  catalogLookupField: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 40,
  },
  catalogLookupInput: {
    flex: 1,
    fontSize: 11,
    marginLeft: 6,
    height: "100%",
    outlineStyle: "none" as any,
  },
  posGridScroll: {
    flex: 1,
  },
  crmContactNode: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  crmContactName: {
    fontSize: 11,
    fontWeight: "900",
  },
  crmContactSpecs: {
    fontSize: 9,
    marginTop: 1,
  },
  userLargeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  userLargeAvatarTxt: {
    fontSize: 16,
    fontWeight: "900",
  },
  userLargeName: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
  },
  userLargeMail: {
    fontSize: 10,
    marginTop: 2,
  },
  pointsIndicatorLayout: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginVertical: 14,
  },
  specMetaLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  specMetaLabelDef: {
    fontSize: 10,
    fontWeight: "600",
  },
  specMetaValDef: {
    fontSize: 10,
    fontWeight: "bold",
  },
  branchSpecsBar: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  employeeNameText: {
    fontSize: 11,
    fontWeight: "900",
  },
  employeeRoleText: {
    fontSize: 9,
    marginTop: 1,
  },
});

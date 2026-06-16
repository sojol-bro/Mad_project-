import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, useWindowDimensions } from "react-native";
import { User, UserRole } from "./types";
import { sampleStores, sampleCategories } from "./mockData";
import { ShopProvider, useShop } from "./context/ShopContext";
import { 
  LayoutDashboard, 
  Boxes, 
  ShoppingCart, 
  Hourglass, 
  FileInput, 
  ReceiptText, 
  Users, 
  Gem, 
  Bell, 
  Sun, 
  Moon, 
  Shield, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ChevronRight,
  LogOut,
  Sliders,
  HelpCircle
} from "lucide-react";

// Native-equivalent Module Imports
import DashboardModule from "./components/DashboardModule";
import InventoryModule from "./components/InventoryModule";
import POSModule from "./components/POSModule";
import ExpiryModule from "./components/ExpiryModule";
import EnterpriseAdminModules from "./components/EnterpriseAdminModules";

export default function App() {
  return (
    <ShopProvider>
      <ShopMain />
    </ShopProvider>
  );
}

function ShopMain() {
  const {
    isAuthenticated,
    currentUser,
    currentTab,
    setCurrentTab,
    isOffline,
    setIsOffline,
    syncQueue,
    isDarkMode,
    setIsDarkMode,
    products,
    transactions,
    purchaseOrders,
    notifications,
    employees,
    customers,
    suppliers,
    stores,
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
    users
  } = useShop();

  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 1024;

  const getDynamicStyles = () => ({
    canvasBg: isDarkMode ? "#0F172A" : "#F3F4F6",
    sidebarBg: isDarkMode ? "#1E293B" : "#FFFFFF",
    headerBg: isDarkMode ? "#1E293B" : "#FFFFFF",
    textColor: isDarkMode ? "#F1F5F9" : "#111827",
    textMuted: isDarkMode ? "#94A3B8" : "#6B7280",
    borderColor: isDarkMode ? "#334155" : "#E5E7EB",
    activeTabBg: isDarkMode ? "rgba(56, 189, 248, 0.15)" : "rgba(37, 99, 233, 0.08)",
    activeTabText: isDarkMode ? "#38BDF8" : "#2563EB"
  });

  const ds = getDynamicStyles();

  const getTabIcon = (id: string, color: string, size = 16) => {
    switch (id) {
      case "dashboard": return <LayoutDashboard size={size} color={color} />;
      case "inventory": return <Boxes size={size} color={color} />;
      case "pos": return <ShoppingCart size={size} color={color} />;
      case "expiry": return <Hourglass size={size} color={color} />;
      case "purchases": return <FileInput size={size} color={color} />;
      case "sales": return <ReceiptText size={size} color={color} />;
      case "employees": return <Users size={size} color={color} />;
      case "customers": return <Gem size={size} color={color} />;
      case "notifications": return <Bell size={size} color={color} />;
      default: return <HelpCircle size={size} color={color} />;
    }
  };

  // Navigation Links definition
  const sidebarLinks = [
    { id: "dashboard", label: "Operational Hub" },
    { id: "inventory", label: "Catalog & Procurement" },
    { id: "pos", label: "Active POS Registers" },
    { id: "expiry", label: "Batch Expiry Radar" },
    { id: "purchases", label: "Vendor Supply POs" },
    { id: "sales", label: "Transaction Ledger" },
    { id: "employees", label: "Employee Roster" },
    { id: "customers", label: "CRM Loyalty Index" },
    { id: "notifications", label: "System Alerts Feed" }
  ];

  // Active unread alerts
  const unreadNotifsCount = notifications.filter(n => n.unread).length;

  if (!isAuthenticated) {
    return (
      <View style={[styles.authContainer, { backgroundColor: isDarkMode ? "#0F172A" : "#F3F4F6" }]}>
        <View style={[styles.authCard, { backgroundColor: ds.sidebarBg, borderColor: ds.borderColor }]}>
          <View style={{ marginBottom: 16 }}>
            <Shield size={44} color={ds.activeTabText} />
          </View>
          <Text style={[styles.authTitle, { color: ds.textColor }]}>ShopNest POS Locked</Text>
          <Text style={[styles.authDesc, { color: ds.textMuted }]}>
            Select or bypass using one of the preset organizational roles to unlock this register.
          </Text>
          
          <ScrollView style={styles.authUsersScroll} showsVerticalScrollIndicator={false}>
            {users.map((usr, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.authUserRow, { backgroundColor: isDarkMode ? "#111827" : "#F9FAFB", borderColor: ds.borderColor }]}
                onPress={() => handleAuthLogin(usr)}
                id={`btn_login_user_${usr.id}`}
              >
                <Image source={{ uri: usr.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" }} style={styles.authUserAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.authUserName, { color: ds.textColor }]}>{usr.name}</Text>
                  <Text style={[styles.authUserRole, { color: ds.textMuted }]}>{usr.role}</Text>
                </View>
                <ChevronRight size={18} color={ds.activeTabText} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.appContainer, { backgroundColor: ds.canvasBg }]}>
      {/* Dynamic Responsive Workspace Layout */}
      <View style={{ flex: 1, flexDirection: isMobile ? "column" : "row" }}>
        
        {/* ==========================================
             LEFT COMPACT SIDEBAR: NAVIGATION & STATUS
           ========================================== */}
        <View style={[styles.sidebar, { backgroundColor: ds.sidebarBg, borderRightColor: ds.borderColor }, isMobile && styles.mobileSidebarHeader]}>
          
          {/* Logo & Branding Brand */}
          <View style={styles.brandContainer}>
            <View style={{ marginRight: 2 }}>
              <Shield size={24} color={ds.activeTabText} />
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: ds.textColor }]}>ShopNest POS</Text>
              <Text style={styles.brandBadge}>ENTERPRISE MULTI-STORE</Text>
            </View>
          </View>

          {/* Sidebar Links Scroll */}
          <ScrollView 
            style={[styles.sidebarLinksScroll, isMobile && { display: "none" }]}
            showsVerticalScrollIndicator={false}
          >
            {sidebarLinks.map((link) => {
              const isActive = currentTab === link.id;
              
              return (
                <TouchableOpacity
                  key={link.id}
                  style={[
                    styles.sidebarLink,
                    isActive && { backgroundColor: ds.activeTabBg }
                  ]}
                  onPress={() => setCurrentTab(link.id)}
                  id={`sidebar_link_${link.id}`}
                >
                  <View style={{ width: 18, alignItems: "center" }}>
                    {getTabIcon(link.id, isActive ? ds.activeTabText : ds.textMuted, 16)}
                  </View>
                  <Text style={[
                    styles.sidebarLinkLabel, 
                    { color: ds.textColor },
                    isActive && { color: ds.activeTabText, fontWeight: "900" }
                  ]}>
                    {link.label}
                  </Text>
                  {link.id === "notifications" && unreadNotifsCount > 0 && (
                    <View style={styles.unreadCountBadge}>
                      <Text style={styles.unreadCountBadgeText}>{unreadNotifsCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom Controls Panel (In Sidebar) */}
          <View style={[styles.sidebarBottomPanel, { borderTopColor: ds.borderColor }, isMobile && { display: "none" }]}>
            
            {/* Privilege Shifter Widget */}
            <View style={[styles.consoleShiftCard, { backgroundColor: isDarkMode ? "#111827" : "#F9FAFB" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Sliders size={12} color={ds.activeTabText} />
                <Text style={[styles.shiftCardTitle, { color: ds.textColor }]}>Operator Role:</Text>
              </View>
              <select
                value={currentUser.role}
                onChange={(e) => handleSwitchSessionRole(e.target.value as any)}
                className={`w-full tracking-tight bg-gray-100 border border-gray-300 text-xs font-sans text-blue-700 font-bold p-2 mt-1 rounded-lg focus:outline-none ${isDarkMode ? "bg-slate-800! border-slate-700! text-sky-400!" : ""}`}
              >
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                <option value={UserRole.COMPANY_MANAGER}>Company Manager</option>
                <option value={UserRole.STORE_MANAGER}>Store Manager</option>
                <option value={UserRole.CASHIER}>Cashier Register</option>
              </select>
            </View>

            {/* Offline Handshake / Sync controls */}
            <TouchableOpacity 
              style={[
                styles.networkStatusCard, 
                isOffline ? styles.statusOfflineCard : styles.statusOnlineCard
              ]}
              onPress={() => {
                setIsOffline(!isOffline);
                if (isOffline) {
                  setTimeout(() => alert("Network handshake detected! Ready to sync local SQLite cache queue."), 400);
                }
              }}
              id="btn_toggle_network_mode"
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                {isOffline ? <WifiOff size={14} color="#EF4444" /> : <Wifi size={14} color="#10B981" />}
                <Text style={[styles.statusCardTitle, { color: isOffline ? "#EF4444" : "#10B981" }]}>
                  {isOffline ? "OFFLINE SIMULATION" : "DATABASE IN SYNCRONY"}
                </Text>
              </View>
              <Text style={styles.statusCardSub}>
                {isOffline ? `Queued: ${syncQueue.length} jobs. Tap to sync!` : "Standard PostgreSQL live commits active."}
              </Text>
            </TouchableOpacity>

            {syncQueue.length > 0 && (
              <TouchableOpacity 
                style={styles.syncQueueFlashBtn} 
                onPress={handleTriggerFulfillSync}
                id="btn_sync_sqlite_cache"
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <RefreshCw size={12} color="#FFFFFF" className="animate-spin" />
                  <Text style={styles.syncQueueFlashText}>Match Caches ({syncQueue.length} Jobs)</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Sync Local Queue Pending List */}
            {syncQueue.length > 0 && (
              <View style={[styles.miniPendingQueueList, { backgroundColor: isDarkMode ? "#0F172A" : "#FEF3C7" }]}>
                <Text style={styles.miniPendingTitle}>Pending Caches:</Text>
                {syncQueue.slice(-3).map((job, jIdx) => (
                  <Text key={jIdx} style={styles.miniPendingLine} numberOfLines={1}>• {job}</Text>
                ))}
              </View>
            )}

          </View>
        </View>

        {/* Mobile quick Horizontal pill row */}
        {isMobile && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={[styles.mobileNavRow, { backgroundColor: ds.headerBg, borderBottomColor: ds.borderColor }]}
            contentContainerStyle={styles.mobileNavRowContent}
          >
            {sidebarLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <TouchableOpacity
                  key={link.id}
                  style={[
                    styles.mobileNavPill,
                    isActive && { backgroundColor: ds.activeTabBg }
                  ]}
                  onPress={() => setCurrentTab(link.id)}
                  id={`mobile_nav_${link.id}`}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {getTabIcon(link.id, isActive ? ds.activeTabText : ds.textMuted, 12)}
                    <Text style={[styles.mobileNavText, isActive && { color: ds.activeTabText, fontWeight: "bold" }]}>
                      {link.label.split(" ")[0]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ==========================================
             RIGHT MAIN AREA: DYNAMIC CHASSIS VIEWPORT
           ========================================== */}
        <View style={styles.mainWorkspace}>
          
          {/* HEADER ROW */}
          <View style={[styles.appHeader, { backgroundColor: ds.headerBg, borderBottomColor: ds.borderColor }]}>
            <View>
              <Text style={[styles.currentTabTitle, { color: ds.textColor }]}>
                {sidebarLinks.find(link => link.id === currentTab)?.label || "Workspace"}
              </Text>
              <Text style={[styles.currentTabSub, { color: ds.textMuted }]}>
                Authenticated POS Terminal View • Multi-Regional Stores
              </Text>
            </View>

            {/* Right side widgets */}
            <View style={styles.headerRightWidgets}>
              
              {/* Theme toggler */}
              <TouchableOpacity 
                style={[styles.headerIconBtn, { borderColor: ds.borderColor }]}
                onPress={() => setIsDarkMode(!isDarkMode)}
                id="btn_header_theme_toggle"
              >
                {isDarkMode ? <Sun size={16} color="#F59E0B" /> : <Moon size={16} color="#475569" />}
              </TouchableOpacity>

              {/* Notification Alarm Icon with Dot */}
              <TouchableOpacity 
                style={[styles.headerIconBtn, { borderColor: ds.borderColor }]}
                onPress={() => setCurrentTab("notifications")}
                id="btn_header_notifs"
              >
                <Bell size={16} color={ds.textColor} />
                {unreadNotifsCount > 0 && (
                  <View style={styles.headerNotifDot} />
                )}
              </TouchableOpacity>

              {/* Active User Card with drop-down role selector for mobile */}
              <View style={styles.headerUserCard}>
                <Image source={{ uri: currentUser.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" }} style={styles.userCardAvatar} />
                {!isMobile && (
                  <View style={{ marginLeft: 8 }}>
                    <Text style={[styles.userCardName, { color: ds.textColor }]}>{currentUser.name}</Text>
                    <Text style={[styles.userCardRole, { color: ds.activeTabText }]}>{currentUser.role}</Text>
                  </View>
                )}
              </View>

              {/* Lock Session button */}
              <TouchableOpacity 
                style={[styles.headerLockBtn]}
                onPress={() => handleAuthLogin(users[Math.min(users.length - 1, 3)])} // locks or shifts
                onLongPress={() => handleAuthLogin(users[0])}
                id="btn_header_role_cycle"
              >
                <Text style={styles.headerLockBtnText}>🔒 Switch Account</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* CORE VIEWPORT CONTENT VIEW */}
          <View style={styles.routerBody}>
            {currentTab === "dashboard" && (
              <DashboardModule
                currentUser={currentUser}
                stores={stores}
                products={products}
                transactions={transactions}
                notifications={notifications}
                onNavigateToScreen={(screen) => setCurrentTab(screen)}
                isDarkMode={isDarkMode}
              />
            )}
            {currentTab === "inventory" && (
              <InventoryModule
                products={products}
                categories={sampleCategories}
                suppliers={suppliers}
                onAddProduct={handleAddProduct}
                onUpdateQty={handleUpdateProductQty}
                isDarkMode={isDarkMode}
              />
            )}
            {currentTab === "pos" && (
              <POSModule
                currentUser={currentUser}
                products={products}
                onCheckout={handlePOSCheckout}
                isDarkMode={isDarkMode}
              />
            )}
            {currentTab === "expiry" && (
              <ExpiryModule
                products={products}
                onApplyMarkdown={handleApplyMarkdown}
                onDiscardProduct={handleDiscardProduct}
                isDarkMode={isDarkMode}
              />
            )}
            {["purchases", "sales", "employees", "customers", "suppliers", "stores", "notifications"].includes(currentTab) && (
              <EnterpriseAdminModules
                activeSection={currentTab}
                stores={stores}
                employees={employees}
                transactions={transactions}
                customers={customers}
                suppliers={suppliers}
                purchaseOrders={purchaseOrders}
                notifications={notifications}
                onApprovePO={handleApprovePO}
                onNavigateToScreen={(screen) => setCurrentTab(screen)}
                onReadNotification={handleReadNotification}
                onAddCustomer={handleAddCustomer}
                onAddEmployee={handleAddEmployee}
                onAddSupplier={handleAddSupplier}
                onAddStore={handleAddStore}
                onCreatePO={handleCreatePurchaseOrder}
                isDarkMode={isDarkMode}
              />
            )}
          </View>

          {/* Quick interactive utility ribbon footer */}
          <View style={[styles.workspaceFooter, { backgroundColor: ds.headerBg, borderTopColor: ds.borderColor }]}>
            <Text style={[styles.footerText, { color: ds.textMuted }]}>
              🔧 SQLite Engine Stack Committed • Node client v4.5.2 • Connected Client status: <Text style={{ color: isOffline ? "#EF4444" : "#10B981", fontWeight: "bold" }}>{isOffline ? "OFFLINE CACHE ACTIVE" : "ONLINE SERVER HANDSHAKE OK"}</Text>
            </Text>
          </View>

        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  mobileSidebarHeader: {
    width: "100%",
    borderRightWidth: 0,
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  brandEmoji: {
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
  },
  brandBadge: {
    fontSize: 8,
    color: "#2563EB",
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  sidebarLinksScroll: {
    flex: 1,
    marginTop: 10,
  },
  sidebarLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    gap: 10,
  },
  sidebarLinkEmoji: {
    fontSize: 14,
  },
  sidebarLinkLabel: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  unreadCountBadge: {
    backgroundColor: "#EF4444",
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 99,
  },
  unreadCountBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
  },
  sidebarBottomPanel: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 12,
  },
  consoleShiftCard: {
    borderRadius: 10,
    padding: 10,
  },
  shiftCardTitle: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  networkStatusCard: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusOnlineCard: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "#10B981",
  },
  statusOfflineCard: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "#EF4444",
  },
  statusCardTitle: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  statusCardSub: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 11,
  },
  syncQueueFlashBtn: {
    backgroundColor: "#F59E0B",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  syncQueueFlashText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },
  miniPendingQueueList: {
    padding: 8,
    borderRadius: 6,
  },
  miniPendingTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#B45309",
    marginBottom: 4,
  },
  miniPendingLine: {
    fontSize: 8,
    color: "#D97706",
    fontFamily: "monospace",
  },
  mobileNavRow: {
    maxHeight: 48,
    borderBottomWidth: 1,
  },
  mobileNavRowContent: {
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 8,
  },
  mobileNavPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  mobileNavText: {
    fontSize: 10,
    color: "#6B7280",
  },
  mainWorkspace: {
    flex: 1,
    flexDirection: "column",
  },
  appHeader: {
    height: 64,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  currentTabTitle: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
  },
  currentTabSub: {
    fontSize: 9,
    marginTop: 2,
  },
  headerRightWidgets: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerIconText: {
    fontSize: 14,
  },
  headerNotifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    position: "absolute",
    top: 2,
    right: 2,
  },
  headerUserCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  userCardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
  },
  userCardName: {
    fontSize: 11,
    fontWeight: "800",
  },
  userCardRole: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 1,
  },
  headerLockBtn: {
    backgroundColor: "rgba(37, 99, 233, 0.08)",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  headerLockBtnText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#2563EB",
  },
  routerBody: {
    flex: 1,
  },
  workspaceFooter: {
    height: 32,
    borderTopWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 8,
    fontFamily: "monospace",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  authCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  authLockIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
  },
  authDesc: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
    marginTop: 6,
    marginBottom: 20,
  },
  authUsersScroll: {
    width: "100%",
    maxHeight: 280,
  },
  authUserRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  authUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  authUserName: {
    fontSize: 12,
    fontWeight: "800",
  },
  authUserRole: {
    fontSize: 10,
    marginTop: 2,
  },
  authLoginArrow: {
    fontSize: 12,
    color: "#2563EB",
  },
});

import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { User, UserRole, Store, Product, SalesTransaction, SystemNotification } from "../types";
import { 
  DollarSign, 
  AlertTriangle, 
  Hourglass, 
  Store as StoreIcon, 
  Bell, 
  ShoppingCart,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Inbox
} from "lucide-react";

interface DashboardProps {
  currentUser: User;
  stores: Store[];
  products: Product[];
  transactions: SalesTransaction[];
  notifications: SystemNotification[];
  onNavigateToScreen: (screen: string) => void;
  isDarkMode: boolean;
}

export default function DashboardModule({
  currentUser,
  stores,
  products,
  transactions,
  notifications,
  onNavigateToScreen,
  isDarkMode
}: DashboardProps) {
  const [selectedChartPoint, setSelectedChartPoint] = useState<string | null>("Q4 ($1.8M)");

  // Aggregate stats
  const totalRevenue = transactions
    .filter(t => t.status === "Completed")
    .reduce((acc, t) => acc + t.amount, 0) + 4289540.00;

  const lowStockProducts = products.filter(p => p.quantity <= p.reorderLevel);
  const criticalAlertsCount = notifications.filter(n => n.urgency === "critical" && n.unread).length;
  const decayingCount = products.filter(p => p.quantity > 0 && p.status === "Critical").length;
  const activeStores = stores.filter(s => s.status === "Online").length;

  const getDynamicStyles = () => {
    return {
      cardBg: isDarkMode ? "#1E293B" : "#FFFFFF",
      borderColor: isDarkMode ? "#334155" : "#E2E8F0",
      textColor: isDarkMode ? "#F1F5F9" : "#0F172A",
      textMuted: isDarkMode ? "#94A3B8" : "#64748B",
      canvasBg: isDarkMode ? "#0F172A" : "#F8FAFC",
      accentGlow: isDarkMode ? "rgba(56, 189, 248, 0.15)" : "rgba(37, 99, 233, 0.05)",
      accentColor: isDarkMode ? "#38BDF8" : "#2563EB",
      successColor: isDarkMode ? "#34D399" : "#10B981"
    };
  };

  const ds = getDynamicStyles();

  // Premium Custom Data Points for SVG Chart
  const chartPoints = [
    { label: "Q1", value: 45, display: "$950k", x: 45, y: 110 },
    { label: "Q2", value: 65, display: "$1.2M", x: 95, y: 80 },
    { label: "Q3", value: 55, display: "$1.1M", x: 145, y: 95 },
    { label: "Q4", value: 95, display: "$1.8M", x: 195, y: 35 },
    { label: "Est", value: 80, display: "$1.6M", x: 245, y: 55 },
    { label: "Goal", value: 100, display: "$2.0M", x: 295, y: 25 }
  ];

  return (
    <ScrollView 
      style={[styles.scrollContainer, { backgroundColor: ds.canvasBg }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Premium Dynamic Role Welcome Banner */}
      <View style={[styles.banner, { backgroundColor: isDarkMode ? "#1E293B" : "#0F172A", borderColor: ds.borderColor }]}>
        <View style={styles.badgeRow}>
          <div className="flex items-center gap-1.5 bg-sky-500/10 text-sky-400 border border-sky-400/20 px-3 py-1 rounded-full text-xs font-bold leading-none uppercase">
            <Sparkles size={11} className="mr-0.5 animate-pulse" />
            <span style={{ fontSize: 9, letterSpacing: 0.5 }}>{currentUser.role}</span>
          </div>
          <Text style={styles.sessionText}>REGISTER TERMINAL ID: #{currentUser.id}</Text>
        </View>
        <Text style={styles.bannerTitle}>Welcome back, {currentUser.name}</Text>
        <Text style={styles.bannerSubtitle}>
          {currentUser.role === UserRole.SUPER_ADMIN && "Authorized Master Client Registry viewport. Absolute read/write network sync, corporate finance logs, and global database commits active."}
          {currentUser.role === UserRole.COMPANY_MANAGER && "Oversight profile loaded. Authorized for multiple local outlets, roster logs, and direct supplier invoices."}
          {currentUser.role === UserRole.STORE_MANAGER && "Local store branch view running. Authorized for stock level adjustments, clearance pricing, and checkout registers."}
          {currentUser.role === UserRole.CASHIER && "Point-of-Sale Register ready. Liquid checkout transactions, real-time ticket billing, and CRM points logs enabled."}
        </Text>

        <View style={styles.bannerBtnRow}>
          <TouchableOpacity 
            style={[styles.bannerBtnSecondary, { backgroundColor: isDarkMode ? "#334155" : "rgba(255, 255, 255, 0.08)" }]}
            onPress={() => onNavigateToScreen("notifications")}
            id="btn_alarm_logs"
          >
            <div className="flex items-center gap-2">
              <Bell size={13} color="#FFFFFF" />
              <span className="text-white text-[11px] font-bold">Alarm Feed ({criticalAlertsCount} Urgent)</span>
            </div>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bannerBtnPrimary, { backgroundColor: "#38BDF8" }]}
            onPress={() => onNavigateToScreen("pos")}
            id="btn_launch_pos"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={13} color="#0F172A" />
              <span className="text-slate-900 text-[11px] font-extrabold uppercase tracking-wider">Launch POS Registers</span>
            </div>
          </TouchableOpacity>
        </View>
      </View>

      {/* Critical System Warning Banner */}
      {lowStockProducts.length > 0 && (
        <View style={[styles.warningBanner, { backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.08)" : "#FEF2F2", borderColor: isDarkMode ? "#991B1B" : "#FCA5A5" }]}>
          <View style={styles.warningInfo}>
            <div className="mr-3 bg-red-500/10 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-500/20">
              <AlertTriangle size={20} color="#EF4444" className="animate-bounce" />
            </div>
            <View style={{ flex: 1 }}>
              <Text style={[styles.warningTitle, { color: isDarkMode ? "#FCA5A5" : "#991B1B" }]}>Critical Shelf Threshold Breach</Text>
              <Text style={[styles.warningCaption, { color: isDarkMode ? "#F3F4F6" : "#7F1D1D" }]}>
                {lowStockProducts.length} high-demand product stock lines collapsed below safe thresholds. Dispatch restock logs instantly.
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.warningActionBtn, { backgroundColor: "#EF4444" }]}
            onPress={() => onNavigateToScreen("inventory")}
            id="btn_inventory_replenish"
          >
            <Text style={styles.warningActionText}>Fix Inventory</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* High-Fidelity Bento Grid Metrics */}
      <View style={styles.gridRow}>
        {/* Metric 1: Enterprise Revenue */}
        <View style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Enterprise gross sales</Text>
            <View style={[styles.iconContainer, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
              <DollarSign size={15} color={ds.successColor} />
            </View>
          </View>
          <Text style={[styles.cardVal, { color: ds.textColor }]}>
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.metricTrendFrame}>
            <div className="flex items-center gap-1">
              <TrendingUp size={12} color={ds.successColor} />
              <Text style={[styles.cardGrowth, { color: ds.successColor }]}>+18.4% YTD</Text>
            </div>
            <Text style={[styles.cardTrendLabel, { color: ds.textMuted }]}>live tracker</Text>
          </View>
        </View>

        {/* Metric 2: Low Stock Warnings */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]} 
          onPress={() => onNavigateToScreen("inventory")}
          id="card_low_stock"
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Low Shelf alerts</Text>
            <View style={[styles.iconContainer, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
              <AlertTriangle size={15} color="#EF4444" />
            </View>
          </View>
          <Text style={[styles.cardVal, { color: ds.textColor }]}>{lowStockProducts.length} Items</Text>
          <View style={styles.metricTrendFrame}>
            <Text style={styles.cardCriticalText}>Immediate PO required</Text>
            <ChevronRight size={14} color="#EF4444" />
          </View>
        </TouchableOpacity>

        {/* Metric 3: Decaying Batches */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]} 
          onPress={() => onNavigateToScreen("expiry")}
          id="card_decaying_batches"
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Expiring batches</Text>
            <View style={[styles.iconContainer, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
              <Hourglass size={15} color="#F59E0B" />
            </View>
          </View>
          <Text style={[styles.cardVal, { color: ds.textColor }]}>{decayingCount} Critical</Text>
          <View style={styles.metricTrendFrame}>
            <Text style={[styles.cardLinkText, { color: ds.accentColor }]}>Apply Markdowns</Text>
            <ChevronRight size={14} color={ds.accentColor} />
          </View>
        </TouchableOpacity>

        {/* Metric 4: Active Locations */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]} 
          onPress={() => onNavigateToScreen("stores")}
          id="card_active_stores"
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Regional Branches</Text>
            <View style={[styles.iconContainer, { backgroundColor: "rgba(56, 189, 248, 0.1)" }]}>
              <StoreIcon size={15} color={ds.accentColor} />
            </View>
          </View>
          <Text style={[styles.cardVal, { color: ds.textColor }]}>{activeStores} Active</Text>
          <View style={styles.metricTrendFrame}>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <Text style={[styles.badgeTextLive, { color: ds.successColor }]}>live sync ok</Text>
            </div>
            <Text style={[styles.metricGrowthText, { color: ds.textMuted }]}>100%</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Sections: Charts & Regional Growth */}
      <View style={styles.sectionRow}>
        {/* Interactive Custom SVG Chart Area */}
        <View style={[styles.mainSectionPanel, { backgroundColor: ds.cardBg, borderColor: ds.borderColor, flex: 1.8 }]}>
          <View style={styles.panelHeaderRow}>
            <View>
              <Text style={[styles.panelTitle, { color: ds.textColor }]}>Revenue Trends & Multi-store Metrics</Text>
              <Text style={[styles.panelSubtitle, { color: ds.textMuted }]}>Quarterly projection tracking. Touch coordinates to view balances.</Text>
            </View>
            {selectedChartPoint && (
              <div className="bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-sky-400">
                {selectedChartPoint}
              </div>
            )}
          </View>

          {/* Interactive SVG Chart Graphic */}
          <View style={[styles.chartContext, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: ds.borderColor }]}>
            <svg viewBox="0 0 350 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="330" y2="20" stroke={isDarkMode ? "#1E293B" : "#E2E8F0"} strokeWidth="1" />
              <line x1="30" y1="60" x2="330" y2="60" stroke={isDarkMode ? "#1E293B" : "#E2E8F0"} strokeWidth="1" />
              <line x1="30" y1="100" x2="330" y2="100" stroke={isDarkMode ? "#1E293B" : "#E2E8F0"} strokeWidth="1" />
              <line x1="30" y1="120" x2="330" y2="120" stroke={isDarkMode ? "#334155" : "#CBD5E1"} strokeWidth="2" />

              {/* Chart Line Path */}
              <path
                d="M 45 110 L 95 80 L 145 95 L 195 35 L 245 55 L 295 25"
                fill="none"
                stroke={ds.accentColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Glowing Area Fill under line */}
              <path
                d="M 45 110 L 95 80 L 145 95 L 195 35 L 245 55 L 295 25 L 295 120 L 45 120 Z"
                fill={isDarkMode ? "rgba(56, 189, 248, 0.08)" : "rgba(37, 99, 233, 0.04)"}
              />

              {/* Interactive Point Nodes */}
              {chartPoints.map((pt, i) => {
                const isSelected = selectedChartPoint?.startsWith(pt.label);
                return (
                  <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSelectedChartPoint(`${pt.label} (${pt.display})`)}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? "7" : "5"}
                      fill={isSelected ? ds.accentColor : (isDarkMode ? "#0F172A" : "#FFFFFF")}
                      stroke={ds.accentColor}
                      strokeWidth={isSelected ? "3" : "2"}
                    />
                    {/* Shadow pulse under node */}
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill="none"
                        stroke={ds.accentColor}
                        strokeWidth="1.5"
                        opacity="0.4"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Custom Interactive Labels Row */}
            <View style={styles.chartInteractiveLabels}>
              {chartPoints.map((pt, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.chartInteractiveTab, selectedChartPoint?.startsWith(pt.label) && { backgroundColor: ds.accentGlow, borderRadius: 6 }]}
                  onPress={() => setSelectedChartPoint(`${pt.label} (${pt.display})`)}
                  id={`chart_tab_${pt.label}`}
                >
                  <Text style={[styles.chartInteractiveLabelText, { color: selectedChartPoint?.startsWith(pt.label) ? ds.accentColor : ds.textMuted }]}>
                    {pt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Regional Branch list */}
        <View style={[styles.mainSectionPanel, { backgroundColor: ds.cardBg, borderColor: ds.borderColor, flex: 1.2 }]}>
          <Text style={[styles.panelTitle, { color: ds.textColor }]}>Physical Network Metrics</Text>
          <Text style={[styles.panelSubtitle, { color: ds.textMuted }]}>Outlets storage capacity weight & sales growth.</Text>

          {stores.length === 0 ? (
            <View style={{ alignItems: "center", justifyContent: "center", padding: 32 }}>
              <Inbox size={32} color={ds.textMuted} style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 11, color: ds.textMuted, textAlign: "center" }}>No active retail branches configured.</Text>
            </View>
          ) : (
            <ScrollView style={styles.branchScrollList} showsVerticalScrollIndicator={false}>
              {stores.map((st, i) => {
                const capColor = st.inventoryCapacityPct > 90 ? "#EF4444" : st.inventoryCapacityPct > 70 ? "#F59E0B" : ds.successColor;
                return (
                  <View key={i} style={[styles.branchCard, { backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC", borderColor: ds.borderColor }]}>
                    <View style={styles.branchHeader}>
                      <View style={styles.branchMeta}>
                        <View style={[styles.branchBadgeCircle, { backgroundColor: ds.accentGlow }]}>
                          <Text style={[styles.branchBadgeText, { color: ds.accentColor }]}>{st.code.split("-")[1]}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.branchName, { color: ds.textColor }]} numberOfLines={1}>{st.name}</Text>
                          <Text style={[styles.branchSubtitleText, { color: ds.textMuted }]}>Cap: {st.inventoryCount} units</Text>
                        </View>
                      </View>
                      <View style={styles.branchEarnings}>
                        <Text style={[styles.branchSalesVal, { color: ds.textColor }]}>${st.dailySales.toLocaleString()}</Text>
                        <Text style={[styles.branchGrowthVal, { color: st.salesGrowth >= 0 ? ds.successColor : "#EF4444" }]}>
                          {st.salesGrowth >= 0 ? "▲" : "▼"} {Math.abs(st.salesGrowth)}%
                        </Text>
                      </View>
                    </View>

                    {/* Modern Capacity Segment Bar */}
                    <View style={styles.capTrackContainer}>
                      <View style={styles.capTrackLabelRow}>
                        <Text style={[styles.capTrackLabel, { color: ds.textMuted }]}>Volume Capacity</Text>
                        <Text style={[styles.capTrackVal, { color: capColor }]}>{st.inventoryCapacityPct}%</Text>
                      </View>
                      <View style={styles.capProgressBarBg}>
                        <View style={[styles.capProgressBarFill, { width: `${st.inventoryCapacityPct}%`, backgroundColor: capColor }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Recent Ledger Audit Logs */}
      <View style={[styles.mainSectionPanel, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
        <View style={styles.feedHeaderRow}>
          <View>
            <Text style={[styles.panelTitle, { color: ds.textColor }]}>Real-time Cashier Ledger Journals</Text>
            <Text style={[styles.panelSubtitle, { color: ds.textMuted }]}>Audit feed of liquid client invoices and active checkout transactions.</Text>
          </View>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span style={{ fontSize: 9, letterSpacing: 0.5 }} className="text-emerald-400 font-mono font-bold uppercase leading-none">Live handshake ok</span>
          </div>
        </View>

        <View style={styles.feedColumnList}>
          {transactions.slice(0, 4).map((trx, idx) => (
            <View key={idx} style={[styles.feedRowItem, { borderBottomColor: ds.borderColor }]}>
              <View style={styles.feedLeftNode}>
                <View style={[styles.clientAvatar, { backgroundColor: ds.accentGlow }]}>
                  <Text style={[styles.clientAvatarText, { color: ds.accentColor }]}>{trx.customerInitials}</Text>
                </View>
                <View>
                  <Text style={[styles.feedClientName, { color: ds.textColor }]}>{trx.customerName}</Text>
                  <Text style={[styles.feedMetaText, { color: ds.textMuted }]}>{trx.dateTime} • Paid via {trx.paymentMethod}</Text>
                </View>
              </View>
              <View style={styles.feedRightNode}>
                <Text style={[styles.feedMoneyText, { color: ds.textColor }]}>${trx.amount.toFixed(2)}</Text>
                <div style={{ fontSize: 8 }} className={`px-2 py-0.5 rounded text-[8px] font-bold ${trx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {trx.status.toUpperCase()}
                </div>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 20,
  },
  banner: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sessionText: {
    color: "#94A3B8",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 8,
    fontFamily: "Space Grotesk",
    letterSpacing: -0.5,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "#CBD5E1",
    lineHeight: 18,
    marginBottom: 20,
  },
  bannerBtnRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  bannerBtnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerBtnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#475569",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 16,
    flexWrap: "wrap",
  },
  warningInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  warningCaption: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  warningActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  warningActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  card: {
    flex: 1,
    minWidth: 220,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardVal: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
    fontFamily: "Space Grotesk",
  },
  metricTrendFrame: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardGrowth: {
    fontSize: 10,
    fontWeight: "800",
  },
  cardTrendLabel: {
    fontSize: 9,
    fontWeight: "600",
  },
  cardCriticalText: {
    fontSize: 10,
    color: "#EF4444",
    fontWeight: "800",
  },
  cardLinkText: {
    fontSize: 10,
    fontWeight: "800",
  },
  badgeTextLive: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricGrowthText: {
    fontSize: 9,
    fontWeight: "600",
  },
  sectionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  mainSectionPanel: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  panelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
  },
  panelSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  chartContext: {
    height: 170,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  chartInteractiveLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.15)",
    paddingTop: 8,
    marginTop: 8,
  },
  chartInteractiveTab: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  chartInteractiveLabelText: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "800",
  },
  branchScrollList: {
    maxHeight: 185,
    marginTop: 4,
  },
  branchCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  branchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  branchMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1.5,
  },
  branchBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  branchBadgeText: {
    fontSize: 10,
    fontWeight: "900",
  },
  branchName: {
    fontSize: 11,
    fontWeight: "900",
  },
  branchSubtitleText: {
    fontSize: 9,
    marginTop: 1,
  },
  branchEarnings: {
    alignItems: "flex-end",
  },
  branchSalesVal: {
    fontSize: 11,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  branchGrowthVal: {
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
  },
  capTrackContainer: {
    marginTop: 10,
  },
  capTrackLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  capTrackLabel: {
    fontSize: 9,
    fontWeight: "600",
  },
  capTrackVal: {
    fontSize: 9,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  capProgressBarBg: {
    height: 5,
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    borderRadius: 99,
    overflow: "hidden",
  },
  capProgressBarFill: {
    height: "100%",
    borderRadius: 99,
  },
  feedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  feedColumnList: {
    marginTop: 4,
  },
  feedRowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  feedLeftNode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  clientAvatarText: {
    fontSize: 11,
    fontWeight: "900",
  },
  feedClientName: {
    fontSize: 12,
    fontWeight: "800",
  },
  feedMetaText: {
    fontSize: 9,
    marginTop: 2,
  },
  feedRightNode: {
    alignItems: "flex-end",
    gap: 6,
  },
  feedMoneyText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "monospace",
  },
});

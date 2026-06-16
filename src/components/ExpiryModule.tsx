import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Product } from "../types";
import { Hourglass, Trash2, Clock, Flame, ShieldAlert, CheckCircle } from "lucide-react";

interface ExpiryProps {
  products: Product[];
  onApplyMarkdown: (prdId: string, markdownPct: number) => void;
  onDiscardProduct: (prdId: string) => void;
  isDarkMode: boolean;
}

export default function ExpiryModule({ products, onApplyMarkdown, onDiscardProduct, isDarkMode }: ExpiryProps) {
  const [expiryFilter, setExpiryFilter] = useState<"7" | "30" | "60" | "all">("all");

  const getDaysRemaining = (expiryDateStr?: string) => {
    if (!expiryDateStr) return 999;
    const expDate = new Date(expiryDateStr);
    const today = new Date();
    const diffMs = expDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const expiringProducts = products.filter(prd => {
    if (!prd.expiryDate) return false;
    const daysRemaining = getDaysRemaining(prd.expiryDate);

    if (expiryFilter === "7") return daysRemaining <= 7;
    if (expiryFilter === "30") return daysRemaining <= 30;
    if (expiryFilter === "60") return daysRemaining <= 60;
    return true; // show all
  });

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

  return (
    <View style={[styles.container, { backgroundColor: ds.canvasBg }]}>
      <View style={styles.headerArea}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Hourglass size={20} color={ds.accentColor} />
          <Text style={[styles.panelTitle, { color: ds.textColor, marginBottom: 0 }]}>Decaying Batch Expiry Ledger</Text>
        </View>
        <Text style={[styles.panelSubtitle, { color: ds.textMuted }]}>
          Execute target clearance price markdowns or complete batch purges to maintain core product safety standards.
        </Text>
      </View>

      {/* Filter Row Tabs */}
      <View style={[styles.filterRow, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
        <TouchableOpacity 
          style={[
            styles.filterBtn, 
            expiryFilter === "7" && { backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "#EF4444" }
          ]} 
          onPress={() => setExpiryFilter("7")}
          id="btn_filter_expiry_7"
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <Flame size={13} color={expiryFilter === "7" ? "#EF4444" : ds.textColor} />
            <Text style={[styles.filterBtnText, { color: expiryFilter === "7" ? "#EF4444" : ds.textColor }]}>Under 7 Days</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.filterBtn, 
            expiryFilter === "30" && { backgroundColor: "rgba(245, 158, 11, 0.15)", borderColor: "#F59E0B" }
          ]} 
          onPress={() => setExpiryFilter("30")}
          id="btn_filter_expiry_30"
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <ShieldAlert size={13} color={expiryFilter === "30" ? "#F59E0B" : ds.textColor} />
            <Text style={[styles.filterBtnText, { color: expiryFilter === "30" ? "#F59E0B" : ds.textColor }]}>Under 30 Days</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.filterBtn, 
            expiryFilter === "60" && { backgroundColor: ds.accentGlow, borderColor: ds.accentColor }
          ]} 
          onPress={() => setExpiryFilter("60")}
          id="btn_filter_expiry_60"
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <Clock size={13} color={expiryFilter === "60" ? ds.accentColor : ds.textColor} />
            <Text style={[styles.filterBtnText, { color: expiryFilter === "60" ? ds.accentColor : ds.textColor }]}>Under 60 Days</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.filterBtn, 
            expiryFilter === "all" && { backgroundColor: "rgba(148, 163, 184, 0.15)", borderColor: ds.textMuted }
          ]} 
          onPress={() => setExpiryFilter("all")}
          id="btn_filter_expiry_all"
        >
          <Text style={[styles.filterBtnText, { color: expiryFilter === "all" ? ds.textColor : ds.textMuted }]}>Show All</Text>
        </TouchableOpacity>
      </View>

      {/* List content */}
      <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
        {expiringProducts.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: ds.cardBg, borderColor: ds.borderColor, alignItems: "center" }]}>
            <View style={{ marginBottom: 12, alignItems: "center" }}>
              <CheckCircle size={32} color={ds.successColor} />
            </View>
            <Text style={[styles.emptyTitle, { color: ds.textColor }]}>Safe Shelf Stock Levels</Text>
            <Text style={[styles.emptyTextText, { color: ds.textMuted }]}>
              There are no product batches matching your expiration safety filters. Great job preserving stock health!
            </Text>
          </View>
        ) : (
          expiringProducts.map((prd, i) => {
            const daysLeft = getDaysRemaining(prd.expiryDate);
            
            // Logarithmic color coding
            let statusColor = "#10B981"; // green
            let statusGlow = "rgba(16, 185, 129, 0.12)";
            let statusLabel = "SAFE STABLE";
            
            if (daysLeft <= 7) {
              statusColor = "#EF4444"; // critical red
              statusGlow = "rgba(239, 68, 68, 0.14)";
              statusLabel = "CRITICAL EXPIRED";
            } else if (daysLeft <= 30) {
              statusColor = "#F59E0B"; // warning orange
              statusGlow = "rgba(245, 158, 11, 0.14)";
              statusLabel = "WARNING DECAYING";
            }

            // progress width pct
            const progressPct = Math.max(0, Math.min(100, (daysLeft / 60) * 100));

            return (
              <View 
                key={i} 
                style={[styles.decayCard, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}
              >
                <View style={styles.decayCardHeader}>
                  <View style={styles.decayPrdLeft}>
                    <Image source={{ uri: prd.imageUrl }} style={styles.decayImg} />
                    <View>
                      <Text style={[styles.decayName, { color: ds.textColor }]} numberOfLines={1}>{prd.name}</Text>
                      <Text style={[styles.decaySpecs, { color: ds.textMuted }]}>
                        SKU: {prd.sku} • Lot: {prd.batchNumber || "B-DEC-24"}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.decayUrgencyBadge, { backgroundColor: statusGlow }]}>
                    <Text style={[styles.decayUrgencyText, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                </View>

                {/* Progress scale */}
                <View style={styles.timelineScale}>
                  <View style={styles.timelineLabels}>
                    <Text style={[styles.timelineLabelText, { color: ds.textMuted }]}>Shelf Expired</Text>
                    <Text style={[styles.daysCounter, { color: statusColor }]}>
                      {daysLeft <= 0 ? "EXPIRED" : `${daysLeft} days remaining`}
                    </Text>
                    <Text style={[styles.timelineLabelText, { color: ds.textMuted }]}>60 Days Limit</Text>
                  </View>
                  <View style={[styles.progressBg, { backgroundColor: isDarkMode ? "#334155" : "#E2E8F0" }]}>
                    <View style={[styles.progressBar, { width: `${progressPct}%`, backgroundColor: statusColor }]} />
                  </View>
                </View>

                {/* Pricing summary */}
                <View style={[styles.detailsPricingBox, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
                  <View style={styles.priceSpec}>
                    <Text style={[styles.pLabel, { color: ds.textMuted }]}>Acquisition Cost</Text>
                    <Text style={[styles.pVal, { color: ds.textColor }]}>${prd.costPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.priceSpec}>
                    <Text style={[styles.pLabel, { color: ds.textMuted }]}>Original retail</Text>
                    <Text style={[styles.pVal, { color: ds.textColor }]}>${prd.sellingPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.priceSpec}>
                    <Text style={[styles.pLabel, { color: ds.textMuted }]}>Current Stock Qty</Text>
                    <Text style={[styles.pVal, { color: ds.textColor }]}>{prd.quantity} Units</Text>
                  </View>
                </View>

                {/* Active MD & Clearance actions */}
                <View style={styles.markdownPanelRow}>
                  <Text style={[styles.actionPrompt, { color: ds.textColor }]}>Clearance Markdown:</Text>
                  <View style={styles.markdownPills}>
                    <TouchableOpacity 
                      style={[styles.markdownBtn, { borderColor: ds.borderColor }]} 
                      onPress={() => {
                        onApplyMarkdown(prd.id, 20);
                        alert(`Successfully applied 20% markdown clearance price to ${prd.name}!`);
                      }}
                      id={`btn_md_20_${prd.id}`}
                    >
                      <Text style={[styles.markdownText, { color: ds.accentColor }]}>-20%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.markdownBtn, { borderColor: ds.borderColor }]} 
                      onPress={() => {
                        onApplyMarkdown(prd.id, 35);
                        alert(`Successfully applied 35% markdown clearance price to ${prd.name}!`);
                      }}
                      id={`btn_md_35_${prd.id}`}
                    >
                      <Text style={[styles.markdownText, { color: ds.accentColor }]}>-35%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.markdownBtn, { borderColor: ds.borderColor }]} 
                      onPress={() => {
                        onApplyMarkdown(prd.id, 50);
                        alert(`Successfully applied 50% markdown clearance price to ${prd.name}!`);
                      }}
                      id={`btn_md_50_${prd.id}`}
                    >
                      <Text style={[styles.markdownText, { color: ds.accentColor }]}>-50%</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.purgeBtn, { backgroundColor: isDarkMode ? "#5A1B22" : "#FEE2E2" }]} 
                      onPress={() => {
                        onDiscardProduct(prd.id);
                        alert(`Authorized complete catalog discard for expired batch of ${prd.name}.`);
                      }}
                      id={`btn_purge_${prd.id}`}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Trash2 size={13} color={isDarkMode ? "#FCA5A5" : "#B91C1C"} />
                        <Text style={[styles.purgeText, { color: isDarkMode ? "#FCA5A5" : "#B91C1C", fontWeight: "bold" }]}>Purge Lot</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerArea: {
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
  },
  panelSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 5,
    gap: 6,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterBtn: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  scrollList: {
    flex: 1,
  },
  emptyState: {
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "bold",
  },
  emptyTextText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  decayCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  decayCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  decayPrdLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  decayImg: {
    width: 36,
    height: 36,
    borderRadius: 6,
    resizeMode: "cover",
  },
  decayName: {
    fontSize: 12,
    fontWeight: "900",
  },
  decaySpecs: {
    fontSize: 9,
    marginTop: 2,
  },
  decayUrgencyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  decayUrgencyText: {
    fontSize: 8,
    fontWeight: "900",
    fontFamily: "monospace",
  },
  timelineScale: {
    marginBottom: 14,
  },
  timelineLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  timelineLabelText: {
    fontSize: 8,
    fontWeight: "600",
  },
  daysCounter: {
    fontSize: 9,
    fontWeight: "900",
    fontFamily: "monospace",
  },
  progressBg: {
    height: 5,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 99,
  },
  detailsPricingBox: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
    gap: 10,
  },
  priceSpec: {
    flex: 1,
    alignItems: "center",
  },
  pLabel: {
    fontSize: 8,
    fontWeight: "600",
  },
  pVal: {
    fontSize: 11,
    fontWeight: "800",
    fontFamily: "monospace",
    marginTop: 2,
  },
  markdownPanelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  actionPrompt: {
    fontSize: 10,
    fontWeight: "800",
  },
  markdownPills: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  markdownBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markdownText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  purgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  purgeText: {
    color: "#EF4444",
    fontSize: 9,
    fontWeight: "bold",
  },
});

import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
import { Product, Category, Supplier } from "../types";
import { 
  Search, 
  Plus, 
  Grid, 
  List, 
  Package, 
  AlertTriangle, 
  Building, 
  Calendar, 
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle,
  Inbox
} from "lucide-react";

interface InventoryProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  onAddProduct: (newP: Omit<Product, "id" | "status">) => void;
  onUpdateQty: (productId: string, qty: number) => void;
  isDarkMode: boolean;
}

export default function InventoryModule({
  products,
  categories,
  suppliers,
  onAddProduct,
  onUpdateQty,
  isDarkMode
}: InventoryProps) {
  // Navigation & Toggle states
  const [isOpeningForm, setIsOpeningForm] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(products[0] || null);

  // Form Fields
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newBarcode, setNewBarcode] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("Artisanal Beverages");
  const [newSupplier, setNewSupplier] = useState(suppliers[0]?.id || "SPL-001");
  const [newCost, setNewCost] = useState(0);
  const [newSelling, setNewSelling] = useState(0);
  const [newQty, setNewQty] = useState(50);
  const [newReorder, setNewReorder] = useState(15);
  const [newBatch, setNewBatch] = useState("B-DEC-2024");
  const [newExpiry, setNewExpiry] = useState("2026-12-31");

  const handleGenerateSKU = () => {
    const brandCode = (newBrand || "GEN").substring(0, 3).toUpperCase();
    const catCode = newCategory.substring(0, 3).toUpperCase();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setNewSku(`${brandCode}-${catCode}-${randNum}`);
    setNewBarcode(`789201${randNum}`);
  };

  const handleCreateProduct = () => {
    if (!newName || !newSku) {
      alert("Name and SKU are required fields for catalog initialization.");
      return;
    }
    onAddProduct({
      name: newName,
      sku: newSku,
      barcode: newBarcode || "8839210082",
      category: newCategory,
      brand: newBrand || "Brandless",
      description: "Warehouse inbound procurement stock registered.",
      costPrice: Number(newCost) || 5.00,
      sellingPrice: Number(newSelling) || 12.00,
      quantity: Number(newQty) || 10,
      reorderLevel: Number(newReorder) || 5,
      batchNumber: newBatch,
      expiryDate: newExpiry,
      supplierId: newSupplier,
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80"
    });

    // Reset Fields
    setNewName("");
    setNewSku("");
    setNewBarcode("");
    setNewBrand("");
    setNewCost(0);
    setNewSelling(0);
    setNewQty(50);
    setIsOpeningForm(false);
    alert("Procurement catalog item successfully matching SQLite database.");
  };

  // Filtration logic
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
    const matchesCategory = selectedCategory === "All Categories" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
      {/* Header Search & Filtering Hub */}
      <View style={styles.headerHub}>
        <View style={[styles.searchContainer, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
          <View style={{ marginLeft: 8, marginRight: 4, transform: [{ translateY: 1 }] }}>
            <Search size={14} color={ds.textMuted} />
          </View>
          <TextInput
            style={[styles.searchInput, { color: ds.textColor }]}
            placeholder="Search by name, brand, or SKU code..."
            placeholderTextColor={ds.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
            id="input_product_search"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")} id="btn_clear_search">
              <Text style={[styles.clearIcon, { color: ds.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightHeaderControls}>
          {/* List vs Grid Switch buttons */}
          <View style={[styles.toggleContainer, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === "grid" && { backgroundColor: ds.cardBg }]}
              onPress={() => setViewMode("grid")}
              id="btn_set_grid_view"
            >
              <Text style={[styles.toggleBtnText, { color: viewMode === "grid" ? ds.accentColor : ds.textMuted }]}>Grid</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === "list" && { backgroundColor: ds.cardBg }]}
              onPress={() => setViewMode("list")}
              id="btn_set_list_view"
            >
              <Text style={[styles.toggleBtnText, { color: viewMode === "list" ? ds.accentColor : ds.textMuted }]}>List</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Procure launcher */}
          <TouchableOpacity 
            style={[styles.primaryActionBtn, { backgroundColor: ds.accentColor }]}
            onPress={() => {
              setIsOpeningForm(!isOpeningForm);
              if (!isOpeningForm) {
                handleGenerateSKU();
              }
            }}
            id="btn_procure_registy"
          >
            <Text style={styles.primaryActionText}>
              {isOpeningForm ? "View Catalog" : "Procure Item"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories Pill Scroller */}
      <View style={styles.categoryPillsScroller}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {["All Categories", ...categories.map(c => c.name)].map((slug, i) => {
            const isSelected = selectedCategory === slug;
            return (
              <TouchableOpacity 
                key={i} 
                style={[
                  styles.categoryPill, 
                  { backgroundColor: isSelected ? ds.accentColor : ds.cardBg, borderColor: isSelected ? ds.accentColor : ds.borderColor }
                ]}
                onPress={() => setSelectedCategory(slug)}
                id={`pill_category_${slug.replace(/\s+/g, '_')}`}
              >
                <Text style={[styles.categoryPillText, { color: isSelected ? "#0F172A" : ds.textColor, fontWeight: isSelected ? "bold" : "normal" }]}>
                  {slug}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Core Layout Grid */}
      <View style={styles.layoutBody}>
        {/* Left Side: Product interactive array */}
        <View style={styles.leftPane}>
          {isOpeningForm ? (
            <ScrollView style={[styles.formCard, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]} showsVerticalScrollIndicator={false}>
              <View style={styles.formSectionHeader}>
                <Text style={[styles.formTitle, { color: ds.textColor }]}>🏭 Procure Stock Registry Entry</Text>
                <Text style={[styles.formCaption, { color: ds.textMuted }]}>Introduce a fresh lot directly into the retail stock catalog</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: ds.textColor }]}>Product Descriptor / Name *</Text>
                <TextInput 
                  style={[styles.textInput, { backgroundColor: ds.inputBg, borderColor: ds.borderColor, color: ds.textColor }]} 
                  value={newName} 
                  onChangeText={setNewName}
                  placeholder="e.g. Arabica Reserve Espresso Supreme"
                  placeholderTextColor={ds.textMuted}
                  id="input_form_name"
                />
              </View>

              <View style={styles.formGroupGrid}>
                <View style={styles.gridHalf}>
                  <Text style={[styles.fieldLabel, { color: ds.textColor }]}>Manufacturing Brand</Text>
                  <TextInput 
                    style={[styles.textInput, { backgroundColor: ds.inputBg, borderColor: ds.borderColor, color: ds.textColor }]} 
                    value={newBrand} 
                    onChangeText={setNewBrand}
                    placeholder="e.g. CupNest Co"
                    placeholderTextColor={ds.textMuted}
                    id="input_form_brand"
                  />
                </View>
                <View style={styles.gridHalf}>
                  <Text style={[styles.fieldLabel, { color: ds.textColor }]}>Department / Category</Text>
                  <TextInput 
                    style={[styles.textInput, { backgroundColor: ds.inputBg, borderColor: ds.borderColor, color: ds.textColor }]} 
                    value={newCategory} 
                    onChangeText={setNewCategory}
                    placeholder="e.g. Artisanal Beverages"
                    placeholderTextColor={ds.textMuted}
                    id="input_form_category"
                  />
                </View>
              </View>

              <View style={[styles.skuBarcodeGenBox, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: ds.textColor, marginBottom: 2 }]}>Generated SKU & Barcode identifiers</Text>
                  <Text style={[styles.generatorCodeOutput, { color: ds.accentColor }]}>
                    SKU: {newSku || "[Generates on Brand input]"} • Barcode: {newBarcode || "[N/A]"}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.miniGenerateBtn, { backgroundColor: ds.accentColor }]} 
                  onPress={handleGenerateSKU}
                  id="btn_auto_gen"
                >
                  <Text style={styles.miniGenerateBtnText}>Generate</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroupGrid}>
                <View style={styles.gridHalf}>
                  <Text style={[styles.fieldLabel, { color: ds.textColor }]}>Acquisition Price ($)</Text>
                  <TextInput 
                    style={[styles.textInput, { backgroundColor: ds.inputBg, borderColor: ds.borderColor, color: ds.textColor }]} 
                    keyboardType="numeric"
                    value={String(newCost || "")} 
                    onChangeText={(val) => setNewCost(Number(val))}
                    placeholder="e.g. 12.00"
                    placeholderTextColor={ds.textMuted}
                    id="input_form_cost"
                  />
                </View>
                <View style={styles.gridHalf}>
                  <Text style={[styles.fieldLabel, { color: ds.textColor }]}>Selling Retail Target ($)</Text>
                  <TextInput 
                    style={[styles.textInput, { backgroundColor: ds.inputBg, borderColor: ds.borderColor, color: ds.textColor }]} 
                    keyboardType="numeric"
                    value={String(newSelling || "")} 
                    onChangeText={(val) => setNewSelling(Number(val))}
                    placeholder="e.g. 24.99"
                    placeholderTextColor={ds.textMuted}
                    id="input_form_selling"
                  />
                </View>
              </View>

              <View style={styles.formGroupGrid}>
                <View style={styles.gridHalf}>
                  <Text style={[styles.fieldLabel, { color: ds.textColor }]}>Intake Stock Counter *</Text>
                  <TextInput 
                    style={[styles.textInput, { backgroundColor: ds.inputBg, borderColor: ds.borderColor, color: ds.textColor }]} 
                    keyboardType="numeric"
                    value={String(newQty)} 
                    onChangeText={(val) => setNewQty(Number(val) || 0)}
                    id="input_form_qty"
                  />
                </View>
                <View style={styles.gridHalf}>
                  <Text style={[styles.fieldLabel, { color: ds.textColor }]}>Safety Trigger Threshold *</Text>
                  <TextInput 
                    style={[styles.textInput, { backgroundColor: ds.inputBg, borderColor: ds.borderColor, color: ds.textColor }]} 
                    keyboardType="numeric"
                    value={String(newReorder)} 
                    onChangeText={(val) => setNewReorder(Number(val) || 0)}
                    id="input_form_reorder"
                  />
                </View>
              </View>

              <View style={styles.formGroupGrid}>
                <View style={styles.gridHalf}>
                  <Text style={[styles.fieldLabel, { color: ds.textColor }]}>Intake Batch Number</Text>
                  <TextInput 
                    style={[styles.textInput, { backgroundColor: ds.inputBg, borderColor: ds.borderColor, color: ds.textColor }]} 
                    value={newBatch} 
                    onChangeText={setNewBatch}
                    id="input_form_batch"
                  />
                </View>
                <View style={styles.gridHalf}>
                  <Text style={[styles.fieldLabel, { color: ds.textColor }]}>Lot Expiration Date (YYYY-MM-DD)</Text>
                  <TextInput 
                    style={[styles.textInput, { backgroundColor: ds.inputBg, borderColor: ds.borderColor, color: ds.textColor }]} 
                    value={newExpiry} 
                    onChangeText={setNewExpiry}
                    id="input_form_expiry"
                  />
                </View>
              </View>

              <View style={styles.formActionButtonsRow}>
                <TouchableOpacity 
                  style={[styles.discardBtn, { borderColor: ds.borderColor }]} 
                  onPress={() => setIsOpeningForm(false)}
                  id="btn_discard_catalog_entry"
                >
                  <Text style={[styles.discardBtnText, { color: ds.textColor }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.submitFormBtn, { backgroundColor: ds.accentColor }]} 
                  onPress={handleCreateProduct}
                  id="btn_commit_catalog_entry"
                >
                  <Text style={styles.submitFormText}>Authorize Procurement Stock</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <ScrollView style={styles.catalogScrollArea} showsVerticalScrollIndicator={false}>
              {filteredProducts.length === 0 ? (
                <View style={[styles.emptySearchFrame, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
                  <Inbox size={32} color={ds.textMuted} style={{ marginBottom: 10 }} />
                  <Text style={[styles.emptySearchTitle, { color: ds.textColor }]}>No Catalog Matches</Text>
                  <Text style={[styles.emptySearchSub, { color: ds.textMuted }]}>
                    No products could be found matching "{searchTerm}" under "{selectedCategory}". Please redefine filters.
                  </Text>
                  <TouchableOpacity 
                    style={[styles.clearSearchAccentBtn, { backgroundColor: ds.accentColor }]}
                    onPress={() => {
                      setSearchTerm("");
                      setSelectedCategory("All Categories");
                    }}
                    id="btn_reset_filters"
                  >
                    <Text style={styles.clearSearchAccentBtnText}>Clear Filtration Filters</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={viewMode === "grid" ? styles.gridContent : styles.listContent}>
                  {filteredProducts.map((prd, i) => {
                    const isLowStock = prd.quantity <= prd.reorderLevel;
                    const isInspected = inspectedProduct?.id === prd.id;
                    const stockBg = isLowStock ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)";
                    const stockText = isLowStock ? "#EF4444" : ds.successColor;

                    if (viewMode === "grid") {
                      return (
                        <TouchableOpacity 
                          key={prd.id} 
                          style={[
                            styles.gridCard, 
                            { backgroundColor: ds.cardBg, borderColor: isInspected ? ds.accentColor : ds.borderColor }
                          ]}
                          onPress={() => setInspectedProduct(prd)}
                          id={`product_card_${prd.id}`}
                        >
                          <Image source={{ uri: prd.imageUrl }} style={styles.gridCardImage} />
                          <View style={styles.gridCardDetails}>
                            <Text style={[styles.gridCardName, { color: ds.textColor }]} numberOfLines={1}>{prd.name}</Text>
                            <Text style={[styles.gridCardSku, { color: ds.textMuted }]}>{prd.sku}</Text>
                            <View style={styles.gridCardPricingRow}>
                              <Text style={[styles.gridCardPrice, { color: ds.textColor }]}>${prd.sellingPrice.toFixed(2)}</Text>
                              <View style={[styles.miniStockBadge, { backgroundColor: stockBg }]}>
                                <Text style={[styles.miniStockBadgeText, { color: stockText }]}>{prd.quantity} Left</Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    } else {
                      return (
                        <TouchableOpacity 
                          key={prd.id} 
                          style={[
                            styles.listCard, 
                            { backgroundColor: ds.cardBg, borderColor: isInspected ? ds.accentColor : ds.borderColor }
                          ]}
                          onPress={() => setInspectedProduct(prd)}
                          id={`product_list_row_${prd.id}`}
                        >
                          <Image source={{ uri: prd.imageUrl }} style={styles.listCardImage} />
                          <View style={styles.listCardMeta}>
                            <Text style={[styles.listCardName, { color: ds.textColor }]} numberOfLines={1}>{prd.name}</Text>
                            <Text style={[styles.listCardSku, { color: ds.textMuted }]}>SKU: {prd.sku} • Brand: {prd.brand}</Text>
                          </View>
                          <View style={styles.listCardStocks}>
                            <Text style={[styles.listCardQty, { color: ds.textColor }]}>${prd.sellingPrice.toFixed(2)}</Text>
                            <Text style={[styles.listCardStatus, { color: stockText, fontWeight: "bold" }]}>
                              {isLowStock ? `LOW (${prd.quantity})` : `STABLE (${prd.quantity})`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }
                  })}
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Right Side: Detailed stock inspector panel */}
        <View style={[styles.rightPane, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
          {inspectedProduct ? (
            <ScrollView style={styles.inspectScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.inspectTitleRow}>
                <Text style={[styles.inspectSerialId, { color: ds.textMuted }]}>ITEM FILE: {inspectedProduct.id}</Text>
                <View style={[styles.inspectPillBadge, { backgroundColor: inspectedProduct.quantity <= inspectedProduct.reorderLevel ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)" }]}>
                  <Text style={[styles.inspectPillBadgeText, { color: inspectedProduct.quantity <= inspectedProduct.reorderLevel ? "#EF4444" : ds.successColor }]}>
                    {inspectedProduct.quantity <= inspectedProduct.reorderLevel ? "UNDER PROTECTION LIMIT" : "STABLE IN-BOUND"}
                  </Text>
                </View>
              </View>

              <Image source={{ uri: inspectedProduct.imageUrl }} style={styles.inspectMainImg} />

              <View style={styles.inspectHeaderInfo}>
                <Text style={[styles.inspectHeaderBrand, { color: ds.accentColor }]}>{inspectedProduct.brand.toUpperCase()}</Text>
                <Text style={[styles.inspectHeaderName, { color: ds.textColor }]}>{inspectedProduct.name}</Text>
                <Text style={[styles.inspectHeaderCat, { color: ds.textMuted }]}>Department: {inspectedProduct.category}</Text>
              </View>

              {/* Real-time stock adjusting console */}
              <View style={[styles.reactiveStockConsole, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
                <View style={styles.reactiveStockHeader}>
                  <Text style={[styles.reactiveStockTitle, { color: ds.textColor }]}>Physical Floor Reserve</Text>
                  <Text style={[styles.reactiveStockCount, { color: inspectedProduct.quantity <= inspectedProduct.reorderLevel ? "#EF4444" : ds.successColor }]}>
                    {inspectedProduct.quantity} units
                  </Text>
                </View>

                {inspectedProduct.quantity <= inspectedProduct.reorderLevel && (
                  <View style={styles.recommendationBanner}>
                    <Text style={styles.recommendationText}>
                      ⚠️ Restock Alert: Minimum safety ceiling is {inspectedProduct.reorderLevel}. Purchase lot immediately!
                    </Text>
                  </View>
                )}

                <View style={styles.adjustIncrementalBtnRow}>
                  <TouchableOpacity 
                    style={[styles.incrementBtn, { borderColor: ds.borderColor }]}
                    onPress={() => onUpdateQty(inspectedProduct.id, Math.max(0, inspectedProduct.quantity - 10))}
                    id="btn_decrement_qty_10"
                  >
                    <Text style={[styles.incrementText, { color: ds.textColor }]}>-10 Out</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.incrementBtn, { borderColor: ds.borderColor }]}
                    onPress={() => onUpdateQty(inspectedProduct.id, Math.max(0, inspectedProduct.quantity - 1))}
                    id="btn_decrement_qty_1"
                  >
                    <Text style={[styles.incrementText, { color: ds.textColor }]}>-1 Out</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.incrementBtn, { borderColor: ds.borderColor }]}
                    onPress={() => onUpdateQty(inspectedProduct.id, inspectedProduct.quantity + 1)}
                    id="btn_increment_qty_1"
                  >
                    <Text style={[styles.incrementText, { color: ds.textColor }]}>+1 In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.incrementBtn, { borderColor: ds.borderColor }]}
                    onPress={() => onUpdateQty(inspectedProduct.id, inspectedProduct.quantity + 50)}
                    id="btn_increment_qty_50"
                  >
                    <Text style={[styles.incrementText, { color: ds.textColor }]}>+50 Lot</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.financialSpecsGrid}>
                <View style={[styles.specMiniCard, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
                  <Text style={[styles.specMiniLabel, { color: ds.textMuted }]}>Acquisition Price</Text>
                  <Text style={[styles.specMiniVal, { color: ds.textColor }]}>${inspectedProduct.costPrice.toFixed(2)}</Text>
                </View>
                <View style={[styles.specMiniCard, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
                  <Text style={[styles.specMiniLabel, { color: ds.textMuted }]}>Selling Retail</Text>
                  <Text style={[styles.specMiniVal, { color: ds.textColor }]}>${inspectedProduct.sellingPrice.toFixed(2)}</Text>
                </View>
              </View>

              {/* Profit margin spread */}
              <View style={[styles.profitMarginMeterCard, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
                <Text style={[styles.profitMarginTitle, { color: ds.textColor }]}>Gross Margin Percentage</Text>
                <Text style={[styles.profitMarginSpread, { color: ds.successColor }]}>
                  {(((inspectedProduct.sellingPrice - inspectedProduct.costPrice) / inspectedProduct.sellingPrice) * 100).toFixed(1)}% yield spread
                </Text>
              </View>

              <View style={[styles.metaSpecificationsBlock, { borderTopColor: ds.borderColor }]}>
                <View style={styles.specLineItem}>
                  <Text style={[styles.specLabel, { color: ds.textMuted }]}>SKU Code ID</Text>
                  <Text style={[styles.specValue, { color: ds.textColor }]}>{inspectedProduct.sku}</Text>
                </View>
                <View style={styles.specLineItem}>
                  <Text style={[styles.specLabel, { color: ds.textMuted }]}>Universal Barcode</Text>
                  <Text style={[styles.specValue, { color: ds.textColor }]}>{inspectedProduct.barcode}</Text>
                </View>
                <View style={styles.specLineItem}>
                  <Text style={[styles.specLabel, { color: ds.textMuted }]}>Lot identifier</Text>
                  <Text style={[styles.specValue, { color: ds.textColor }]}>{inspectedProduct.batchNumber || "B-DEC-2024"}</Text>
                </View>
                <View style={styles.specLineItem}>
                  <Text style={[styles.specLabel, { color: ds.textMuted }]}>Lot Expiration</Text>
                  <Text style={[styles.specValue, { color: ds.textColor }]}>{inspectedProduct.expiryDate || "2026-12-31"}</Text>
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptySpecState}>
              <Package size={32} color={ds.textMuted} style={{ marginBottom: 10 }} />
              <Text style={[styles.emptySpecText, { color: ds.textMuted }]}>
                Select any product card inside the catalog grid to audit active lot details and execute reserve modifications.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  headerHub: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  searchContainer: {
    flex: 1,
    minWidth: 300,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 12,
    marginLeft: 6,
    outlineStyle: "none" as any,
  },
  clearIcon: {
    fontSize: 12,
    paddingHorizontal: 6,
  },
  rightHeaderControls: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  toggleContainer: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  primaryActionBtn: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryActionText: {
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "900",
  },
  categoryPillsScroller: {
    height: 34,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 99,
    borderWidth: 1,
    height: 30,
  },
  categoryPillText: {
    fontSize: 10,
  },
  layoutBody: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
  },
  leftPane: {
    flex: 2,
  },
  rightPane: {
    flex: 1.1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  formCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    flex: 1,
  },
  formSectionHeader: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
  },
  formCaption: {
    fontSize: 10,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 6,
  },
  textInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 11,
    outlineStyle: "none" as any,
  },
  formGroupGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  gridHalf: {
    flex: 1,
  },
  skuBarcodeGenBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  generatorCodeOutput: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "bold",
    marginTop: 1,
  },
  miniGenerateBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  miniGenerateBtnText: {
    color: "#0F172A",
    fontSize: 10,
    fontWeight: "bold",
  },
  formActionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  discardBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  discardBtnText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  submitFormBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  submitFormText: {
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "900",
  },
  catalogScrollArea: {
    flex: 1,
  },
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  listContent: {
    gap: 10,
  },
  gridCard: {
    width: "48%",
    minWidth: 140,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  gridCardImage: {
    width: "100%",
    height: 90,
    resizeMode: "cover",
  },
  gridCardDetails: {
    padding: 10,
  },
  gridCardName: {
    fontSize: 11,
    fontWeight: "900",
  },
  gridCardSku: {
    fontSize: 9,
    marginTop: 1,
  },
  gridCardPricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  gridCardPrice: {
    fontSize: 11,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  miniStockBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  miniStockBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    fontFamily: "monospace",
  },
  listCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
  },
  listCardImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  listCardMeta: {
    flex: 1,
  },
  listCardName: {
    fontSize: 12,
    fontWeight: "900",
  },
  listCardSku: {
    fontSize: 9,
    marginTop: 2,
  },
  listCardStocks: {
    alignItems: "flex-end",
  },
  listCardQty: {
    fontSize: 11,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  listCardStatus: {
    fontSize: 8,
    marginTop: 2,
  },
  inspectScroll: {
    flex: 1,
  },
  inspectTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inspectPillBadge: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  inspectPillBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  inspectSerialId: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  inspectMainImg: {
    width: "100%",
    height: 155,
    borderRadius: 12,
    marginBottom: 14,
    resizeMode: "cover",
  },
  inspectHeaderInfo: {
    marginBottom: 14,
  },
  inspectHeaderBrand: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  inspectHeaderName: {
    fontSize: 15,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
    marginTop: 3,
  },
  inspectHeaderCat: {
    fontSize: 10,
    marginTop: 2,
  },
  reactiveStockConsole: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  reactiveStockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reactiveStockTitle: {
    fontSize: 11,
    fontWeight: "700",
  },
  reactiveStockCount: {
    fontSize: 13,
    fontWeight: "900",
    fontFamily: "monospace",
  },
  recommendationBanner: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  recommendationText: {
    color: "#D97706",
    fontSize: 8,
    fontWeight: "800",
  },
  adjustIncrementalBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 10,
  },
  incrementBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  incrementText: {
    fontSize: 9,
    fontWeight: "900",
  },
  financialSpecsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  specMiniCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  specMiniLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  specMiniVal: {
    fontSize: 12,
    fontWeight: "900",
    fontFamily: "monospace",
    marginTop: 2,
  },
  profitMarginMeterCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 14,
  },
  profitMarginTitle: {
    fontSize: 8,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  profitMarginSpread: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
    fontFamily: "monospace",
  },
  metaSpecificationsBlock: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 7,
  },
  specLineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  specLabel: {
    fontSize: 9,
    fontWeight: "600",
  },
  specValue: {
    fontSize: 9,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  emptySpecState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptySpecText: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
  emptySearchFrame: {
    alignItems: "center",
    paddingVertical: 40,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptySearchTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  emptySearchSub: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 24,
  },
  clearSearchAccentBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  clearSearchAccentBtnText: {
    color: "#0F172A",
    fontSize: 10,
    fontWeight: "bold",
  },
});

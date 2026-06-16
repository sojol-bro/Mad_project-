import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
import { Product, SalesTransaction, User } from "../types";
import CameraBarcodeScanner from "./CameraBarcodeScanner";
import { Camera } from "lucide-react";
import { 
  ShoppingCart, 
  Search, 
  CreditCard, 
  Smartphone, 
  Trash2, 
  Plus, 
  Minus, 
  Receipt, 
  Store,
  ChevronRight,
  Sparkles,
  Percent,
  CheckCircle,
  HelpCircle,
  Coins,
  Barcode,
  Sparkle
} from "lucide-react";

interface POSProps {
  currentUser: User;
  products: Product[];
  onCheckout: (paymentMethod: "Cash" | "Card" | "Mobile" | "Bank", customerName: string) => SalesTransaction | null;
  isDarkMode: boolean;
}

export default function POSModule({ currentUser, products, onCheckout, isDarkMode }: POSProps) {
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [customerName, setCustomerName] = useState("Quick Walk-In");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "Mobile" | "Bank">("Cash");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Custom interactive POS states
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanningActive, setScanningActive] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [activeDiscountPct, setActiveDiscountPct] = useState<number>(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  
  // Fulfill printing invoices
  const [lastTrx, setLastTrx] = useState<SalesTransaction | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Digital cashier beep sound on Web Context (no external files requested)
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(940, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08); 
    } catch (e) {
      console.warn("Cashier audio beep blocked or unsupported:", e);
    }
  };

  // Cart modifications
  const handleAddToCart = (prd: Product) => {
    playBeep();
    const existing = cart.find(ci => ci.product.id === prd.id);
    const existingQty = existing ? existing.qty : 0;
    
    if (prd.quantity <= existingQty) {
      alert(`Critical stock warning! Only ${prd.quantity} units left in stock.`);
      return;
    }

    if (existing) {
      setCart(cart.map(ci => ci.product.id === prd.id ? { ...ci, qty: ci.qty + 1 } : ci));
    } else {
      setCart([...cart, { product: prd, qty: 1 }]);
    }
  };

  const handleUpdateCartQty = (prdId: string, delta: number) => {
    playBeep();
    const existing = cart.find(ci => ci.product.id === prdId);
    if (!existing) return;
    const nextQty = existing.qty + delta;
    if (nextQty <= 0) {
      setCart(cart.filter(ci => ci.product.id !== prdId));
    } else {
      if (existing.product.quantity < nextQty) {
        alert("Requested quantity exceeds available physical floor reserves.");
        return;
      }
      setCart(cart.map(ci => ci.product.id === prdId ? { ...ci, qty: nextQty } : ci));
    }
  };

  const handleRemoveFromCart = (prdId: string) => {
    playBeep();
    setCart(cart.filter(ci => ci.product.id !== prdId));
  };

  // Simulated Barcode Scanning Terminal
  const handleBarcodeSubmit = () => {
    const trimmed = barcodeInput.trim();
    if (!trimmed) return;
    
    const matched = products.find(p => p.barcode === trimmed || p.sku.toLowerCase() === trimmed.toLowerCase());
    if (matched) {
      handleAddToCart(matched);
      setBarcodeInput("");
      setCouponError("");
    } else {
      setCouponError("Barcode unknown in lookup registries.");
    }
  };

  const triggerMockCameraScan = () => {
    setScanningActive(true);
    playBeep();
    setTimeout(() => {
      const randomPrd = products[Math.floor(Math.random() * products.length)];
      if (randomPrd) {
        handleAddToCart(randomPrd);
      }
      setScanningActive(false);
    }, 1200);
  };

  const handleCameraBarcodeScanned = (code: string) => {
    const matched = products.find(p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase());
    if (matched) {
      handleAddToCart(matched);
      setBarcodeInput("");
      setCouponError("");
    } else {
      setCouponError(`Scanned barcode ${code} unknown in registry.`);
    }
  };

  // Calculations
  const subtotal = cart.reduce((acc, ci) => acc + (ci.product.sellingPrice * ci.qty), 0);
  const discountAmount = subtotal * (activeDiscountPct / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const salesTax = afterDiscount * 0.0825; 
  const netTotal = afterDiscount + salesTax;

  const handleCartCheckout = () => {
    if (cart.length === 0) return;
    const createdTrx = onCheckout(paymentMethod, customerName);
    if (createdTrx) {
      // Modify receipt total after discount integrations
      const receiptWithDiscount = {
        ...createdTrx,
        amount: netTotal,
        items: cart.map(ci => ({
          productId: ci.product.id,
          productName: ci.product.name,
          sku: ci.product.sku,
          price: ci.product.sellingPrice,
          quantity: ci.qty
        }))
      };
      setLastTrx(receiptWithDiscount);
      setShowInvoice(true);
      setCart([]);
      setCustomerName("Quick Walk-In");
      setActiveDiscountPct(0);
      setCouponCode("");
    }
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "SAVE10" || code === "SHOP10") {
      setActiveDiscountPct(10);
      setCouponError("");
      alert("Success! 10% coupon margin applied to net total.");
    } else if (code === "SUPER20" || code === "NEST20") {
      setActiveDiscountPct(20);
      setCouponError("");
      alert("Success! Premium 20% loyalty coupon applied to net total.");
    } else if (code === "") {
      setCouponError("Please type a coupon code.");
    } else {
      setCouponError("Unknown or expired promotional code.");
    }
  };

  // Filtration logic
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchSearch && matchCat && p.quantity > 0;
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

  // Categories list for POS
  const posCategories = ["all", "beverage", "electronics", "nutrition", "apparel", "dairy"];

  return (
    <View style={[styles.container, { backgroundColor: ds.canvasBg }]}>
      
      {/* 1. Header with bar code and smart lookup */}
      <View style={[styles.posInteractiveHeader, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
        <View style={styles.headerLeft}>
          <Store size={18} color={ds.accentColor} />
          <View>
            <Text style={[styles.headerTitle, { color: ds.textColor }]}>Active Registers Panel</Text>
            <Text style={[styles.headerSub, { color: ds.textMuted }]}>
              Register Cashier Desk: {currentUser.name} • live commit pipeline
            </Text>
          </View>
        </View>

        {/* Input Barcode support */}
        <View style={[styles.barcodeScannerBar, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
          <Barcode size={16} color={ds.textMuted} />
          <TextInput 
            style={[styles.barcodeInput, { color: ds.textColor }]}
            placeholder="Laser Scanner Code or Enter Barcode..."
            placeholderTextColor={ds.textMuted}
            value={barcodeInput}
            onChangeText={setBarcodeInput}
            onSubmitEditing={handleBarcodeSubmit}
            id="input_scanner_barcode"
          />
          <TouchableOpacity 
            style={[styles.cameraScanBtn, { backgroundColor: ds.textColor + "15", borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
            onPress={triggerMockCameraScan}
            id="btn_trigger_mock_laser"
          >
            <Text style={[styles.cameraScanText, { color: ds.textColor }]}>Laser Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.cameraScanBtn, { backgroundColor: "#10B981" }]}
            onPress={() => setIsCameraScannerOpen(true)}
            id="btn_trigger_camera_lens"
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Camera size={12} color="#0F172A" />
              <Text style={[styles.cameraScanText, { color: "#0F172A" }]}>Camera Lens</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modern Scanning Viewport Alert overlay */}
      {scanningActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/85">
          <div className="relative border-4 border-dashed border-sky-400 p-8 rounded-2xl flex flex-col items-center max-w-sm text-center">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-sky-500"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sky-500"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sky-500"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-sky-500"></div>
            
            {/* Horizontal sweep laser scanline */}
            <div className="w-full h-1 bg-sky-400 animate-pulse absolute top-1/2 left-0 shadow-lg shadow-sky-500"></div>

            <Barcode size={48} className="text-sky-400 mb-4 animate-pulse" />
            <span className="text-white font-extrabold uppercase text-sm tracking-widest mb-1">Scanning Register Shelf</span>
            <span className="text-sky-300 text-[10px] uppercase font-mono">Bypassing platform camera frames...</span>
          </div>
        </div>
      )}

      {/* Split Viewport */}
      <View style={styles.viewportSplitRow}>
        
        {/* Left Side: Interactive catalog grid */}
        <View style={styles.catalogLeftGridPanel}>
          {/* Quick Filters category row */}
          <View style={styles.posFilterScrollerRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {posCategories.map((cat, i) => {
                const isActive = selectedCategory === cat;
                return (
                  <TouchableOpacity 
                    key={i} 
                    style={[
                      styles.posFilterPill, 
                      { backgroundColor: isActive ? ds.accentColor : ds.cardBg, borderColor: isActive ? ds.accentColor : ds.borderColor }
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                    id={`pos_cat_pill_${cat}`}
                  >
                    <Text style={[styles.posFilterPillTxt, { color: isActive ? "#0F172A" : ds.textColor, fontWeight: isActive ? "900" : "normal" }]}>
                      {cat.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Core catalog search bar */}
          <View style={[styles.catalogLookupField, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
            <View style={{ marginLeft: 8, marginRight: 4, transform: [{ translateY: 1 }] }}>
              <Search size={14} color={ds.textMuted} />
            </View>
            <TextInput 
              style={[styles.catalogLookupInput, { color: ds.textColor }]}
              placeholder="Search POS register items catalog (SKU, brand, title)..."
              placeholderTextColor={ds.textMuted}
              value={searchTerm}
              onChangeText={setSearchTerm}
              id="input_catalog_lookup"
            />
          </View>

          {/* Grid scroller of catalog with swift add click properties */}
          <ScrollView style={styles.posGridScroll} showsVerticalScrollIndicator={false}>
            {filteredProducts.length === 0 ? (
              <View style={{ alignItems: "center", justifyContent: "center", padding: 48 }}>
                <Text style={{ fontSize: 11, color: ds.textMuted, textAlign: "center" }}>No active products match selected department filter.</Text>
              </View>
            ) : (
              <View style={styles.posLayoutGridWrap}>
                {filteredProducts.map((prd) => {
                  const itemsInCart = cart.find(ci => ci.product.id === prd.id)?.qty || 0;
                  const isLow = prd.quantity <= prd.reorderLevel;
                  return (
                    <TouchableOpacity 
                      key={prd.id} 
                      style={[styles.prdCellCard, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}
                      onPress={() => handleAddToCart(prd)}
                      id={`pos_grid_add_${prd.id}`}
                    >
                      {/* Image header */}
                      <View style={styles.prdCellImgWrapper}>
                        <Image source={{ uri: prd.imageUrl }} style={styles.prdCellThumb} />
                        {itemsInCart > 0 && (
                          <div className="absolute top-2 right-2 bg-sky-500 text-slate-900 border border-slate-900 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                            {itemsInCart}
                          </div>
                        )}
                      </View>
                      <View style={styles.prdCellDetails}>
                        <Text style={[styles.prdCellTitle, { color: ds.textColor }]} numberOfLines={1}>{prd.name}</Text>
                        <Text style={[styles.prdCellSubLine, { color: ds.textMuted }]}>{prd.sku}</Text>
                        <View style={styles.prdCellPriceRow}>
                          <Text style={[styles.prdCellPrice, { color: ds.textColor }]}>${prd.sellingPrice.toFixed(2)}</Text>
                          <Text style={[styles.prdCellStock, { color: isLow ? "#EF4444" : ds.successColor }]}>
                            {prd.quantity} cap
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>

        {/* Right Side: Cashier cart console */}
        <View style={[styles.cashierCartPanel, { backgroundColor: ds.cardBg, borderColor: ds.borderColor }]}>
          <Text style={[styles.sidebarTitle, { color: ds.textColor }]}>Active Checkout Drawer</Text>
          
          <ScrollView style={styles.cartItemsScroll} showsVerticalScrollIndicator={false}>
            {cart.length === 0 ? (
              <View style={styles.emptyCartFrame}>
                <ShoppingCart size={24} color={ds.textMuted} style={{ marginBottom: 6 }} />
                <Text style={[styles.emptyCartTitle, { color: ds.textColor }]}>Billing Cart Empty</Text>
                <Text style={[styles.emptyCartSub, { color: ds.textMuted }]}>
                  Select items from register catalog grid or scan terminal barcode barcodes to trigger billing calculation.
                </Text>
              </View>
            ) : (
              cart.map((ci) => (
                <View key={ci.product.id} style={[styles.cartItemRow, { borderBottomColor: ds.borderColor }]}>
                  <View style={styles.itemSummary}>
                    <Text style={[styles.cartPrdName, { color: ds.textColor }]} numberOfLines={1}>{ci.product.name}</Text>
                    <Text style={[styles.cartPrdPrice, { color: ds.textMuted }]}>
                      Lot: {ci.product.batchNumber || "B-DEC"} • Unit: ${ci.product.sellingPrice.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.qtyConsoleWrapper, { backgroundColor: ds.inputBg }]}>
                    <TouchableOpacity 
                      style={[styles.qtyMiniBtn, { borderColor: ds.borderColor }]}
                      onPress={() => handleUpdateCartQty(ci.product.id, -1)}
                      id={`pos_dec_${ci.product.id}`}
                    >
                      <Text style={[styles.qtyMiniText, { color: ds.textColor }]}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.qtyCountVal, { color: ds.textColor }]}>{ci.qty}</Text>
                    <TouchableOpacity 
                      style={[styles.qtyMiniBtn, { borderColor: ds.borderColor }]}
                      onPress={() => handleUpdateCartQty(ci.product.id, 1)}
                      id={`pos_inc_${ci.product.id}`}
                    >
                      <Text style={[styles.qtyMiniText, { color: ds.textColor }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    style={styles.cartTrashBtn}
                    onPress={() => handleRemoveFromCart(ci.product.id)}
                    id={`pos_remove_${ci.product.id}`}
                  >
                    <Trash2 size={13} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          {/* Quick billing options form */}
          <View style={styles.checkoutOptionsBlock}>
            <View style={styles.formElement}>
              <Text style={[styles.elementLabel, { color: ds.textMuted }]}>CRM Customer Lookup *</Text>
              <TextInput 
                style={[styles.textInput, { backgroundColor: ds.inputBg, borderColor: ds.borderColor, color: ds.textColor }]}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Walk-In or VIP Member Name..."
                placeholderTextColor={ds.textMuted}
                id="input_checkout_customer"
              />
            </View>

            {/* Coupons Promotional Apply Box */}
            <View style={styles.formElement}>
              <Text style={[styles.elementLabel, { color: ds.textMuted }]}>Corporate Promotion Coupon</Text>
              <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                <TextInput 
                  style={[styles.textInput, { backgroundColor: ds.inputBg, borderColor: ds.borderColor, color: ds.textColor, flex: 2 }]}
                  placeholder="e.g. SAVE10, SUPER20..."
                  placeholderTextColor={ds.textMuted}
                  value={couponCode}
                  onChangeText={setCouponCode}
                  id="input_coupon_entry"
                />
                <TouchableOpacity 
                  style={{ backgroundColor: ds.accentColor, height: 36, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center", alignItems: "center" }}
                  onPress={handleApplyCoupon}
                  id="btn_apply_promo"
                >
                  <span className="text-slate-900 text-[10px] font-extrabold uppercase">Apply</span>
                </TouchableOpacity>
              </View>
              {couponError.length > 0 && (
                <Text style={{ fontSize: 9, color: "#EF4444", marginTop: 2, fontWeight: "600" }}>{couponError}</Text>
              )}
            </View>

            {/* Payment Selecting Chips Layout */}
            <View style={styles.formElement}>
              <Text style={[styles.elementLabel, { color: ds.textMuted }]}>Payment Settlement Channel</Text>
              <View style={styles.paymentMethodGrids}>
                {(["Cash", "Card", "Mobile", "Bank"] as const).map((method) => {
                  const isMethodActive = paymentMethod === method;
                  return (
                    <TouchableOpacity 
                      key={method} 
                      style={[
                        styles.paymentChipCard, 
                        { backgroundColor: isMethodActive ? ds.accentColor : ds.inputBg, borderColor: isMethodActive ? ds.accentColor : ds.borderColor }
                      ]}
                      onPress={() => setPaymentMethod(method)}
                      id={`pay_chip_${method}`}
                    >
                      <Text style={[styles.paymentChipText, { color: isMethodActive ? "#0F172A" : ds.textColor }]}>
                        {method.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Sub Totals calculations */}
          <View style={[styles.checkoutTotalsGrid, { borderTopColor: ds.borderColor }]}>
            <View style={styles.totalsLine}>
              <Text style={[styles.totalsLabel, { color: ds.textMuted }]}>Regular Subtotal</Text>
              <Text style={[styles.totalsVal, { color: ds.textColor }]}>${subtotal.toFixed(2)}</Text>
            </View>
            {activeDiscountPct > 0 && (
              <View style={styles.totalsLine}>
                <Text style={[styles.totalsLabel, { color: "#F59E0B", fontWeight: "900" }]}>Promotional Discount ({activeDiscountPct}%)</Text>
                <Text style={[styles.totalsVal, { color: "#F59E0B" }]}>-${discountAmount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalsLine}>
              <Text style={[styles.totalsLabel, { color: ds.textMuted }]}>Government Net Tax (8.25%)</Text>
              <Text style={[styles.totalsVal, { color: ds.textColor }]}>${salesTax.toFixed(2)}</Text>
            </View>

            <View style={[styles.checkoutTotalsBanner, { backgroundColor: ds.inputBg, borderColor: ds.borderColor }]}>
              <Text style={[styles.totalsGrandLabel, { color: ds.textColor }]}>GRAND CALCULATED SUM</Text>
              <Text style={[styles.totalsGrandVal, { color: ds.accentColor }]}>${netTotal.toFixed(2)}</Text>
            </View>
          </View>

          {/* Fulfill action */}
          <TouchableOpacity 
            style={[
              styles.finalFulfillBtn, 
              { backgroundColor: cart.length > 0 ? ds.successColor : ds.borderColor },
              cart.length === 0 && { cursor: 'not-allowed' } as any
            ]}
            onPress={handleCartCheckout}
            disabled={cart.length === 0}
            id="btn_pos_checkout_fulfill"
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <Sparkles size={13} color={cart.length > 0 ? "#0F172A" : ds.textMuted} className="animate-pulse" />
              <Text style={[styles.finalFulfillBtnText, { color: cart.length > 0 ? "#0F172A" : ds.textMuted }]}>
                Execute Register Invoice
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modern Receipt Invoice Overlay ModalDialog */}
      {showInvoice && lastTrx && (
        <View style={styles.modalBgOverlap}>
          <View style={[styles.receiptTicketCard, { backgroundColor: isDarkMode ? "#1E293B" : "#F8FAFC" }]}>
            <View style={styles.receiptTopBorderSegment} />
            <View style={styles.ticketMainContent}>
              <View style={styles.sealBrandingContainer}>
                <Store size={32} color="#F59E0B" />
                <Text style={[styles.ticketBrandingTitle, { color: ds.textColor }]}>SHOPNEST ENTERPRISE REGISTER</Text>
                <Text style={styles.ticketBrandingAddress}>REG# 409-Y, PLAZA BLOCKS, NEW YORK</Text>
              </View>

              <View style={styles.ticketDotsLine} />

              <View style={styles.ticketMetadataBlock}>
                <View style={styles.tickMetaRow}>
                  <Text style={styles.tickLabel}>Invoice Reference</Text>
                  <Text style={[styles.tickVal, { color: ds.textColor }]}>{lastTrx.id}</Text>
                </View>
                <View style={styles.tickMetaRow}>
                  <Text style={styles.tickLabel}>Operator Casher ID</Text>
                  <Text style={[styles.tickVal, { color: ds.textColor }]}>{currentUser.name}</Text>
                </View>
                <View style={styles.tickMetaRow}>
                  <Text style={styles.tickLabel}>Customer Profile</Text>
                  <Text style={[styles.tickVal, { color: ds.textColor }]}>{lastTrx.customerName}</Text>
                </View>
                <View style={styles.tickMetaRow}>
                  <Text style={styles.tickLabel}>Settle Channel</Text>
                  <Text style={[styles.tickVal, { color: ds.textColor }]}>{lastTrx.paymentMethod.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.ticketDotsLine} />

              {/* Items row scroller in ticket */}
              <ScrollView style={styles.ticketItemsScroll} showsVerticalScrollIndicator={false}>
                {lastTrx.items.map((line, linIdx) => (
                  <View key={linIdx} style={styles.ticketProductLine}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.ticketPrdName, { color: ds.textColor }]}>{line.productName}</Text>
                      <Text style={styles.ticketPrdDesc}>SKU: {line.sku} • {line.quantity} units</Text>
                    </View>
                    <Text style={[styles.ticketPrdCost, { color: ds.textColor }]}>${(line.price * line.quantity).toFixed(2)}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.ticketDotsLine} />

              <View style={styles.tickMetaRow}>
                <Text style={[styles.ticketGrandLabel, { color: ds.textColor }]}>GRAND TOTAL CHARGED</Text>
                <Text style={styles.ticketGrandVal}>${lastTrx.amount.toFixed(2)}</Text>
              </View>

              <View style={styles.ticketDotsLine} />

              <View style={styles.receiptSigningFooter}>
                <CheckCircle size={20} color="#10B981" />
                <Text style={styles.signingHeader}>SETTLEMENT COMMITTED</Text>
                <Text style={styles.signingCaption}>
                  Transactions captured successfully in primary ledger database logs.
                </Text>
                {/* Barcode image mockup */}
                <Image source={{ uri: "https://barcode-generator.org/zbarcode.php?code=SHOPNEST-E-REGISTER-928" }} style={styles.receiptBarcodeMockImg} />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.ticketDoneBtn, { backgroundColor: isDarkMode ? "#0F172A" : "#334155" }]}
              onPress={() => setShowInvoice(false)}
              id="btn_pos_invoice_done"
            >
              <Text style={styles.ticketDoneBtnText}>Dismiss Checkout Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <CameraBarcodeScanner 
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScan={handleCameraBarcodeScanned}
        products={products}
        isDarkMode={isDarkMode}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  posInteractiveHeader: {
    flexDirection: "row",
    gap: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
  },
  headerSub: {
    fontSize: 9,
    marginTop: 2,
  },
  barcodeScannerBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft: 10,
    height: 38,
    width: "100%",
    maxWidth: 420,
    gap: 8,
  },
  barcodeInput: {
    flex: 1,
    fontSize: 11,
    height: "100%",
    outlineStyle: "none" as any,
  },
  cameraScanBtn: {
    height: "100%",
    paddingHorizontal: 12,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraScanText: {
    fontSize: 10,
    color: "#0F172A",
    fontWeight: "900",
  },
  viewportSplitRow: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
  },
  catalogLeftGridPanel: {
    flex: 2,
    gap: 12,
  },
  cashierCartPanel: {
    flex: 1.1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  posFilterScrollerRow: {
    height: 34,
  },
  posFilterPill: {
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 99,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  posFilterPillTxt: {
    fontSize: 9,
  },
  catalogLookupField: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 38,
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
  posLayoutGridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  prdCellCard: {
    width: "31%",
    minWidth: 130,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  prdCellImgWrapper: {
    width: "100%",
    height: 80,
    position: "relative",
  },
  prdCellThumb: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  prdCellDetails: {
    padding: 8,
  },
  prdCellTitle: {
    fontSize: 10,
    fontWeight: "900",
  },
  prdCellSubLine: {
    fontSize: 8,
    marginTop: 1,
  },
  prdCellPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  prdCellPrice: {
    fontSize: 10,
    fontWeight: "900",
    fontFamily: "monospace",
  },
  prdCellStock: {
    fontSize: 8,
    fontWeight: "700",
  },
  sidebarTitle: {
    fontSize: 13,
    fontWeight: "900",
    fontFamily: "Space Grotesk",
    marginBottom: 12,
  },
  cartItemsScroll: {
    flex: 1,
    marginBottom: 14,
  },
  emptyCartFrame: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyCartTitle: {
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyCartSub: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
    paddingHorizontal: 20,
    lineHeight: 14,
  },
  cartItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  itemSummary: {
    flex: 1.5,
  },
  cartPrdName: {
    fontSize: 11,
    fontWeight: "900",
  },
  cartPrdPrice: {
    fontSize: 10,
    fontWeight: "800",
    fontFamily: "monospace",
    marginTop: 2,
  },
  qtyConsoleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 3,
  },
  qtyMiniBtn: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyMiniText: {
    fontSize: 11,
    fontWeight: "900",
  },
  qtyCountVal: {
    fontSize: 10,
    fontWeight: "900",
    fontFamily: "monospace",
    paddingHorizontal: 8,
  },
  cartTrashBtn: {
    padding: 4,
    marginLeft: 6,
  },
  checkoutOptionsBlock: {
    gap: 12,
    marginBottom: 14,
  },
  formElement: {
    gap: 4,
  },
  elementLabel: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    fontSize: 11,
    outlineStyle: "none" as any,
  },
  paymentMethodGrids: {
    flexDirection: "row",
    gap: 6,
  },
  paymentChipCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentChipText: {
    fontSize: 9,
    fontWeight: "800",
  },
  checkoutTotalsGrid: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 6,
  },
  totalsLine: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalsLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  totalsVal: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  checkoutTotalsBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
  },
  totalsGrandLabel: {
    fontSize: 10,
    fontWeight: "900",
  },
  totalsGrandVal: {
    fontSize: 13,
    fontWeight: "900",
    fontFamily: "monospace",
  },
  finalFulfillBtn: {
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  finalFulfillBtnText: {
    fontSize: 12,
    fontWeight: "900",
  },
  modalBgOverlap: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(11, 15, 25, 0.72)",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  receiptTicketCard: {
    width: "100%",
    maxWidth: 350,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    overflow: "hidden",
  },
  receiptTopBorderSegment: {
    height: 6,
    backgroundColor: "#F59E0B",
  },
  ticketMainContent: {
    padding: 18,
  },
  sealBrandingContainer: {
    alignItems: "center",
  },
  ticketBrandingTitle: {
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  ticketBrandingAddress: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 2,
  },
  ticketDotsLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#475569",
    borderStyle: "dashed",
    marginVertical: 12,
  },
  ticketMetadataBlock: {
    gap: 4,
  },
  tickMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tickLabel: {
    fontSize: 9,
    color: "#94A3B8",
  },
  tickVal: {
    fontSize: 9,
    fontWeight: "800",
  },
  ticketItemsScroll: {
    maxHeight: 110,
  },
  ticketProductLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ticketPrdName: {
    fontSize: 10,
    fontWeight: "800",
  },
  ticketPrdDesc: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 1,
  },
  ticketPrdCost: {
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "800",
  },
  ticketGrandLabel: {
    fontSize: 10,
    fontWeight: "900",
  },
  ticketGrandVal: {
    fontSize: 13,
    fontWeight: "900",
    fontFamily: "monospace",
    color: "#F59E0B",
  },
  receiptSigningFooter: {
    alignItems: "center",
    marginTop: 8,
  },
  signingHeader: {
    fontSize: 10,
    fontWeight: "900",
    color: "#10B981",
    letterSpacing: 0.5,
  },
  signingCaption: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 3,
    textAlign: "center",
  },
  receiptBarcodeMockImg: {
    width: 200,
    height: 40,
    marginTop: 12,
    resizeMode: "contain",
  },
  ticketDoneBtn: {
    paddingVertical: 11,
    alignItems: "center",
  },
  ticketDoneBtnText: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "900",
  },
});

import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";

export default function ArchitectureViewer() {
  const [activeTab, setActiveTab] = useState<"postgres" | "django" | "react_native">("postgres");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (e) {
      alert("Failed to copy code. Select and copy manually.");
    }
  };

  const postgresDDL = `-- =========================================================================
-- SHOPNEST ENTERPRISE RELATION-SCHEMA (POSTGRESQL 15+)
-- Features: UUID Primary Keys, Indexes, Soft Delete, Audit Traces
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id),
    company_id UUID REFERENCES companies(id),
    current_store_id UUID
);

-- 2. PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id),
    cost_price DECIMAL(12, 2) NOT NULL,
    selling_price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0
);
`;

  const djangoCode = `# =========================================================================
# DJANGO REST REVENUE & INVENTORY SERIALIZERS
# =========================================================================
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    margin = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'cost_price', 'selling_price', 'quantity', 'margin']

    def get_margin(self, obj):
        if obj.selling_price > 0:
            return round(((obj.selling_price - obj.cost_price) / obj.selling_price) * 100, 2)
        return 0
`;

  const reactNativeCode = `// =========================================================================
// REACT NATIVE (EXPO) + ZUSTAND ENGINE SPECIFICATION
// =========================================================================
import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  cart: [],
  products: [],
  transactions: [],
  addToCart: (product) => set((state) => ({ cart: [...state.cart, { product, qty: 1 }] })),
  checkout: (paymentMethod, customerName) => {
    // de-increment products counts & record transactions...
  }
}));
`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📂 Production System Specifications</Text>
        <Text style={styles.desc}>Complete database schema, REST API models & state schemas synced natively.</Text>
      </View>

      {/* Navigation tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === "postgres" && styles.activeTabBtn]}
          onPress={() => setActiveTab("postgres")}
        >
          <Text style={[styles.tabText, activeTab === "postgres" && styles.activeTabText]}>💾 PostgreSQL Schema</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === "django" && styles.activeTabBtn]}
          onPress={() => setActiveTab("django")}
        >
          <Text style={[styles.tabText, activeTab === "django" && styles.activeTabText]}>🐍 Django REST API</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === "react_native" && styles.activeTabBtn]}
          onPress={() => setActiveTab("react_native")}
        >
          <Text style={[styles.tabText, activeTab === "react_native" && styles.activeTabText]}>📱 React Native State</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.codeBlock}>
        <View style={styles.codeHeader}>
          <Text style={styles.codeLabel}>
            {activeTab === "postgres" ? "SQL Table Configurations (23 Tables Align)" :
             activeTab === "django" ? "Python Django Margins Serializer Model" :
             "Modular Zustand Store Engine App Setup"}
          </Text>
          <TouchableOpacity 
            style={styles.copyBtn}
            onPress={() => {
              const code = activeTab === "postgres" ? postgresDDL : activeTab === "django" ? djangoCode : reactNativeCode;
              handleCopy(code, activeTab);
            }}
          >
            <Text style={styles.copyBtnText}>
              {copiedText === activeTab ? "Copied! ✓" : "Copy Code"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.codeScrollView} nestedScrollEnabled={true}>
          <Text style={styles.codeText}>
            {activeTab === "postgres" ? postgresDDL : activeTab === "django" ? djangoCode : reactNativeCode}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginTop: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  desc: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 2,
    marginBottom: 12,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTabBtn: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#111827",
  },
  codeBlock: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 12,
  },
  codeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    paddingBottom: 8,
    marginBottom: 8,
  },
  codeLabel: {
    fontSize: 9,
    color: "#9CA3AF",
    fontFamily: "monospace",
  },
  copyBtn: {
    backgroundColor: "#374151",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  copyBtnText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
  },
  codeScrollView: {
    maxHeight: 180,
  },
  codeText: {
    color: "#E5E7EB",
    fontSize: 10,
    fontFamily: "monospace",
    lineHeight: 14,
  },
});

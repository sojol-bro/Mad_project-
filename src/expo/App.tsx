import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShopNest (Expo placeholder)</Text>
      <Text style={styles.subtitle}>
        This repo currently runs as a React/Vite web app. Next step is to wire the existing UI
        into this Expo entry.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f9fb',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#191c1e',
  },
  subtitle: {
    fontSize: 14,
    color: '#55606a',
    textAlign: 'center',
  },
});


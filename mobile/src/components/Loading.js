import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, sp } from '../theme';

export default function Loading({ label = 'Loading…' }) {
  return (
    <View style={styles.c}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.t}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, gap: sp(3) },
  t: { color: colors.muted },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, sp } from '../theme';

export default function StatCard({ label, value, color }) {
  return (
    <View style={[styles.card, { borderLeftColor: color || colors.primary }]}>
      <Text style={[styles.value, { color: color || colors.text }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: sp(4),
    gap: sp(1),
    ...shadow,
  },
  value: { fontSize: 26, fontWeight: '800' },
  label: { color: colors.muted, fontSize: 12, fontWeight: '600' },
});

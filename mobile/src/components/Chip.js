import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, sp } from '../theme';

// A pill used for filters and single-choice selectors (status / priority / user).
export default function Chip({ label, selected, onPress, color }) {
  const activeColor = color || colors.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: activeColor, borderColor: activeColor }
          : { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.text, { color: selected ? colors.white : colors.muted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: sp(3.5),
    paddingVertical: sp(2),
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  text: { fontSize: 13, fontWeight: '600' },
});

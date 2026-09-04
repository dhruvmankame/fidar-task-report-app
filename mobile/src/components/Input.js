import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, sp } from '../theme';

export default function Input({ label, style, ...props }) {
  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.muted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: sp(1.5) },
  label: { color: colors.text, fontWeight: '600', fontSize: 13 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: sp(4),
    paddingVertical: sp(3),
    fontSize: 15,
    color: colors.text,
  },
});

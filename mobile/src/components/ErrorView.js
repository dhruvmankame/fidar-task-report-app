import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, sp } from '../theme';

export default function ErrorView({ message, onRetry }) {
  return (
    <View style={styles.c}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.t}>{message || 'Something went wrong'}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.btnT}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: sp(6), gap: sp(3) },
  icon: { fontSize: 40 },
  t: { color: colors.text, textAlign: 'center', fontSize: 15 },
  btn: { backgroundColor: colors.primary, paddingHorizontal: sp(6), paddingVertical: sp(3), borderRadius: radius.md },
  btnT: { color: colors.white, fontWeight: '600' },
});

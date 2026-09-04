import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, sp } from '../theme';

// Small coloured label, e.g. a status or priority tag.
export default function Badge({ label, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: sp(2.5),
    paddingVertical: sp(1),
    borderRadius: radius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700' },
});

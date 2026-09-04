import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { ReportAPI } from '../api/services';
import { getServerUrl } from '../api/client';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import { colors, radius, shadow, sp } from '../theme';
import { MONTHS } from '../utils/date';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const now = new Date();

  const load = useCallback(async () => {
    try {
      setError('');
      const r = await ReportAPI.monthly(now.getFullYear(), now.getMonth() + 1);
      setReport(r);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>

      <Text style={styles.section}>This month ({MONTHS[now.getMonth()]} {now.getFullYear()})</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.grid}>
        <StatCard label="Tasks created" value={report ? report.created : '—'} color={colors.primary} />
        <StatCard label="Completed" value={report ? report.completed : '—'} color={colors.success} />
      </View>

      <Text style={styles.serverLabel}>Connected to</Text>
      <Text style={styles.server}>{getServerUrl()}</Text>

      <Button title="Log out" variant="outline" onPress={logout} style={{ marginTop: sp(6) }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: sp(4), paddingBottom: sp(12) },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: sp(6), alignItems: 'center', gap: sp(2), ...shadow },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 26, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  email: { color: colors.muted },
  roleBadge: { backgroundColor: colors.bg, paddingHorizontal: sp(3), paddingVertical: sp(1), borderRadius: radius.pill, marginTop: sp(1) },
  roleText: { color: colors.primary, fontWeight: '700', textTransform: 'capitalize' },
  section: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: sp(6), marginBottom: sp(3) },
  grid: { flexDirection: 'row', gap: sp(3) },
  error: { color: colors.danger, marginBottom: sp(2) },
  serverLabel: { color: colors.muted, fontSize: 12, marginTop: sp(6) },
  server: { color: colors.text, fontWeight: '600' },
});

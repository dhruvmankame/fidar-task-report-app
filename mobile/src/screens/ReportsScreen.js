import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ReportAPI } from '../api/services';
import Loading from '../components/Loading';
import ErrorView from '../components/ErrorView';
import { colors, radius, shadow, sp } from '../theme';
import { MONTHS } from '../utils/date';

// Manager-only monthly report of every employee's work.
export default function ReportsScreen() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const r = await ReportAPI.employees(year, month);
      setData(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year, month]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const prevMonth = () => setMonth((m) => (m === 1 ? 12 : m - 1));
  const nextMonth = () => setMonth((m) => (m === 12 ? 1 : m + 1));

  if (loading) return <Loading />;
  if (error && !data) return <ErrorView message={error} onRetry={load} />;

  const employees = data?.employees || [];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Month switcher */}
      <View style={styles.monthBar}>
        <TouchableOpacity onPress={prevMonth} style={styles.arrow}><Text style={styles.arrowT}>‹</Text></TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[month - 1]} {year}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.arrow}><Text style={styles.arrowT}>›</Text></TouchableOpacity>
      </View>

      <Text style={styles.caption}>Per-employee work report for the selected month.</Text>

      {employees.length === 0 ? (
        <Text style={styles.empty}>No employees found.</Text>
      ) : (
        employees.map((e) => (
          <View key={e.userId} style={styles.card}>
            <Text style={styles.name}>{e.name}</Text>
            <Text style={styles.email}>{e.email}</Text>
            <View style={styles.statsRow}>
              <Stat label="Assigned" value={e.assigned} color={colors.primary} />
              <Stat label="Completed" value={e.completed} color={colors.success} />
              <Stat label="In progress" value={e.inProgress} color={colors.warning} />
              <Stat label="Overdue" value={e.overdue} color={colors.danger} />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function Stat({ label, value, color }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: sp(4), paddingBottom: sp(12) },
  monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { paddingHorizontal: sp(4), paddingVertical: sp(1) },
  arrowT: { fontSize: 28, color: colors.primary, fontWeight: '800' },
  monthLabel: { fontSize: 18, fontWeight: '800', color: colors.text },
  caption: { color: colors.muted, textAlign: 'center', marginTop: sp(1), marginBottom: sp(4), fontSize: 12 },
  empty: { color: colors.muted, fontStyle: 'italic', textAlign: 'center', marginTop: sp(8) },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: sp(4), marginBottom: sp(3), gap: sp(1), ...shadow },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  email: { color: colors.muted, fontSize: 12, marginBottom: sp(2) },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: sp(1) },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 2 },
});

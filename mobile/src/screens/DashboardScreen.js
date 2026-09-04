import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ReportAPI, TaskAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import TaskItem from '../components/TaskItem';
import Loading from '../components/Loading';
import ErrorView from '../components/ErrorView';
import { colors, priorityColors, radius, shadow, sp, statusColors } from '../theme';
import { formatDate } from '../utils/date';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [newCount, setNewCount] = useState(0); // unseen daily updates (manager)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const calls = [ReportAPI.summary(), TaskAPI.list()];
      // Managers also pull the team's daily work-update feed.
      if (isManager) calls.push(ReportAPI.activity(10));

      const [s, tasks, activity] = await Promise.all(calls);
      setSummary(s);
      setRecent(tasks.slice(0, 4));

      if (isManager && activity) {
        const feed = activity.updates || [];
        setUpdates(feed);

        // Count how many updates are newer than the last time this manager
        // opened the dashboard — that's the "notification".
        const lastSeen = await AsyncStorage.getItem('updatesLastSeen');
        const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
        const unseen = feed.filter((u) => new Date(u.createdAt).getTime() > lastSeenTime).length;
        setNewCount(unseen);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isManager]);

  // Reload every time the tab comes into focus (so new tasks show up).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  // Mark all current updates as seen (clears the notification badge).
  const markUpdatesSeen = async () => {
    await AsyncStorage.setItem('updatesLastSeen', new Date().toISOString());
    setNewCount(0);
  };

  if (loading) return <Loading />;
  if (error && !summary) return <ErrorView message={error} onRetry={load} />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
      <Text style={styles.sub}>Here's your team's work at a glance.</Text>

      {/* Manager notification banner for new daily work updates */}
      {isManager && newCount > 0 ? (
        <TouchableOpacity style={styles.notif} activeOpacity={0.85} onPress={markUpdatesSeen}>
          <Text style={styles.notifIcon}>🔔</Text>
          <Text style={styles.notifText}>
            {newCount} new daily work update{newCount > 1 ? 's' : ''} from your team
          </Text>
          <Text style={styles.notifDismiss}>Mark read</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.grid}>
        <StatCard label="Total tasks" value={summary.total} color={colors.primary} />
        <StatCard label="Overdue" value={summary.overdue} color={colors.danger} />
      </View>

      <Text style={styles.section}>By status</Text>
      <View style={styles.grid}>
        <StatCard label="To Do" value={summary.statusCounts['To Do']} color={statusColors['To Do']} />
        <StatCard label="In Progress" value={summary.statusCounts['In Progress']} color={statusColors['In Progress']} />
        <StatCard label="Completed" value={summary.statusCounts.Completed} color={statusColors.Completed} />
      </View>

      <Text style={styles.section}>By priority</Text>
      <View style={styles.grid}>
        <StatCard label="Low" value={summary.priorityCounts.Low} color={priorityColors.Low} />
        <StatCard label="Medium" value={summary.priorityCounts.Medium} color={priorityColors.Medium} />
        <StatCard label="High" value={summary.priorityCounts.High} color={priorityColors.High} />
      </View>

      {/* Manager-only: recent daily work updates feed */}
      {isManager ? (
        <>
          <Text style={styles.section}>Recent daily updates</Text>
          {updates.length === 0 ? (
            <Text style={styles.empty}>No work updates yet.</Text>
          ) : (
            updates.map((u, i) => (
              <TouchableOpacity
                key={i}
                style={styles.update}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('TaskDetail', { id: u.taskId })}
              >
                <View style={styles.updateHead}>
                  <Text style={styles.updateAuthor}>{u.authorName}</Text>
                  <Text style={styles.updateDate}>{formatDate(u.createdAt)}</Text>
                </View>
                <Text style={styles.updateTask}>on “{u.taskTitle}”</Text>
                <Text style={styles.updateText}>{u.text}</Text>
              </TouchableOpacity>
            ))
          )}
        </>
      ) : null}

      <Text style={styles.section}>Recent tasks</Text>
      {recent.length === 0 ? (
        <Text style={styles.empty}>No tasks yet.</Text>
      ) : (
        recent.map((t) => (
          <TaskItem key={t._id} task={t} onPress={() => navigation.navigate('TaskDetail', { id: t._id })} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: sp(4), paddingBottom: sp(10) },
  greeting: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { color: colors.muted, marginBottom: sp(4) },
  section: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: sp(5), marginBottom: sp(3) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(3) },
  empty: { color: colors.muted, fontStyle: 'italic' },
  notif: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(2),
    backgroundColor: '#FEF3C7',
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: sp(3),
    marginBottom: sp(4),
  },
  notifIcon: { fontSize: 18 },
  notifText: { flex: 1, color: '#92400E', fontWeight: '700', fontSize: 13 },
  notifDismiss: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  update: { backgroundColor: colors.card, borderRadius: radius.md, padding: sp(3), marginBottom: sp(2), ...shadow },
  updateHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  updateAuthor: { fontWeight: '700', color: colors.text, fontSize: 13 },
  updateDate: { color: colors.muted, fontSize: 11 },
  updateTask: { color: colors.muted, fontSize: 12, fontStyle: 'italic', marginTop: 1 },
  updateText: { color: colors.text, marginTop: 4, fontSize: 14 },
});

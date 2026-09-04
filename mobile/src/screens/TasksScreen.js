import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TaskAPI } from '../api/services';
import TaskItem from '../components/TaskItem';
import Chip from '../components/Chip';
import Loading from '../components/Loading';
import ErrorView from '../components/ErrorView';
import { colors, PRIORITIES, radius, shadow, sp, STATUSES } from '../theme';

export default function TasksScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(null); // null = All
  const [priority, setPriority] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (priority) params.priority = priority;
      const data = await TaskAPI.list(params);
      setTasks(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, status, priority]);

  // Debounce search / filter changes.
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [load]);

  // Refresh whenever the screen regains focus (e.g. after adding a task).
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const header = (
    <View style={styles.header}>
      <TextInput
        style={styles.searchBox}
        placeholder="🔍  Search tasks by title…"
        placeholderTextColor={colors.muted}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <Chip label="All" selected={!status} onPress={() => setStatus(null)} />
        {STATUSES.map((s) => (
          <Chip key={s} label={s} selected={status === s} onPress={() => setStatus(s)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <Chip label="Any priority" selected={!priority} onPress={() => setPriority(null)} />
        {PRIORITIES.map((p) => (
          <Chip key={p} label={p} selected={priority === p} onPress={() => setPriority(p)} />
        ))}
      </ScrollView>
    </View>
  );

  if (loading) return <Loading />;
  if (error && tasks.length === 0) return <ErrorView message={error} onRetry={load} />;

  return (
    <View style={styles.screen}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskItem task={item} onPress={() => navigation.navigate('TaskDetail', { id: item._id })} />
        )}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No tasks match your filters.</Text>}
        keyboardShouldPersistTaps="handled"
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('TaskForm', {})}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: sp(4), paddingBottom: sp(24) },
  header: { gap: sp(3), marginBottom: sp(3) },
  searchBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: sp(4),
    paddingVertical: sp(3),
    fontSize: 15,
    color: colors.text,
  },
  filterRow: { flexDirection: 'row', gap: sp(2), paddingRight: sp(4) },
  empty: { color: colors.muted, textAlign: 'center', marginTop: sp(10), fontStyle: 'italic' },
  fab: {
    position: 'absolute',
    right: sp(5),
    bottom: sp(6),
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
    elevation: 6,
  },
  fabText: { color: colors.white, fontSize: 30, marginTop: -2 },
});

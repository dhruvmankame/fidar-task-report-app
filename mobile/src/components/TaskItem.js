import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Badge from './Badge';
import { colors, priorityColors, radius, shadow, sp, statusColors } from '../theme';
import { formatDate, isOverdue } from '../utils/date';

export default function TaskItem({ task, onPress }) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
        <Badge label={task.priority} color={priorityColors[task.priority]} />
      </View>

      {task.description ? (
        <Text style={styles.desc} numberOfLines={2}>{task.description}</Text>
      ) : null}

      <View style={styles.footer}>
        <Badge label={task.status} color={statusColors[task.status]} />
        <View style={styles.meta}>
          {task.assignedToName ? <Text style={styles.metaT}>👤 {task.assignedToName}</Text> : null}
          {task.dueDate ? (
            <Text style={[styles.metaT, overdue && styles.overdue]}>
              📅 {formatDate(task.dueDate)}{overdue ? ' • overdue' : ''}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: sp(4),
    marginBottom: sp(3),
    gap: sp(2),
    ...shadow,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sp(2) },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  desc: { color: colors.muted, fontSize: 13 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: sp(1) },
  meta: { alignItems: 'flex-end', gap: 2 },
  metaT: { color: colors.muted, fontSize: 12 },
  overdue: { color: colors.danger, fontWeight: '700' },
});

import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// The native date picker is a native module; load it only off-web so the app
// still runs in a browser (used for quick testing / screenshots).
const DateTimePicker = Platform.OS === 'web' ? null : require('@react-native-community/datetimepicker').default;
import { TaskAPI, UserAPI } from '../api/services';
import Input from '../components/Input';
import Button from '../components/Button';
import Chip from '../components/Chip';
import {
  colors,
  PRIORITIES,
  priorityColors,
  radius,
  sp,
  STATUSES,
  statusColors,
} from '../theme';
import { formatDate } from '../utils/date';

export default function TaskFormScreen({ navigation, route }) {
  const editing = route.params?.task;

  const [title, setTitle] = useState(editing?.title || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [status, setStatus] = useState(editing?.status || 'To Do');
  const [priority, setPriority] = useState(editing?.priority || 'Medium');
  const [dueDate, setDueDate] = useState(editing?.dueDate ? new Date(editing.dueDate) : null);
  const [assignedTo, setAssignedTo] = useState(editing?.assignedTo || null);
  const [assignedToName, setAssignedToName] = useState(editing?.assignedToName || '');
  const [users, setUsers] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit task' : 'New task' });
    UserAPI.list().then(setUsers).catch(() => {});
  }, []);

  const pickUser = (u) => {
    if (assignedTo === u._id) {
      setAssignedTo(null);
      setAssignedToName('');
    } else {
      setAssignedTo(u._id);
      setAssignedToName(u.name);
    }
  };

  const onSave = async () => {
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate ? dueDate.toISOString() : null,
      assignedTo,
      assignedToName,
    };
    try {
      setSaving(true);
      if (editing) await TaskAPI.update(editing._id, payload);
      else await TaskAPI.create(payload);
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await TaskAPI.remove(editing._id);
            navigation.goBack();
          } catch (e) {
            setError(e.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Input label="Title" value={title} onChangeText={setTitle} placeholder="What needs to be done?" />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Add more detail (optional)"
        multiline
        numberOfLines={4}
        style={{ marginTop: sp(1) }}
      />

      <Text style={styles.label}>Status</Text>
      <View style={styles.chips}>
        {STATUSES.map((s) => (
          <Chip key={s} label={s} selected={status === s} color={statusColors[s]} onPress={() => setStatus(s)} />
        ))}
      </View>

      <Text style={styles.label}>Priority</Text>
      <View style={styles.chips}>
        {PRIORITIES.map((p) => (
          <Chip key={p} label={p} selected={priority === p} color={priorityColors[p]} onPress={() => setPriority(p)} />
        ))}
      </View>

      <Text style={styles.label}>Due date</Text>
      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)} activeOpacity={0.8}>
          <Text style={styles.dateText}>📅 {dueDate ? formatDate(dueDate) : 'Set a due date'}</Text>
        </TouchableOpacity>
        {dueDate ? (
          <TouchableOpacity onPress={() => setDueDate(null)}>
            <Text style={styles.clear}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {showPicker && DateTimePicker ? (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="default"
          // New (non-deprecated) API: onValueChange fires on selection,
          // onDismiss fires when the picker is cancelled.
          onValueChange={(event, selected) => {
            setShowPicker(false);
            if (selected) setDueDate(selected);
          }}
          onDismiss={() => setShowPicker(false)}
        />
      ) : null}

      <Text style={styles.label}>Assign to</Text>
      <View style={styles.chips}>
        {users.length === 0 ? <Text style={styles.muted}>No users found.</Text> : null}
        {users.map((u) => (
          <Chip key={u._id} label={u.name} selected={assignedTo === u._id} onPress={() => pickUser(u)} />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title={editing ? 'Save changes' : 'Create task'} onPress={onSave} loading={saving} style={{ marginTop: sp(4) }} />
      {editing ? <Button title="Delete task" variant="danger" onPress={onDelete} style={{ marginTop: sp(2) }} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: sp(4), gap: sp(2), paddingBottom: sp(12) },
  label: { color: colors.text, fontWeight: '700', fontSize: 13, marginTop: sp(4) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(2) },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: sp(4) },
  dateBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: sp(4),
    paddingVertical: sp(3),
  },
  dateText: { color: colors.text, fontSize: 15 },
  clear: { color: colors.danger, fontWeight: '600' },
  muted: { color: colors.muted, fontStyle: 'italic' },
  error: { color: colors.danger, fontSize: 13, marginTop: sp(2) },
});

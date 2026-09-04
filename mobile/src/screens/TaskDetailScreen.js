import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TaskAPI } from '../api/services';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Chip from '../components/Chip';
import Loading from '../components/Loading';
import ErrorView from '../components/ErrorView';
import {
  colors,
  priorityColors,
  radius,
  shadow,
  sp,
  STATUSES,
  statusColors,
} from '../theme';
import { formatDate, isOverdue } from '../utils/date';

// Loaded lazily & guarded so the app still runs if the package isn't installed
// yet, and so the web bundle doesn't break.
let ImagePicker = null;
if (Platform.OS !== 'web') {
  try {
    ImagePicker = require('expo-image-picker');
  } catch (e) {
    ImagePicker = null; // package not installed yet — the button will explain.
  }
}

export default function TaskDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const t = await TaskAPI.get(id);
      setTask(t);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Put an "Edit" action in the header once the task is loaded.
  useEffect(() => {
    if (!task) return;
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('TaskForm', { task })}>
          <Text style={styles.headerBtn}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [task, navigation]);

  const changeStatus = async (s) => {
    try {
      const t = await TaskAPI.update(id, { status: s });
      setTask(t);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      setPosting(true);
      const t = await TaskAPI.addComment(id, comment.trim(), isUpdate);
      setTask(t);
      setComment('');
      setIsUpdate(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setPosting(false);
    }
  };

  const addAttachment = async () => {
    if (!ImagePicker) {
      Alert.alert(
        'Not available',
        'Image picker is only available on the phone app (Expo Go / APK).'
      );
      return;
    }
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Please allow photo access to attach an image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5,
        base64: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const mime = asset.mimeType || 'image/jpeg';
      const dataUrl = `data:${mime};base64,${asset.base64}`;

      setUploading(true);
      const t = await TaskAPI.addAttachment(id, asset.fileName || 'photo.jpg', dataUrl);
      setTask(t);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not add attachment.');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (attId) => {
    Alert.alert('Remove attachment', 'Delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const t = await TaskAPI.removeAttachment(id, attId);
            setTask(t);
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const onDelete = () => {
    Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await TaskAPI.remove(id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) return <Loading />;
  if (error && !task) return <ErrorView message={error} onRetry={load} />;
  if (!task) return null;

  const overdue = isOverdue(task.dueDate, task.status);
  const attachments = task.attachments || [];

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{task.title}</Text>
          <View style={styles.badges}>
            <Badge label={task.status} color={statusColors[task.status]} />
            <Badge label={task.priority} color={priorityColors[task.priority]} />
          </View>
          {task.description ? <Text style={styles.desc}>{task.description}</Text> : null}

          <View style={styles.metaBlock}>
            <Text style={styles.meta}>👤 Assigned to: {task.assignedToName || 'Unassigned'}</Text>
            <Text style={[styles.meta, overdue && styles.overdue]}>
              📅 Due: {formatDate(task.dueDate)}{overdue ? '  • overdue' : ''}
            </Text>
            <Text style={styles.meta}>🕒 Created: {formatDate(task.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.section}>Change status</Text>
        <View style={styles.chips}>
          {STATUSES.map((s) => (
            <Chip key={s} label={s} selected={task.status === s} color={statusColors[s]} onPress={() => changeStatus(s)} />
          ))}
        </View>

        {/* ---- Attachments ---- */}
        <Text style={styles.section}>Attachments ({attachments.length})</Text>
        {attachments.length === 0 ? (
          <Text style={styles.muted}>No attachments yet.</Text>
        ) : (
          <View style={styles.attachRow}>
            {attachments.map((a) => (
              <TouchableOpacity
                key={a._id}
                onLongPress={() => removeAttachment(a._id)}
                activeOpacity={0.85}
              >
                <Image source={{ uri: a.dataUrl }} style={styles.thumb} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Button
          title={uploading ? 'Uploading…' : '📎 Add photo'}
          variant="outline"
          onPress={addAttachment}
          loading={uploading}
          style={{ marginTop: sp(2) }}
        />
        {attachments.length > 0 ? (
          <Text style={styles.hint}>Tip: long-press an image to remove it.</Text>
        ) : null}

        {/* ---- Comments & daily updates ---- */}
        <Text style={styles.section}>Comments & updates ({task.comments?.length || 0})</Text>
        {(!task.comments || task.comments.length === 0) ? (
          <Text style={styles.muted}>No comments yet. Add the first update below.</Text>
        ) : (
          task.comments.map((c) => (
            <View key={c._id} style={styles.comment}>
              <View style={styles.commentHead}>
                <Text style={styles.commentAuthor}>{c.authorName || 'User'}</Text>
                {c.isUpdate ? <Badge label="Daily update" color={colors.accent} /> : null}
              </View>
              <Text style={styles.commentText}>{c.text}</Text>
              <Text style={styles.commentDate}>{formatDate(c.createdAt)}</Text>
            </View>
          ))
        )}

        {/* daily-update toggle */}
        <TouchableOpacity
          style={styles.toggleRow}
          activeOpacity={0.8}
          onPress={() => setIsUpdate((v) => !v)}
        >
          <View style={[styles.checkbox, isUpdate && styles.checkboxOn]}>
            {isUpdate ? <Text style={styles.checkboxTick}>✓</Text> : null}
          </View>
          <Text style={styles.toggleText}>Post as daily work update (notifies manager)</Text>
        </TouchableOpacity>

        <View style={styles.addRow}>
          <TextInput
            style={styles.commentInput}
            placeholder={isUpdate ? 'Write your daily work update…' : 'Write a comment…'}
            placeholderTextColor={colors.muted}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <Button title="Post" onPress={addComment} loading={posting} style={styles.postBtn} />
        </View>

        <Button title="Delete task" variant="danger" onPress={onDelete} style={{ marginTop: sp(6) }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: sp(4), paddingBottom: sp(12) },
  headerBtn: { color: colors.white, fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: sp(4), gap: sp(3), ...shadow },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  badges: { flexDirection: 'row', gap: sp(2) },
  desc: { color: colors.text, fontSize: 15, lineHeight: 21 },
  metaBlock: { gap: sp(1.5), marginTop: sp(1) },
  meta: { color: colors.muted, fontSize: 13 },
  overdue: { color: colors.danger, fontWeight: '700' },
  section: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: sp(6), marginBottom: sp(3) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(2) },
  muted: { color: colors.muted, fontStyle: 'italic' },
  hint: { color: colors.muted, fontSize: 11, marginTop: sp(2) },
  attachRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(2) },
  thumb: { width: 84, height: 84, borderRadius: radius.sm, backgroundColor: colors.border },
  comment: { backgroundColor: colors.card, borderRadius: radius.md, padding: sp(3), marginBottom: sp(2), ...shadow },
  commentHead: { flexDirection: 'row', alignItems: 'center', gap: sp(2) },
  commentAuthor: { fontWeight: '700', color: colors.text, fontSize: 13 },
  commentText: { color: colors.text, marginTop: 2 },
  commentDate: { color: colors.muted, fontSize: 11, marginTop: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: sp(2), marginTop: sp(4) },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkboxTick: { color: colors.white, fontWeight: '800', fontSize: 13 },
  toggleText: { color: colors.text, fontSize: 13, flex: 1 },
  addRow: { flexDirection: 'row', gap: sp(2), marginTop: sp(3), alignItems: 'flex-end' },
  commentInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: sp(3),
    paddingVertical: sp(3),
    color: colors.text,
    minHeight: 50,
  },
  postBtn: { paddingHorizontal: sp(5), height: 50 },
});

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Chip from '../components/Chip';
import { colors, sp } from '../theme';

const ROLES = ['employee', 'manager'];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onRegister = async () => {
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      await register({ name: name.trim(), email: email.trim(), password, role });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.c} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>

        <Input label="Full name" value={name} onChangeText={setName} placeholder="Dhruv Mankame" />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@company.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 6 characters"
        />

        <Text style={styles.label}>Role</Text>
        <View style={styles.chips}>
          {ROLES.map((r) => (
            <Chip key={r} label={r} selected={role === r} onPress={() => setRole(r)} />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Create account" onPress={onRegister} loading={loading} style={{ marginTop: sp(2) }} />
        <Button title="Back to login" variant="outline" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  c: { padding: sp(6), gap: sp(3) },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: sp(2) },
  label: { color: colors.text, fontWeight: '600', fontSize: 13 },
  chips: { flexDirection: 'row', gap: sp(2) },
  error: { color: colors.danger, fontSize: 13 },
});

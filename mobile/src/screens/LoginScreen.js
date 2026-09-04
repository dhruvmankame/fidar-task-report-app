import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { getServerUrl, setServerUrl } from '../api/client';
import { colors, radius, sp } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('manager@fidar.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showServer, setShowServer] = useState(false);
  const [server, setServer] = useState(getServerUrl());

  const onLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      await setServerUrl(server); // make sure axios points at the chosen backend
      await login(email.trim(), password);
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
        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>📋</Text>
        </View>
        <Text style={styles.title}>Task & Work Report</Text>
        <Text style={styles.subtitle}>Sign in to manage your team's work</Text>

        <View style={styles.form}>
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
            placeholder="••••••••"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Login" onPress={onLogin} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>
              New here? <Text style={styles.linkStrong}>Create an account</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowServer((s) => !s)} style={styles.serverToggle}>
            <Text style={styles.serverText}>⚙️  Server settings</Text>
          </TouchableOpacity>
          {showServer ? (
            <Input
              label="Backend URL"
              value={server}
              onChangeText={setServer}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://192.168.1.102:4000"
            />
          ) : null}

          <Text style={styles.hint}>Demo login: manager@fidar.com / password123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  c: { flexGrow: 1, justifyContent: 'center', padding: sp(6), gap: sp(2) },
  logoWrap: {
    alignSelf: 'center',
    width: 76,
    height: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sp(2),
  },
  logoEmoji: { fontSize: 38 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: sp(4) },
  form: { gap: sp(3) },
  error: { color: colors.danger, fontSize: 13 },
  link: { textAlign: 'center', color: colors.muted, marginTop: sp(1) },
  linkStrong: { color: colors.primary, fontWeight: '700' },
  serverToggle: { alignItems: 'center', marginTop: sp(1) },
  serverText: { color: colors.muted, fontSize: 13 },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: sp(2) },
});

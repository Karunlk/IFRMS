import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  isFirebaseConfigured,
} from '../firebase';

export default function AuthScreen({ route, navigation }) {
  const initialMode = route?.params?.mode ?? 'login';
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  const { login } = useAuth();

  const clearMessages = () => { setError(''); setInfo(''); };

  // Exchange a Firebase ID token for an app JWT via the backend.
  const exchangeFirebaseToken = async (firebaseUser, extra = {}) => {
    const idToken = await firebaseUser.getIdToken();
    const data = await fetchApi('/auth/firebase', {
      method: 'POST',
      body: JSON.stringify({ idToken, ...extra }),
    });
    await login(data.user, data.token);
  };

  const handleFirebaseSubmit = async () => {
    clearMessages();
    setLoading(true);
    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await exchangeFirebaseToken(cred.user);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name });
        await exchangeFirebaseToken(cred.user, { phone, dob });
      }
    } catch (err) {
      setError(err.message?.replace('Firebase: ', '') ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClassicSubmit = async () => {
    clearMessages();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify({ name, email: email.trim(), password, phone, dob }),
      });
      await login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isFirebaseConfigured ? handleFirebaseSubmit : handleClassicSubmit;

  const handlePasswordReset = async () => {
    clearMessages();
    if (!email.trim()) { setError('Enter your email first.'); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo('Password reset email sent. Check your inbox.');
      setShowReset(false);
    } catch (err) {
      setError(err.message?.replace('Firebase: ', '') ?? 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            {showReset ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {showReset
              ? "We'll send a password reset link to your email."
              : isLogin
              ? 'Enter your credentials to continue.'
              : 'Join MUSCLE UP and start your journey.'}
          </Text>

          {!!error && (
            <View style={styles.alertError}>
              <Text style={styles.alertText}>{error}</Text>
            </View>
          )}
          {!!info && (
            <View style={styles.alertInfo}>
              <Text style={styles.alertText}>{info}</Text>
            </View>
          )}

          {!showReset ? (
            <View style={styles.form}>
              {!isLogin && (
                <>
                  <Field label="Full Name">
                    <TextInput
                      style={styles.input}
                      placeholder="John Doe"
                      placeholderTextColor="#52525b"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </Field>
                  <Field label="Phone">
                    <TextInput
                      style={styles.input}
                      placeholder="+91 98765 43210"
                      placeholderTextColor="#52525b"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </Field>
                  <Field label="Date of Birth (YYYY-MM-DD)">
                    <TextInput
                      style={styles.input}
                      placeholder="1995-06-15"
                      placeholderTextColor="#52525b"
                      value={dob}
                      onChangeText={setDob}
                    />
                  </Field>
                </>
              )}

              <Field label="Email">
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#52525b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Field>

              <Field label="Password">
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#52525b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </Field>

              {isLogin && isFirebaseConfigured && (
                <TouchableOpacity
                  onPress={() => { clearMessages(); setShowReset(true); }}
                  style={styles.forgotWrap}
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#09090b" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setIsLogin(!isLogin); clearMessages(); }}
                style={styles.toggleLink}
              >
                <Text style={styles.toggleText}>
                  {isLogin
                    ? "Don't have an account? Register"
                    : 'Already have an account? Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Field label="Email">
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#52525b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Field>

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handlePasswordReset}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#09090b" />
                ) : (
                  <Text style={styles.submitBtnText}>Send Reset Email</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setShowReset(false); clearMessages(); }}
                style={styles.toggleLink}
              >
                <Text style={styles.toggleText}>← Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: '#a1a1aa', fontSize: 13, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 48 },
  back: { marginBottom: 24 },
  backText: { color: '#71717a', fontSize: 14, fontWeight: '600' },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: '#71717a', fontSize: 14, lineHeight: 20, marginBottom: 24 },
  alertError: {
    backgroundColor: '#450a0a',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  alertInfo: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#065f46',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  alertText: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  form: { gap: 14 },
  input: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#fff',
    fontSize: 15,
  },
  forgotWrap: { alignItems: 'flex-end', marginTop: -6 },
  forgotText: { color: '#71717a', fontSize: 12, fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#09090b', fontWeight: '800', fontSize: 16 },
  toggleLink: { alignItems: 'center', marginTop: 4 },
  toggleText: { color: '#71717a', fontSize: 13 },
});

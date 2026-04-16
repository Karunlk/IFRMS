import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    dob: user?.dob ?? '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await fetchApi('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      await updateUser(updated);
      setEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Profile</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.slice(0, 1).toUpperCase() ?? '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.name}</Text>
              <View style={styles.badgeRow}>
                <Text style={styles.roleBadge}>{user?.role?.toUpperCase()}</Text>
                {user?.specialization && (
                  <Text style={styles.specBadge}>{user.specialization}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Fields */}
          <View style={styles.card}>
            {[
              { label: 'Full Name', key: 'name', keyboard: 'default', capitalize: 'words' },
              { label: 'Email', key: 'email', keyboard: 'email-address', capitalize: 'none' },
              { label: 'Phone', key: 'phone', keyboard: 'phone-pad', capitalize: 'none' },
              { label: 'Date of Birth (YYYY-MM-DD)', key: 'dob', keyboard: 'default', capitalize: 'none' },
            ].map(({ label, key, keyboard, capitalize }) => (
              <View key={key} style={styles.field}>
                <Text style={styles.fieldLabel}>{label}</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={form[key]}
                    onChangeText={(v) => setForm({ ...form, [key]: v })}
                    keyboardType={keyboard}
                    autoCapitalize={capitalize}
                  />
                ) : (
                  <Text style={styles.fieldValue}>{user?.[key] ?? '—'}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Membership info (members only) */}
          {user?.role === 'member' && user?.membership_plan && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Membership</Text>
              {[
                { label: 'Plan', value: user.membership_plan },
                { label: 'Since', value: user.membership_date ?? '—' },
                { label: 'Expires', value: user.membership_expiry_date ?? '—' },
              ].map(({ label, value }) => (
                <View key={label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          {editing ? (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setEditing(false);
                  setForm({
                    name: user?.name ?? '',
                    email: user?.email ?? '',
                    phone: user?.phone ?? '',
                    dob: user?.dob ?? '',
                  });
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#09090b" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  logoutBtn: { backgroundColor: '#27272a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#a1a1aa', fontSize: 13, fontWeight: '600' },
  scroll: { padding: 20, paddingBottom: 48 },
  avatarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f43f5e20',
    borderWidth: 2,
    borderColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#f43f5e', fontSize: 28, fontWeight: '900' },
  userName: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  roleBadge: {
    color: '#f43f5e',
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#f43f5e20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specBadge: {
    color: '#60a5fa',
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#60a5fa20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  card: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  field: { gap: 4 },
  fieldLabel: { color: '#71717a', fontSize: 12, fontWeight: '600' },
  fieldValue: { color: '#fff', fontSize: 14 },
  input: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: { color: '#71717a', fontSize: 13 },
  infoValue: { color: '#fff', fontSize: 13, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 10 },
  editBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  editBtnText: { color: '#09090b', fontWeight: '800', fontSize: 15 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#a1a1aa', fontWeight: '700' },
  saveBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#09090b', fontWeight: '800' },
});

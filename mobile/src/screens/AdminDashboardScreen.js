import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';

const TABS = ['Overview', 'Users', 'Equipment', 'Programmes'];

export default function AdminDashboardScreen() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // User form
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'member',
    phone: '',
    dob: '',
  });

  // Equipment form
  const [showEqModal, setShowEqModal] = useState(false);
  const [eqForm, setEqForm] = useState({ name: '', status: 'Available' });

  // Programme form
  const [showProgModal, setShowProgModal] = useState(false);
  const [progForm, setProgForm] = useState({ name: '', capacity: '' });

  useEffect(() => {
    Promise.all([
      fetchApi('/users'),
      fetchApi('/equipment'),
      fetchApi('/reports'),
      fetchApi('/programmes'),
    ])
      .then(([u, e, r, p]) => {
        setUsers(u ?? []);
        setEquipment(e ?? []);
        setReports(r ?? []);
        setProgrammes(p ?? []);
      })
      .catch((err) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAddUser = async () => {
    try {
      const added = await fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify(userForm),
      });
      setUsers([...users, added]);
      setShowUserModal(false);
      setUserForm({ name: '', email: '', password: 'password123', role: 'member', phone: '', dob: '' });
      Alert.alert('Success', 'User created');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    Alert.alert('Delete User', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetchApi(`/users/${id}`, { method: 'DELETE' });
            setUsers(users.filter((u) => u.id !== id));
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleAddEquipment = async () => {
    try {
      const added = await fetchApi('/equipment', {
        method: 'POST',
        body: JSON.stringify(eqForm),
      });
      setEquipment([...equipment, added]);
      setShowEqModal(false);
      setEqForm({ name: '', status: 'Available' });
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleAddProgramme = async () => {
    try {
      const added = await fetchApi('/programmes', {
        method: 'POST',
        body: JSON.stringify(progForm),
      });
      setProgrammes([...programmes, added]);
      setShowProgModal(false);
      setProgForm({ name: '', capacity: '' });
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'Overview' && (
          <View>
            <View style={styles.statsGrid}>
              {[
                { label: 'Total Users', value: users.length },
                { label: 'Members', value: users.filter((u) => u.role === 'member').length },
                { label: 'Trainers', value: users.filter((u) => u.role === 'trainer').length },
                { label: 'Equipment', value: equipment.length },
              ].map((s, i) => (
                <View key={i} style={styles.statCard}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Recent Reports</Text>
            {reports.slice(0, 5).map((r, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitle}>{r.type ?? 'Report'}</Text>
                <Text style={styles.cardSub}>{r.details}</Text>
                <Text style={styles.cardMeta}>{r.generated_at?.slice(0, 10)}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Users' && (
          <View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowUserModal(true)}
            >
              <Text style={styles.addBtnText}>+ Add User</Text>
            </TouchableOpacity>
            {users.map((u) => (
              <View key={u.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View>
                    <Text style={styles.cardTitle}>{u.name}</Text>
                    <Text style={styles.cardSub}>{u.email}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.roleBadge}>{u.role?.toUpperCase()}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteUser(u.id)}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Equipment' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowEqModal(true)}>
              <Text style={styles.addBtnText}>+ Add Equipment</Text>
            </TouchableOpacity>
            {equipment.map((e) => (
              <View key={e.id} style={styles.card}>
                <Text style={styles.cardTitle}>{e.name}</Text>
                <Text
                  style={[
                    styles.statusBadge,
                    e.status === 'Available' ? styles.statusGreen : styles.statusRed,
                  ]}
                >
                  {e.status}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Programmes' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowProgModal(true)}>
              <Text style={styles.addBtnText}>+ Add Programme</Text>
            </TouchableOpacity>
            {programmes.map((p) => (
              <View key={p.id} style={styles.card}>
                <Text style={styles.cardTitle}>{p.name}</Text>
                <Text style={styles.cardSub}>Capacity: {p.capacity}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add User Modal */}
      <Modal visible={showUserModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add User</Text>
            {[
              { label: 'Name', key: 'name', placeholder: 'Full Name' },
              { label: 'Email', key: 'email', placeholder: 'user@example.com', keyboard: 'email-address' },
              { label: 'Password', key: 'password', placeholder: '••••••••', secure: true },
              { label: 'Role', key: 'role', placeholder: 'member / trainer / admin' },
              { label: 'Phone', key: 'phone', placeholder: '+91...' },
              { label: 'DOB (YYYY-MM-DD)', key: 'dob', placeholder: '1990-01-15' },
            ].map(({ label, key, placeholder, keyboard, secure }) => (
              <View key={key}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor="#52525b"
                  value={userForm[key]}
                  onChangeText={(v) => setUserForm({ ...userForm, [key]: v })}
                  keyboardType={keyboard ?? 'default'}
                  secureTextEntry={secure ?? false}
                  autoCapitalize="none"
                />
              </View>
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowUserModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddUser}>
                <Text style={styles.confirmBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Equipment Modal */}
      <Modal visible={showEqModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Equipment</Text>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Treadmill"
              placeholderTextColor="#52525b"
              value={eqForm.name}
              onChangeText={(v) => setEqForm({ ...eqForm, name: v })}
            />
            <Text style={styles.fieldLabel}>Status</Text>
            <TextInput
              style={styles.input}
              placeholder="Available / Maintenance"
              placeholderTextColor="#52525b"
              value={eqForm.status}
              onChangeText={(v) => setEqForm({ ...eqForm, status: v })}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEqModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddEquipment}>
                <Text style={styles.confirmBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Programme Modal */}
      <Modal visible={showProgModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Programme</Text>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Strength & Conditioning"
              placeholderTextColor="#52525b"
              value={progForm.name}
              onChangeText={(v) => setProgForm({ ...progForm, name: v })}
            />
            <Text style={styles.fieldLabel}>Capacity</Text>
            <TextInput
              style={styles.input}
              placeholder="20"
              placeholderTextColor="#52525b"
              value={progForm.capacity}
              onChangeText={(v) => setProgForm({ ...progForm, capacity: v })}
              keyboardType="numeric"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowProgModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddProgramme}>
                <Text style={styles.confirmBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  center: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  logoutBtn: { backgroundColor: '#27272a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#a1a1aa', fontSize: 13, fontWeight: '600' },
  tabBar: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  tabActive: { backgroundColor: '#f43f5e20' },
  tabText: { color: '#71717a', fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: '#f43f5e' },
  scroll: { padding: 20, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  statLabel: { color: '#71717a', fontSize: 12, fontWeight: '600', marginTop: 4 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  addBtn: {
    backgroundColor: '#f43f5e',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  card: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 4,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cardSub: { color: '#a1a1aa', fontSize: 13 },
  cardMeta: { color: '#52525b', fontSize: 12 },
  roleBadge: {
    color: '#a1a1aa',
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#27272a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deleteBtn: {
    backgroundColor: '#ef444420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  statusBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusGreen: { backgroundColor: '#10b98120', color: '#10b981' },
  statusRed: { backgroundColor: '#ef444420', color: '#ef4444' },
  overlay: { flex: 1, backgroundColor: '#000000cc', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 10,
    maxHeight: '85%',
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  fieldLabel: { color: '#a1a1aa', fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#fff',
    fontSize: 14,
  },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#a1a1aa', fontWeight: '700' },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#09090b', fontWeight: '800' },
});

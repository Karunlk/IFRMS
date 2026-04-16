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

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [counterparts, setCounterparts] = useState([]); // trainers for member, members for trainer/admin
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const blankForm = { date: '', time: '', member_id: '', trainer_id: '' };
  const [form, setForm] = useState(blankForm);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessData, usersData] = await Promise.all([
        fetchApi('/schedule'),
        fetchApi('/users'),
      ]);
      setSessions(sessData ?? []);
      const filtered =
        user.role === 'member'
          ? (usersData ?? []).filter((u) => u.role === 'trainer')
          : (usersData ?? []).filter((u) => u.role === 'member');
      setCounterparts(filtered);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const payload = {
      date: form.date,
      time: form.time,
      trainer_id: user.role === 'trainer' ? user.id : form.trainer_id,
      member_id: user.role === 'member' ? user.id : form.member_id,
    };
    if (!payload.date) { Alert.alert('Error', 'Date is required'); return; }
    try {
      const added = await fetchApi('/schedule', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSessions([...sessions, added]);
      setShowModal(false);
      setForm(blankForm);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleForm.date) { Alert.alert('Error', 'Date is required'); return; }
    try {
      const updated = await fetchApi(`/schedule/${rescheduleTarget.id}`, {
        method: 'PUT',
        body: JSON.stringify(rescheduleForm),
      });
      setSessions(sessions.map((s) => (s.id === updated.id ? updated : s)));
      setShowRescheduleModal(false);
      setRescheduleTarget(null);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Session', 'Cancel this session?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetchApi(`/schedule/${id}`, { method: 'DELETE' });
            setSessions(sessions.filter((s) => s.id !== id));
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = [...sessions]
    .filter((s) => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));
  const past = [...sessions]
    .filter((s) => s.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date));

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
        <Text style={styles.topTitle}>Schedule</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Book</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Upcoming */}
        <Text style={styles.sectionTitle}>Upcoming Sessions ({upcoming.length})</Text>
        {upcoming.length === 0 ? (
          <Text style={styles.empty}>No upcoming sessions.</Text>
        ) : (
          upcoming.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              userRole={user.role}
              onReschedule={() => {
                setRescheduleTarget(s);
                setRescheduleForm({ date: s.date, time: s.time ?? '' });
                setShowRescheduleModal(true);
              }}
              onDelete={() => handleDelete(s.id)}
            />
          ))
        )}

        {/* Past */}
        {past.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
              Past Sessions ({past.length})
            </Text>
            {past.slice(0, 10).map((s) => (
              <SessionCard key={s.id} session={s} userRole={user.role} past />
            ))}
          </>
        )}
      </ScrollView>

      {/* Book Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Book Session</Text>

            <Text style={styles.fieldLabel}>Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-08-15"
              placeholderTextColor="#52525b"
              value={form.date}
              onChangeText={(v) => setForm({ ...form, date: v })}
            />
            <Text style={styles.fieldLabel}>Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="09:00"
              placeholderTextColor="#52525b"
              value={form.time}
              onChangeText={(v) => setForm({ ...form, time: v })}
            />

            {user.role === 'member' && (
              <>
                <Text style={styles.fieldLabel}>Trainer ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Trainer ID"
                  placeholderTextColor="#52525b"
                  value={form.trainer_id}
                  onChangeText={(v) => setForm({ ...form, trainer_id: v })}
                  keyboardType="numeric"
                />
                {counterparts.length > 0 && (
                  <View style={styles.hintBox}>
                    {counterparts.slice(0, 5).map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={styles.hintChip}
                        onPress={() => setForm({ ...form, trainer_id: String(t.id) })}
                      >
                        <Text style={styles.hintChipText}>{t.name} ({t.id})</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {(user.role === 'trainer' || user.role === 'admin') && (
              <>
                <Text style={styles.fieldLabel}>Member ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Member ID"
                  placeholderTextColor="#52525b"
                  value={form.member_id}
                  onChangeText={(v) => setForm({ ...form, member_id: v })}
                  keyboardType="numeric"
                />
                {counterparts.length > 0 && (
                  <View style={styles.hintBox}>
                    {counterparts.slice(0, 5).map((m) => (
                      <TouchableOpacity
                        key={m.id}
                        style={styles.hintChip}
                        onPress={() => setForm({ ...form, member_id: String(m.id) })}
                      >
                        <Text style={styles.hintChipText}>{m.name} ({m.id})</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowModal(false); setForm(blankForm); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}>
                <Text style={styles.confirmBtnText}>Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reschedule Modal */}
      <Modal visible={showRescheduleModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Reschedule Session</Text>
            <Text style={styles.fieldLabel}>New Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-09-01"
              placeholderTextColor="#52525b"
              value={rescheduleForm.date}
              onChangeText={(v) => setRescheduleForm({ ...rescheduleForm, date: v })}
            />
            <Text style={styles.fieldLabel}>New Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="10:00"
              placeholderTextColor="#52525b"
              value={rescheduleForm.time}
              onChangeText={(v) => setRescheduleForm({ ...rescheduleForm, time: v })}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowRescheduleModal(false); setRescheduleTarget(null); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleReschedule}>
                <Text style={styles.confirmBtnText}>Reschedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SessionCard({ session, userRole, past, onReschedule, onDelete }) {
  return (
    <View style={[cardStyles.card, past && cardStyles.pastCard]}>
      <View style={cardStyles.row}>
        <View>
          <Text style={cardStyles.date}>📅 {session.date}</Text>
          {session.time ? <Text style={cardStyles.time}>🕐 {session.time}</Text> : null}
          {session.member ? <Text style={cardStyles.meta}>👤 {session.member}</Text> : null}
          {session.trainer ? <Text style={cardStyles.meta}>🏋️ {session.trainer}</Text> : null}
        </View>
        {!past && (
          <View style={cardStyles.actions}>
            {onReschedule && (
              <TouchableOpacity style={cardStyles.rescheduleBtn} onPress={onReschedule}>
                <Text style={cardStyles.rescheduleBtnText}>Reschedule</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={cardStyles.deleteBtn} onPress={onDelete}>
                <Text style={cardStyles.deleteBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  pastCard: { opacity: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  date: { color: '#fff', fontWeight: '700', fontSize: 14 },
  time: { color: '#a1a1aa', fontSize: 13, marginTop: 2 },
  meta: { color: '#52525b', fontSize: 12, marginTop: 2 },
  actions: { gap: 6, alignItems: 'flex-end' },
  rescheduleBtn: {
    backgroundColor: '#27272a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rescheduleBtnText: { color: '#a1a1aa', fontSize: 11, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: '#ef444420',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  deleteBtnText: { color: '#ef4444', fontSize: 11, fontWeight: '700' },
});

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
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  addBtn: { backgroundColor: '#f43f5e', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  empty: { color: '#52525b', fontSize: 13, fontStyle: 'italic', marginBottom: 8 },
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
  hintBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  hintChip: {
    backgroundColor: '#27272a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  hintChipText: { color: '#a1a1aa', fontSize: 11, fontWeight: '600' },
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

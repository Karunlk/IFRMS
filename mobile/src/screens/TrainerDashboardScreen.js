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

export default function TrainerDashboardScreen() {
  const { user, logout } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({ member_id: '', workout_description: '' });

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressForm, setProgressForm] = useState({
    member_id: '',
    weight: '',
    reps: '',
    workout_time: '',
  });

  useEffect(() => {
    Promise.all([
      fetchApi('/schedule'),
      fetchApi('/workouts'),
      fetchApi('/progress'),
      fetchApi('/users'),
    ])
      .then(([s, w, p, u]) => {
        setSchedules(s ?? []);
        setWorkouts(w ?? []);
        setProgressList(p ?? []);
        setMembers((u ?? []).filter((x) => x.role === 'member'));
      })
      .catch((err) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = schedules.filter((s) => s.date === todayStr);
  const upcomingSessions = [...schedules]
    .filter((s) => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const handleCreateWorkout = async () => {
    if (!workoutForm.member_id || !workoutForm.workout_description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      const added = await fetchApi('/workouts', {
        method: 'POST',
        body: JSON.stringify(workoutForm),
      });
      setWorkouts([added, ...workouts]);
      setShowWorkoutModal(false);
      setWorkoutForm({ member_id: '', workout_description: '' });
      Alert.alert('Success', 'Workout plan created');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleRecordProgress = async () => {
    const { member_id, weight, reps, workout_time } = progressForm;
    if (!member_id || !weight || !reps || !workout_time) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      const added = await fetchApi('/progress', {
        method: 'POST',
        body: JSON.stringify(progressForm),
      });
      setProgressList([added, ...progressList]);
      setShowProgressModal(false);
      setProgressForm({ member_id: '', weight: '', reps: '', workout_time: '' });
      Alert.alert('Success', 'Progress recorded');
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
        <Text style={styles.greeting}>Trainer Portal 🏋️</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Sessions', value: schedules.length },
            { label: 'Today', value: todaySessions.length },
            { label: 'Plans', value: workouts.length },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Today's Sessions */}
        <Section title="Today's Sessions">
          {todaySessions.length === 0 ? (
            <Text style={styles.empty}>No sessions today.</Text>
          ) : (
            todaySessions.map((s, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitle}>{s.member ?? `Member #${s.member_id}`}</Text>
                {s.time ? <Text style={styles.cardSub}>🕐 {s.time}</Text> : null}
              </View>
            ))
          )}
        </Section>

        {/* Upcoming */}
        <Section title="Upcoming Sessions">
          {upcomingSessions.length === 0 ? (
            <Text style={styles.empty}>No upcoming sessions.</Text>
          ) : (
            upcomingSessions.map((s, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitle}>{s.member ?? `Member #${s.member_id}`}</Text>
                <Text style={styles.cardSub}>
                  📅 {s.date}{s.time ? `  🕐 ${s.time}` : ''}
                </Text>
              </View>
            ))
          )}
        </Section>

        {/* Workout Plans */}
        <Section
          title="Workout Plans"
          action={{ label: '+ Create', onPress: () => setShowWorkoutModal(true) }}
        >
          {workouts.length === 0 ? (
            <Text style={styles.empty}>No workout plans created yet.</Text>
          ) : (
            workouts.slice(0, 5).map((w, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitle}>Member #{w.member_id}</Text>
                <Text style={styles.cardSub}>{w.workout_description}</Text>
                <Text style={styles.cardMeta}>{w.created_at?.slice(0, 10)}</Text>
              </View>
            ))
          )}
        </Section>

        {/* Progress Records */}
        <Section
          title="Member Progress"
          action={{ label: '+ Record', onPress: () => setShowProgressModal(true) }}
        >
          {progressList.length === 0 ? (
            <Text style={styles.empty}>No progress recorded yet.</Text>
          ) : (
            progressList.slice(0, 5).map((p, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitle}>Member #{p.member_id}</Text>
                <Text style={styles.cardSub}>
                  Weight: {p.weight} kg · Reps: {p.reps} · Time: {p.workout_time} min
                </Text>
                <Text style={styles.cardMeta}>{p.recorded_at?.slice(0, 10)}</Text>
              </View>
            ))
          )}
        </Section>
      </ScrollView>

      {/* Create Workout Modal */}
      <Modal visible={showWorkoutModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create Workout Plan</Text>
            <Text style={styles.fieldLabel}>Member ID</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              placeholderTextColor="#52525b"
              value={workoutForm.member_id}
              onChangeText={(v) => setWorkoutForm({ ...workoutForm, member_id: v })}
              keyboardType="numeric"
            />
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="3x10 Squats, 3x8 Bench Press..."
              placeholderTextColor="#52525b"
              multiline
              value={workoutForm.workout_description}
              onChangeText={(v) => setWorkoutForm({ ...workoutForm, workout_description: v })}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowWorkoutModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreateWorkout}>
                <Text style={styles.confirmBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Record Progress Modal */}
      <Modal visible={showProgressModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Record Progress</Text>
            {[
              { label: 'Member ID', key: 'member_id', keyboard: 'numeric' },
              { label: 'Weight (kg)', key: 'weight', keyboard: 'decimal-pad' },
              { label: 'Reps', key: 'reps', keyboard: 'numeric' },
              { label: 'Workout Time (min)', key: 'workout_time', keyboard: 'numeric' },
            ].map(({ label, key, keyboard }) => (
              <View key={key}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#52525b"
                  value={progressForm[key]}
                  onChangeText={(v) => setProgressForm({ ...progressForm, [key]: v })}
                  keyboardType={keyboard}
                />
              </View>
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowProgressModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleRecordProgress}>
                <Text style={styles.confirmBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Section({ title, action, children }) {
  return (
    <View style={secStyles.wrap}>
      <View style={secStyles.header}>
        <Text style={secStyles.title}>{title}</Text>
        {action && (
          <TouchableOpacity onPress={action.onPress}>
            <Text style={secStyles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

const secStyles = StyleSheet.create({
  wrap: { marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { color: '#fff', fontSize: 16, fontWeight: '800' },
  actionText: { color: '#f43f5e', fontSize: 13, fontWeight: '700' },
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
  greeting: { color: '#fff', fontSize: 18, fontWeight: '800' },
  logoutBtn: { backgroundColor: '#27272a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#a1a1aa', fontSize: 13, fontWeight: '600' },
  scroll: { padding: 20, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  statLabel: { color: '#71717a', fontSize: 10, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 4,
  },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cardSub: { color: '#a1a1aa', fontSize: 13 },
  cardMeta: { color: '#52525b', fontSize: 12 },
  empty: { color: '#52525b', fontSize: 13, fontStyle: 'italic' },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000cc',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 10,
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

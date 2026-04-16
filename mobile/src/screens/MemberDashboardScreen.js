import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';

export default function MemberDashboardScreen() {
  const { user, logout } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApi('/schedule'),
      fetchApi('/programmes'),
      fetchApi('/workouts'),
      fetchApi('/progress'),
    ])
      .then(([s, p, w, pr]) => {
        setSchedules(s ?? []);
        setProgrammes(p ?? []);
        setWorkouts(w ?? []);
        setProgress(pr ?? []);
      })
      .catch((err) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleEnrol = async (programmeId) => {
    try {
      await fetchApi('/programmes/enrol', {
        method: 'POST',
        body: JSON.stringify({ programme_id: programmeId }),
      });
      Alert.alert('Success', 'Successfully enrolled!');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const upcomingSchedules = [...schedules]
    .filter((s) => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))
    .slice(0, 3);

  const activeHours = (
    progress.reduce((acc, cur) => acc + (Number(cur.workout_time) || 0), 0) / 60
  ).toFixed(1);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0]} 👋</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Sessions', value: schedules.length },
            { label: 'Upcoming', value: upcomingSchedules.length },
            { label: 'Active Hrs', value: activeHours },
            { label: 'Workouts', value: workouts.length },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Membership */}
        {user?.membership_plan && (
          <Section title="Membership">
            <View style={styles.card}>
              <Row label="Plan">
                <Text style={styles.planBadge}>{user.membership_plan?.toUpperCase()}</Text>
              </Row>
              <Row label="Member Since">
                <Text style={styles.cardValue}>{user.membership_date ?? '—'}</Text>
              </Row>
              <Row label="Expires">
                <Text style={styles.cardValue}>{user.membership_expiry_date ?? '—'}</Text>
              </Row>
            </View>
          </Section>
        )}

        {/* Upcoming Sessions */}
        <Section title="Upcoming Sessions">
          {upcomingSchedules.length === 0 ? (
            <Text style={styles.empty}>No upcoming sessions.</Text>
          ) : (
            upcomingSchedules.map((s, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.sessionDate}>📅 {s.date}</Text>
                {s.time ? <Text style={styles.cardValue}>🕐 {s.time}</Text> : null}
                {s.trainer ? <Text style={styles.cardMeta}>🏋️ {s.trainer}</Text> : null}
              </View>
            ))
          )}
        </Section>

        {/* Available Programmes */}
        <Section title="Available Programmes">
          {programmes.length === 0 ? (
            <Text style={styles.empty}>No programmes available.</Text>
          ) : (
            programmes.map((p, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.progName}>{p.name}</Text>
                <Row label={`Capacity: ${p.capacity}`}>
                  <TouchableOpacity
                    style={styles.enrollBtn}
                    onPress={() => handleEnrol(p.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.enrollBtnText}>Enrol</Text>
                  </TouchableOpacity>
                </Row>
              </View>
            ))
          )}
        </Section>

        {/* Recent Workouts */}
        <Section title="Recent Workouts">
          {workouts.length === 0 ? (
            <Text style={styles.empty}>No workouts logged yet.</Text>
          ) : (
            workouts.slice(0, 5).map((w, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardValue}>{w.workout_description}</Text>
                <Text style={styles.cardMeta}>{w.created_at?.slice(0, 10)}</Text>
              </View>
            ))
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View style={sectionStyles.wrap}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, children }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrap: { marginBottom: 24 },
  title: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 10 },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#71717a', fontSize: 12, fontWeight: '600' },
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
  logoutBtn: {
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: { color: '#a1a1aa', fontSize: 13, fontWeight: '600' },
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
  card: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 6,
  },
  cardValue: { color: '#a1a1aa', fontSize: 13 },
  cardMeta: { color: '#52525b', fontSize: 12 },
  planBadge: {
    color: '#f43f5e',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#f43f5e20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sessionDate: { color: '#fff', fontSize: 14, fontWeight: '700' },
  progName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  enrollBtn: {
    backgroundColor: '#f43f5e',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  enrollBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  empty: { color: '#52525b', fontSize: 13, fontStyle: 'italic' },
});

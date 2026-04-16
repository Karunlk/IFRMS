import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURES = [
  {
    icon: '📅',
    title: 'Session Scheduling',
    desc: 'Book and manage workout sessions with your trainer.',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    desc: 'Log weight, reps and workout time to track improvement.',
  },
  {
    icon: '🏋️',
    title: 'Workout Plans',
    desc: 'Receive personalised workout plans from your trainer.',
  },
  {
    icon: '💳',
    title: 'Membership Plans',
    desc: 'Manage your membership directly from the app.',
  },
];

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Header */}
        <View style={styles.logoRow}>
          <Text style={styles.logoEmoji}>💪</Text>
          <Text style={styles.logoText}>MUSCLE UP</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>INTEGRATED FITNESS MANAGEMENT</Text>
          </View>

          <Text style={styles.heading}>
            Forge Your{'\n'}
            <Text style={styles.headingAccent}>Legend</Text>
          </Text>

          <Text style={styles.subheading}>
            Manage your fitness journey, schedule sessions, track progress, and
            achieve your goals — all from one powerful platform.
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Auth', { mode: 'register' })}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Get Started Free</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Auth', { mode: 'login' })}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <Text style={styles.featuresHeading}>Everything you need</Text>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  scroll: { padding: 24, paddingBottom: 48 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  logoEmoji: { fontSize: 28 },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  hero: { marginBottom: 48 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f43f5e15',
    borderWidth: 1,
    borderColor: '#f43f5e40',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
  },
  badgeText: {
    color: '#f43f5e',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  heading: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 56,
    marginBottom: 16,
  },
  headingAccent: { color: '#f43f5e' },
  subheading: {
    color: '#a1a1aa',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#09090b',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  featuresHeading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  featureIcon: { fontSize: 26 },
  featureText: { flex: 1 },
  featureTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  featureDesc: { color: '#71717a', fontSize: 12, lineHeight: 18 },
});

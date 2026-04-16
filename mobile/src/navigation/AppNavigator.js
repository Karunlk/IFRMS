import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { setUnauthorizedHandler } from '../utils/api';

import LandingScreen from '../screens/LandingScreen';
import AuthScreen from '../screens/AuthScreen';
import MemberDashboardScreen from '../screens/MemberDashboardScreen';
import TrainerDashboardScreen from '../screens/TrainerDashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScheduleScreen from '../screens/ScheduleScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_BAR_STYLE = {
  backgroundColor: '#09090b',
  borderTopColor: '#27272a',
};

const TAB_SCREEN_OPTIONS = {
  headerShown: false,
  tabBarStyle: TAB_BAR_STYLE,
  tabBarActiveTintColor: '#f43f5e',
  tabBarInactiveTintColor: '#71717a',
  tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
};

function MemberTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
      <Tab.Screen name="Dashboard" component={MemberDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} options={{ tabBarLabel: 'Schedule' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

function TrainerTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
      <Tab.Screen name="Dashboard" component={TrainerDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} options={{ tabBarLabel: 'Schedule' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#09090b' },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : (
          <>
            {user.role === 'member' && <Stack.Screen name="MemberHome" component={MemberTabs} />}
            {user.role === 'trainer' && <Stack.Screen name="TrainerHome" component={TrainerTabs} />}
            {user.role === 'admin' && <Stack.Screen name="AdminHome" component={AdminTabs} />}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#09090b',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

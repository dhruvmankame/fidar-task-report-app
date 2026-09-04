import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TasksScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

// Simple emoji tab icons (no extra icon dependency needed).
const icon = (emoji) => ({ focused }) =>
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;

export default function MainTabs() {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '800' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: icon('📊') }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ tabBarIcon: icon('✅') }} />
      {/* Employee monthly reports are a manager-only view. */}
      {isManager ? (
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{ title: 'Employee reports', tabBarIcon: icon('📈') }}
        />
      ) : null}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: icon('👤') }} />
    </Tab.Navigator>
  );
}

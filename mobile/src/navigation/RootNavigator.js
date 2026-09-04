import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabs from './MainTabs';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '800' },
};

export default function RootNavigator() {
  const { user, booting } = useAuth();

  if (booting) return <Loading label="Starting…" />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={headerOptions}>
        {!user ? (
          // ---- Not logged in ----
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
          </>
        ) : (
          // ---- Logged in ----
          <>
            <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task details' }} />
            <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: 'Task' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

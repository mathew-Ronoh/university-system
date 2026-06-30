import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { fontSize } from '../constants/layout';

import FinanceDashboard from '../screens/finance/DashboardScreen';
import StudentFeesScreen from '../screens/finance/StudentFeesScreen';
import ReportsScreen from '../screens/finance/ReportsScreen';
import SalaryScreen from '../screens/finance/SalariesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ label, focused }) {
  const icons = {
    Dashboard: '📊',
    Students: '👥',
    Reports: '📑',
    Salaries: '💰',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
        {icons[label] || '📄'}
      </Text>
    </View>
  );
}

function StudentsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.maroon[900] },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="StudentList" component={FinanceDashboard} options={{ title: 'Students' }} />
      <Stack.Screen name="StudentFees" component={StudentFeesScreen} options={{ title: 'Student Fees' }} />
    </Stack.Navigator>
  );
}

export default function FinanceNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.maroon[900] },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.maroon[900],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: { paddingBottom: 4, height: 56 },
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: '600' },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen
        name="Students"
        component={StudentsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Salaries" component={SalaryScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
  },
});

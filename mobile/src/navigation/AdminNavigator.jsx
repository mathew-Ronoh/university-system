import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { fontSize } from '../constants/layout';

import AdminDashboard from '../screens/admin/DashboardScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import CoursesScreen from '../screens/admin/CoursesScreen';
import UnitsScreen from '../screens/admin/UnitsScreen';
import SemestersScreen from '../screens/admin/SemestersScreen';
import AuditLogsScreen from '../screens/admin/AuditLogsScreen';
import EnrollmentsScreen from '../screens/admin/EnrollmentsScreen';
import SalariesScreen from '../screens/admin/SalariesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ label, focused }) {
  const icons = {
    Dashboard: '📊',
    Users: '👥',
    Courses: '📋',
    Units: '📚',
    Semesters: '📅',
    'Audit Logs': '📝',
    Enrollments: '📝',
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

const tabs = [
  { name: 'Dashboard', component: AdminDashboard },
  { name: 'Users', component: UsersScreen },
  { name: 'Courses', component: CoursesScreen },
  { name: 'Units', component: UnitsScreen },
  { name: 'Semesters', component: SemestersScreen },
  { name: 'Audit Logs', component: AuditLogsScreen },
  { name: 'Enrollments', component: EnrollmentsScreen },
  { name: 'Salaries', component: SalariesScreen },
];

export default function AdminNavigator() {
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
        tabBarScrollEnabled: true,
      })}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={
            tab.name === 'Audit Logs'
              ? { headerTitle: 'Audit Logs' }
              : undefined
          }
        />
      ))}
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

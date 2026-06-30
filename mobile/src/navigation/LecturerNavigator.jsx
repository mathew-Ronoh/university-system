import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { fontSize } from '../constants/layout';

import LecturerDashboard from '../screens/lecturer/DashboardScreen';
import LecturerProfile from '../screens/lecturer/ProfileScreen';
import CourseListScreen from '../screens/lecturer/CourseListScreen';
import CourseStudentsScreen from '../screens/lecturer/CourseStudentsScreen';
import SalaryScreen from '../screens/lecturer/SalaryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ label, focused }) {
  const icons = {
    Dashboard: '📊',
    Profile: '👤',
    Courses: '📚',
    Salary: '💰',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
        {icons[label] || '📄'}
      </Text>
    </View>
  );
}

function CoursesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.maroon[900] },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="CourseList" component={CourseListScreen} options={{ title: 'My Courses' }} />
      <Stack.Screen name="CourseStudents" component={CourseStudentsScreen} options={{ title: 'Result Entry' }} />
    </Stack.Navigator>
  );
}

export default function LecturerNavigator() {
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
      <Tab.Screen name="Dashboard" component={LecturerDashboard} />
      <Tab.Screen name="Profile" component={LecturerProfile} />
      <Tab.Screen
        name="Courses"
        component={CoursesStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Salary" component={SalaryScreen} />
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

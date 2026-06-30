import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { fontSize } from '../constants/layout';

// Student Screens
import StudentDashboard from '../screens/student/DashboardScreen';
import StudentProfile from '../screens/student/ProfileScreen';
import StudentUnits from '../screens/student/UnitsScreen';
import StudentTranscript from '../screens/student/TranscriptScreen';
import StudentFees from '../screens/student/FeesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ label, focused }) {
  const icons = {
    Dashboard: '📊',
    Profile: '👤',
    'My Units': '📚',
    Transcript: '📜',
    Fees: '💰',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
        {icons[label] || '📄'}
      </Text>
    </View>
  );
}

export default function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.maroon[900] },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.maroon[900],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={StudentDashboard} />
      <Tab.Screen name="Profile" component={StudentProfile} />
      <Tab.Screen
        name="My Units"
        component={StudentUnits}
        options={{ headerTitle: 'My Units' }}
      />
      <Tab.Screen name="Transcript" component={StudentTranscript} />
      <Tab.Screen name="Fees" component={StudentFees} />
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

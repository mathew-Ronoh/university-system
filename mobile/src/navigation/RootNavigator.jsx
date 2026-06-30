import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import Loading from '../components/Loading';

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {user ? <MainTabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}

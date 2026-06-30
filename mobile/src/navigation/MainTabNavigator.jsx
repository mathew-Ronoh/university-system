import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentNavigator from './StudentNavigator';
import LecturerNavigator from './LecturerNavigator';
import FinanceNavigator from './FinanceNavigator';
import AdminNavigator from './AdminNavigator';
import { ROLES } from '../constants/roles';

export default function MainTabNavigator() {
  const { user } = useAuth();

  switch (user?.role) {
    case ROLES.STUDENT:
      return <StudentNavigator />;
    case ROLES.LECTURER:
      return <LecturerNavigator />;
    case ROLES.FINANCE:
      return <FinanceNavigator />;
    case ROLES.ADMIN:
      return <AdminNavigator />;
    default:
      return <StudentNavigator />;
  }
}

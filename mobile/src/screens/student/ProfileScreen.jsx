import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import ListItem from '../../components/ListItem';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Loading from '../../components/Loading';
import { getStatusColor, getStatusBgColor, formatDate } from '../../utils/format';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/student/profile');
      setProfile(data.studentProfile || {});
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <Loading />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Avatar
          firstName={user?.firstName}
          lastName={user?.lastName}
          avatarUrl={user?.avatarUrl}
          size={80}
        />
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Badge label={user?.role || ''} color={colors.white} bgColor={colors.maroon[700]} size="md" />
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <ListItem label="Email" value={user?.email} />
        <ListItem label="Phone" value={user?.phone || '—'} />
        <ListItem label="Status" right={
          <Badge
            label={user?.isActive ? 'Active' : 'Inactive'}
            color={user?.isActive ? '#16a34a' : '#dc2626'}
            bgColor={user?.isActive ? '#dcfce7' : '#fee2e2'}
          />
        } />
        <ListItem label="Last Login" value={formatDate(user?.lastLogin)} />
      </Card>

      {profile && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Info</Text>
          <ListItem label="Admission No" value={profile.admissionNo} />
          {profile.course && <ListItem label="Course" value={`${profile.course.code} — ${profile.course.name}`} />}
          {profile.currentSemester && <ListItem label="Current Semester" value={profile.currentSemester.name} />}
          <ListItem label="Enrollment Date" value={formatDate(profile.enrollmentDate)} />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.maroon[900],
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
});

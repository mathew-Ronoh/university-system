import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import ListItem from '../../components/ListItem';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/format';

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
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
        <ListItem
          label="Status"
          right={
            <Badge
              label={user?.isActive ? 'Active' : 'Inactive'}
              color={user?.isActive ? '#16a34a' : '#dc2626'}
              bgColor={user?.isActive ? '#dcfce7' : '#fee2e2'}
            />
          }
        />
        <ListItem label="Last Login" value={formatDate(user?.lastLogin)} />
      </Card>
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

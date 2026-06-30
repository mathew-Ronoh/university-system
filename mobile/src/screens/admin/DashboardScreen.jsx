import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function DashboardScreen() {
  const [stats, setStats] = useState({ users: 0, courses: 0, units: 0, semesters: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [u, c, un, s] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/courses'),
        api.get('/admin/units'),
        api.get('/admin/semesters'),
      ]);
      setStats({
        users: u.data.users?.length || 0,
        courses: c.data.courses?.length || 0,
        units: un.data.units?.length || 0,
        semesters: s.data.semesters?.length || 0,
      });
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <Loading />;

  const cards = [
    { label: 'Total Users', value: stats.users, color: colors.maroon[900] },
    { label: 'Courses', value: stats.courses, color: colors.green[600] },
    { label: 'Units', value: stats.units, color: '#2563eb' },
    { label: 'Semesters', value: stats.semesters, color: colors.yellow[600] },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Admin Dashboard</Text>
      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card.label} style={styles.card}>
            <Text style={styles.cardLabel}>{card.label}</Text>
            <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
  },
});

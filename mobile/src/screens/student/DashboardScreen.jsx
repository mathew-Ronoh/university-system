import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import { formatCurrency } from '../../utils/format';

export default function StudentDashboard({ navigation }) {
  const [stats, setStats] = useState({ units: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [u, f] = await Promise.all([
        api.get('/student/current-units'),
        api.get('/student/fees/balance'),
      ]);
      setStats({
        units: u.data.units?.length || 0,
        balance: f.data.summary?.totalBalance || 0,
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>Student Dashboard</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('My Units')}
          activeOpacity={0.7}
        >
          <Text style={styles.cardLabel}>Current Units</Text>
          <Text style={styles.cardValue}>{stats.units}</Text>
          <Text style={styles.cardLink}>View →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Fees')}
          activeOpacity={0.7}
        >
          <Text style={styles.cardLabel}>Outstanding Balance</Text>
          <Text style={[styles.cardValue, { color: colors.red[600] }]}>
            {formatCurrency(stats.balance)}
          </Text>
          <Text style={styles.cardLink}>View →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.transcriptCard}
        onPress={() => navigation.navigate('Transcript')}
        activeOpacity={0.7}
      >
        <Text style={styles.transcriptLabel}>Academic Transcript</Text>
        <Text style={styles.transcriptLink}>View & Download →</Text>
      </TouchableOpacity>
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
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    flex: 1,
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
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.maroon[900],
    marginBottom: spacing.sm,
  },
  cardLink: {
    fontSize: fontSize.sm,
    color: colors.green[600],
    fontWeight: '600',
  },
  transcriptCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  transcriptLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  transcriptLink: {
    fontSize: fontSize.md,
    color: colors.green[600],
    fontWeight: '600',
  },
});

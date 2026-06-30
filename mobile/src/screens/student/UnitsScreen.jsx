import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function UnitsScreen() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/student/current-units');
      setUnits(data.units || []);
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
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={units}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<EmptyState message="No units enrolled for this semester." />}
      renderItem={({ item }) => (
        <Card style={styles.unitCard}>
          <View style={styles.unitHeader}>
            <Text style={styles.unitCode}>{item.code}</Text>
            {item.isRegistered && (
              <Badge label="Registered" color="#16a34a" bgColor="#dcfce7" />
            )}
          </View>
          <Text style={styles.unitName}>{item.name}</Text>
          <Text style={styles.unitCredits}>{item.credits} Credits</Text>
          {item.lecturer && (
            <View style={styles.lecturerRow}>
              <Text style={styles.lecturerLabel}>Lecturer: </Text>
              <Text style={styles.lecturerName}>
                {item.lecturer.firstName} {item.lecturer.lastName}
              </Text>
            </View>
          )}
        </Card>
      )}
    />
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
  unitCard: {
    marginBottom: spacing.md,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  unitCode: {
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
    color: colors.maroon[700],
    fontWeight: '600',
  },
  unitName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  unitCredits: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  lecturerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lecturerLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  lecturerName: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
    fontWeight: '600',
  },
});

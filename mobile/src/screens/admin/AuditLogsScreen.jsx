import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatDateTime } from '../../utils/format';

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/admin/audit-logs');
      setLogs(data.logs || []);
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
      data={logs}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<EmptyState message="No audit logs." />}
      renderItem={({ item }) => (
        <Card style={styles.logCard}>
          <View style={styles.logHeader}>
            <Text style={styles.logAction}>{item.action}</Text>
            <Text style={styles.logTime}>{formatDateTime(item.createdAt)}</Text>
          </View>
          {item.user && (
            <Text style={styles.logUser}>
              By: {item.user.firstName} {item.user.lastName} ({item.user.email})
            </Text>
          )}
          {(item.entityType || item.entityId) && (
            <Text style={styles.logEntity}>
              {item.entityType} #{item.entityId}
            </Text>
          )}
          {item.details && (
            <Text style={styles.logDetails}>{item.details}</Text>
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
    paddingBottom: spacing.xxxl,
  },
  logCard: {
    marginBottom: spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logAction: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.maroon[900],
    textTransform: 'uppercase',
  },
  logTime: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
  },
  logUser: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  logEntity: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
  },
  logDetails: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    backgroundColor: colors.gray[50],
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
});

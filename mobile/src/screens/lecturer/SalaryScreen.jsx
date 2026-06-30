import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatCurrency, getStatusColor, getStatusBgColor } from '../../utils/format';

export default function SalaryScreen() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/lecturer/salary');
      setSalaries(data.salaries || []);
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <Loading />;

  let totalPaid = 0;
  let totalPending = 0;
  salaries.forEach((s) => {
    if (s.status === 'paid') totalPaid += parseFloat(s.amount || 0);
    else totalPending += parseFloat(s.amount || 0);
  });

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={salaries}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderTopColor: colors.green[600] }]}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={[styles.summaryValue, { color: colors.green[600] }]}>
              {formatCurrency(totalPaid)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: colors.yellow[500] }]}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={[styles.summaryValue, { color: colors.yellow[600] }]}>
              {formatCurrency(totalPending)}
            </Text>
          </View>
        </View>
      }
      ListEmptyComponent={<EmptyState message="No salary records available." />}
      renderItem={({ item }) => (
        <Card style={styles.salaryCard}>
          <View style={styles.salaryRow}>
            <View>
              <Text style={styles.salaryMonth}>
                {item.month}/{item.year}
              </Text>
              <Text style={styles.salaryAmount}>{formatCurrency(item.amount)}</Text>
            </View>
            <Badge
              label={item.status}
              color={getStatusColor(item.status)}
              bgColor={getStatusBgColor(item.status)}
            />
          </View>
          {item.paidAt && (
            <Text style={styles.paidDate}>Paid: {new Date(item.paidAt).toLocaleDateString()}</Text>
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
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderTopWidth: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  salaryCard: {
    marginBottom: spacing.md,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salaryMonth: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  salaryAmount: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[900],
  },
  paidDate: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    marginTop: spacing.sm,
  },
});

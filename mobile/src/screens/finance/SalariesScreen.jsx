import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatCurrency, getStatusColor, getStatusBgColor } from '../../utils/format';

export default function SalariesScreen() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/finance/salaries');
      setSalaries(data.salaries || []);
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const markPaid = async (id) => {
    try {
      await api.post(`/finance/salaries/${id}/mark-paid`);
      Alert.alert('Success', 'Salary marked as paid.');
      load();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update.');
    }
  };

  if (loading) return <Loading />;

  let totalPending = 0;
  let totalPaid = 0;
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
        <>
          <Text style={styles.title}>Salary Management</Text>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { borderTopColor: colors.green[600] }]}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={[styles.summaryValue, { color: colors.green[600] }]}>
                {formatCurrency(totalPaid)}
              </Text>
            </View>
            <View style={[styles.summaryCard, { borderTopColor: colors.yellow[500] }]}>
              <Text style={styles.summaryLabel}>Total Pending</Text>
              <Text style={[styles.summaryValue, { color: colors.yellow[600] }]}>
                {formatCurrency(totalPending)}
              </Text>
            </View>
          </View>
        </>
      }
      ListEmptyComponent={<EmptyState message="No salary records." />}
      renderItem={({ item }) => (
        <Card style={styles.salaryCard}>
          <View style={styles.salaryHeader}>
            <View>
              <Text style={styles.lecturerName}>
                {item.lecturer?.firstName} {item.lecturer?.lastName}
              </Text>
              <Text style={styles.salaryPeriod}>
                {item.month}/{item.year}
              </Text>
            </View>
            <Badge
              label={item.status}
              color={getStatusColor(item.status)}
              bgColor={getStatusBgColor(item.status)}
            />
          </View>
          <View style={styles.salaryBody}>
            <Text style={styles.salaryAmount}>{formatCurrency(item.amount)}</Text>
            {item.status !== 'paid' && (
              <TouchableOpacity onPress={() => markPaid(item.id)}>
                <Badge label="Mark Paid" color="#16a34a" bgColor="#dcfce7" />
              </TouchableOpacity>
            )}
          </View>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.lg,
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
  salaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  lecturerName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[900],
  },
  salaryPeriod: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  salaryBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salaryAmount: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gray[900],
  },
});

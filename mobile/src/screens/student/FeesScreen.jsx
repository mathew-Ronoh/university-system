import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatCurrency, formatDate, getStatusColor, getStatusBgColor } from '../../utils/format';

export default function FeesScreen() {
  const [data, setData] = useState({ payments: [], receipts: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [b, p, r] = await Promise.all([
        api.get('/student/fees/balance'),
        api.get('/student/fees/payments'),
        api.get('/student/fees/receipts'),
      ]);
      setData({
        payments: p.data.payments || [],
        receipts: r.data.receipts || [],
        summary: b.data.summary || {},
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

  const summary = data.summary;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={['summary', 'payments', 'receipts']}
      keyExtractor={(item) => item}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Fee Statement</Text>
          {summary && (
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { borderTopColor: colors.maroon[900] }]}>
                <Text style={styles.summaryLabel}>Total Fees</Text>
                <Text style={styles.summaryValue}>{formatCurrency(summary.totalOwed || 0)}</Text>
              </View>
              <View style={[styles.summaryCard, { borderTopColor: colors.green[600] }]}>
                <Text style={styles.summaryLabel}>Paid</Text>
                <Text style={[styles.summaryValue, { color: colors.green[600] }]}>
                  {formatCurrency(summary.totalPaid || 0)}
                </Text>
              </View>
              <View style={[styles.summaryCard, { borderTopColor: colors.red[600] }]}>
                <Text style={styles.summaryLabel}>Balance</Text>
                <Text style={[styles.summaryValue, { color: colors.red[600] }]}>
                  {formatCurrency(summary.totalBalance || 0)}
                </Text>
              </View>
            </View>
          )}
        </>
      }
      renderItem={({ item }) => {
        if (item === 'payments') {
          return (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Payment History</Text>
              {data.payments.length === 0 ? (
                <Text style={styles.emptyText}>No payments yet.</Text>
              ) : (
                data.payments.map((p) => (
                  <View key={p.id} style={styles.paymentRow}>
                    <View style={styles.paymentLeft}>
                      <Text style={styles.paymentDate}>{formatDate(p.paymentDate)}</Text>
                      <Text style={styles.paymentMethod}>{p.method?.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.paymentAmount}>
                      {formatCurrency(p.amount)}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          );
        }
        if (item === 'receipts') {
          return (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Receipts</Text>
              {data.receipts.length === 0 ? (
                <Text style={styles.emptyText}>No receipts yet.</Text>
              ) : (
                data.receipts.map((r) => (
                  <View key={r.id} style={styles.receiptRow}>
                    <View>
                      <Text style={styles.receiptNo}>{r.receiptNo}</Text>
                      <Text style={styles.receiptDate}>{formatDate(r.generatedAt)}</Text>
                    </View>
                    <Badge label="Download" color="#16a34a" bgColor="#dcfce7" />
                  </View>
                ))
              )}
            </Card>
          );
        }
        return null;
      }}
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
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.gray[900],
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  paymentLeft: {},
  paymentDate: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
  },
  paymentMethod: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  paymentAmount: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[900],
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  receiptNo: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[700],
  },
  receiptDate: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  emptyText: {
    color: colors.gray[500],
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});

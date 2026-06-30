import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import FormField from '../../components/FormField';

export default function ReportsScreen() {
  const [studentId, setStudentId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!studentId.trim()) {
      Alert.alert('Error', 'Please enter a student ID.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/finance/reports/student/${studentId}`);
      setReport(data);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to fetch report.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Financial Report</Text>

      <Card style={styles.searchCard}>
        <FormField
          label="Student ID"
          value={studentId}
          onChangeText={setStudentId}
          placeholder="Enter student ID"
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={fetchReport}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>{loading ? 'Loading...' : 'Generate Report'}</Text>
        </TouchableOpacity>
      </Card>

      {report && (
        <>
          <Card style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Fees Owed:</Text>
              <Text style={styles.summaryValue}>{report.summary?.totalOwed || '—'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Paid:</Text>
              <Text style={[styles.summaryValue, { color: colors.green[600] }]}>
                {report.summary?.totalPaid || '—'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Balance:</Text>
              <Text style={[styles.summaryValue, { color: colors.red[600] }]}>
                {report.summary?.totalBalance || '—'}
              </Text>
            </View>
          </Card>

          {report.fees && report.fees.length > 0 && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Fee Records</Text>
              {report.fees.map((f) => (
                <View key={f.id} style={styles.detailRow}>
                  <Text>Semester: {f.semesterId} — KES {f.totalFees}</Text>
                </View>
              ))}
            </Card>
          )}

          {report.payments && report.payments.length > 0 && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Payments</Text>
              {report.payments.map((p) => (
                <View key={p.id} style={styles.detailRow}>
                  <Text>
                    {p.paymentDate} — {p.method?.toUpperCase()} — KES {p.amount}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
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
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.lg,
  },
  searchCard: {
    marginBottom: spacing.lg,
  },
  btn: {
    backgroundColor: colors.maroon[900],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  summaryLabel: {
    fontSize: fontSize.md,
    color: colors.gray[600],
  },
  summaryValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.gray[900],
  },
  section: {
    marginBottom: spacing.lg,
  },
  detailRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
});

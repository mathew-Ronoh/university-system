import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Loading from '../../components/Loading';
import FormField from '../../components/FormField';
import { formatCurrency, getStatusColor, getStatusBgColor, formatDate } from '../../utils/format';

const paymentMethods = ['cash', 'bank_transfer', 'mpesa', 'cheque', 'helb', 'other'];

export default function StudentFeesScreen({ route }) {
  const { id, studentName } = route.params;
  const [data, setData] = useState({ fees: [], payments: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [feeForm, setFeeForm] = useState({ totalFees: '', semesterId: '1', dueDate: '' });
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', paymentDate: '', transactionCode: '' });

  const load = async () => {
    try {
      const [f, p] = await Promise.all([
        api.get(`/finance/students/${id}/fees`),
        api.get(`/finance/students/${id}/payments`),
      ]);
      setData({ fees: f.data.fees || [], payments: p.data.payments || [] });
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleFeeSubmit = async () => {
    try {
      await api.put(`/finance/students/${id}/fees`, {
        totalFees: parseFloat(feeForm.totalFees),
        semesterId: parseInt(feeForm.semesterId),
        dueDate: feeForm.dueDate || undefined,
      });
      setShowFeeForm(false);
      setFeeForm({ totalFees: '', semesterId: '1', dueDate: '' });
      load();
      Alert.alert('Success', 'Fee record updated.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update fee.');
    }
  };

  const handlePaySubmit = async () => {
    try {
      const payload = {
        amount: parseFloat(payForm.amount),
        method: payForm.method,
        paymentDate: payForm.paymentDate,
        transactionCode: payForm.transactionCode || undefined,
      };
      if (editingPayment) {
        await api.put(`/finance/payments/${editingPayment}`, payload);
        setEditingPayment(null);
      } else {
        await api.post(`/finance/students/${id}/payments/manual`, payload);
      }
      setShowPayForm(false);
      setPayForm({ amount: '', method: 'cash', paymentDate: '', transactionCode: '' });
      load();
      Alert.alert('Success', 'Payment recorded.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to record payment.');
    }
  };

  const deletePayment = (paymentId) => {
    Alert.alert('Delete Payment', 'This will recalculate the fee balance. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/finance/payments/${paymentId}`);
            load();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to delete.');
          }
        },
      },
    ]);
  };

  const startEdit = (p) => {
    setEditingPayment(p.id);
    setPayForm({
      amount: String(p.amount),
      method: p.method,
      paymentDate: p.paymentDate,
      transactionCode: p.transactionCode || '',
    });
    setShowPayForm(true);
  };

  if (loading) return <Loading />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Student Fees</Text>
        <Text style={styles.subtitle}>{studentName}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.green[600] }]}
          onPress={() => {
            setShowFeeForm(!showFeeForm);
            setShowPayForm(false);
            setEditingPayment(null);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>{showFeeForm ? 'Cancel' : '+ Set Fee'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.maroon[900] }]}
          onPress={() => {
            setShowPayForm(!showPayForm);
            setShowFeeForm(false);
            setEditingPayment(null);
            setPayForm({ amount: '', method: 'cash', paymentDate: '', transactionCode: '' });
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>{showPayForm ? 'Cancel' : '+ Record Payment'}</Text>
        </TouchableOpacity>
      </View>

      {showFeeForm && (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Set Fee</Text>
          <FormField label="Total Fees (KES)" value={feeForm.totalFees} onChangeText={(v) => setFeeForm({ ...feeForm, totalFees: v })} keyboardType="numeric" />
          <FormField label="Semester ID" value={feeForm.semesterId} onChangeText={(v) => setFeeForm({ ...feeForm, semesterId: v })} keyboardType="numeric" />
          <FormField label="Due Date" value={feeForm.dueDate} onChangeText={(v) => setFeeForm({ ...feeForm, dueDate: v })} placeholder="YYYY-MM-DD" />
          <TouchableOpacity style={styles.submitBtn} onPress={handleFeeSubmit} activeOpacity={0.7}>
            <Text style={styles.submitText}>Create Fee</Text>
          </TouchableOpacity>
        </Card>
      )}

      {showPayForm && (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>{editingPayment ? 'Update Payment' : 'Record Payment'}</Text>
          <FormField label="Amount (KES)" value={payForm.amount} onChangeText={(v) => setPayForm({ ...payForm, amount: v })} keyboardType="numeric" />
          <Text style={styles.fieldLabel}>Method</Text>
          <View style={styles.methodRow}>
            {paymentMethods.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.methodBtn,
                  payForm.method === m && styles.methodBtnActive,
                ]}
                onPress={() => setPayForm({ ...payForm, method: m })}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.methodText,
                    payForm.method === m && styles.methodTextActive,
                  ]}
                >
                  {m.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FormField label="Payment Date" value={payForm.paymentDate} onChangeText={(v) => setPayForm({ ...payForm, paymentDate: v })} placeholder="YYYY-MM-DD" />
          <FormField label="Transaction Code" value={payForm.transactionCode} onChangeText={(v) => setPayForm({ ...payForm, transactionCode: v })} />
          <TouchableOpacity style={styles.submitBtn} onPress={handlePaySubmit} activeOpacity={0.7}>
            <Text style={styles.submitText}>{editingPayment ? 'Update Payment' : 'Record Payment'}</Text>
          </TouchableOpacity>
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Fees</Text>
        {data.fees.length === 0 ? (
          <Text style={styles.emptyText}>No fee records.</Text>
        ) : (
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1 }]}>Total</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1 }]}>Paid</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1 }]}>Balance</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1 }]}>Status</Text>
            </View>
            {data.fees.map((f) => (
              <View key={f.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{formatCurrency(f.totalFees)}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{formatCurrency(f.paidAmount)}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{formatCurrency(f.balance)}</Text>
                <View style={{ flex: 1 }}>
                  <Badge
                    label={f.status}
                    color={getStatusColor(f.status)}
                    bgColor={getStatusBgColor(f.status)}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        {data.payments.length === 0 ? (
          <Text style={styles.emptyText}>No payments.</Text>
        ) : (
          data.payments.map((p) => (
            <View key={p.id} style={styles.paymentRow}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentDate}>{formatDate(p.paymentDate)}</Text>
                <Text style={styles.paymentMethod}>{p.method?.toUpperCase()}</Text>
              </View>
              <Text style={styles.paymentAmount}>{formatCurrency(p.amount)}</Text>
              <View style={styles.paymentActions}>
                <TouchableOpacity onPress={() => startEdit(p)}>
                  <Text style={styles.editBtn}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deletePayment(p.id)}>
                  <Text style={styles.deleteBtn}>Del</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </Card>
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
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.gray[800],
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  methodBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  methodBtnActive: {
    backgroundColor: colors.maroon[900],
    borderColor: colors.maroon[900],
  },
  methodText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    textTransform: 'capitalize',
  },
  methodTextActive: {
    color: colors.white,
  },
  submitBtn: {
    backgroundColor: colors.maroon[900],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  tableHeaderText: {
    fontWeight: '700',
    color: colors.gray[700],
    fontSize: fontSize.xs,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tableCell: {
    fontSize: fontSize.sm,
    color: colors.gray[900],
  },
  emptyText: {
    color: colors.gray[500],
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  paymentInfo: {
    flex: 1,
  },
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
    marginRight: spacing.md,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editBtn: {
    color: colors.green[600],
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  deleteBtn: {
    color: colors.red[600],
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});

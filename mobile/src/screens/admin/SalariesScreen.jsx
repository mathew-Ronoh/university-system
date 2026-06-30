import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import FormField from '../../components/FormField';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatCurrency, getStatusColor, getStatusBgColor } from '../../utils/format';

export default function SalariesScreen() {
  const [salaries, setSalaries] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ lecturerId: '', amount: '', month: '', year: '' });

  const load = async () => {
    try {
      const [s, l] = await Promise.all([
        api.get('/admin/salaries'),
        api.get('/admin/lecturers'),
      ]);
      setSalaries(s.data.salaries || []);
      setLecturers(l.data.lecturers || []);
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    try {
      await api.post('/admin/salaries', {
        lecturerId: parseInt(form.lecturerId),
        amount: parseFloat(form.amount),
        month: form.month,
        year: form.year,
      });
      setShowForm(false);
      setForm({ lecturerId: '', amount: '', month: '', year: '' });
      Alert.alert('Success', 'Salary record created.');
      load();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to create salary.');
    }
  };

  const markPaid = async (id) => {
    try {
      await api.post(`/admin/salaries/${id}/mark-paid`);
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
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.addBtn, showForm && styles.cancelBtn]}
        onPress={() => setShowForm(!showForm)}
        activeOpacity={0.7}
      >
        <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Add Salary'}</Text>
      </TouchableOpacity>

      {showForm && (
        <Card style={styles.formCard}>
          <Text style={styles.fieldLabel}>Lecturer</Text>
          <View style={styles.lecturerRow}>
            {lecturers.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={[
                  styles.lecturerBtn,
                  form.lecturerId === String(l.id) && styles.lecturerBtnActive,
                ]}
                onPress={() => setForm({ ...form, lecturerId: String(l.id) })}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.lecturerText,
                    form.lecturerId === String(l.id) && styles.lecturerTextActive,
                  ]}
                >
                  {l.firstName} {l.lastName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FormField label="Amount (KES)" value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} keyboardType="numeric" required />
          <FormField label="Month (1-12)" value={form.month} onChangeText={(v) => setForm({ ...form, month: v })} keyboardType="numeric" placeholder="e.g. 9" required />
          <FormField label="Year" value={form.year} onChangeText={(v) => setForm({ ...form, year: v })} keyboardType="numeric" placeholder="e.g. 2025" required />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.7}>
            <Text style={styles.submitText}>Create Salary</Text>
          </TouchableOpacity>
        </Card>
      )}

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

      <FlatList
        contentContainerStyle={styles.list}
        data={salaries}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState message="No salary records." />}
        renderItem={({ item }) => (
          <Card style={styles.salaryCard}>
            <View style={styles.salaryHeader}>
              <View>
                <Text style={styles.lecturerName}>
                  {item.lecturer?.firstName} {item.lecturer?.lastName}
                </Text>
                <Text style={styles.period}>{item.month}/{item.year}</Text>
              </View>
              <Badge
                label={item.status}
                color={getStatusColor(item.status)}
                bgColor={getStatusBgColor(item.status)}
              />
            </View>
            <View style={styles.salaryBody}>
              <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
              {item.status !== 'paid' && (
                <TouchableOpacity onPress={() => markPaid(item.id)}>
                  <Badge label="Mark Paid" color="#16a34a" bgColor="#dcfce7" />
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  addBtn: {
    backgroundColor: colors.maroon[900],
    margin: spacing.lg,
    marginBottom: 0,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.gray[500],
  },
  addBtnText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  formCard: {
    margin: spacing.lg,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  lecturerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  lecturerBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  lecturerBtnActive: {
    backgroundColor: colors.maroon[900],
    borderColor: colors.maroon[900],
  },
  lecturerText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },
  lecturerTextActive: {
    color: colors.white,
  },
  submitBtn: {
    backgroundColor: colors.green[600],
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
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    margin: spacing.lg,
    marginTop: spacing.md,
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
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
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
  period: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  salaryBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gray[900],
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { formatDate } from '../../utils/format';

export default function SemestersScreen() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', academicYear: '', startDate: '', endDate: '' });

  const load = async () => {
    try {
      const { data } = await api.get('/admin/semesters');
      setSemesters(data.semesters || []);
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
      await api.post('/admin/semesters', form);
      setShowForm(false);
      setForm({ name: '', academicYear: '', startDate: '', endDate: '' });
      Alert.alert('Success', 'Semester created.');
      load();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to create semester.');
    }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.addBtn, showForm && styles.cancelBtn]}
        onPress={() => setShowForm(!showForm)}
        activeOpacity={0.7}
      >
        <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Add Semester'}</Text>
      </TouchableOpacity>

      {showForm && (
        <Card style={styles.formCard}>
          <FormField label="Semester Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} required />
          <FormField label="Academic Year" value={form.academicYear} onChangeText={(v) => setForm({ ...form, academicYear: v })} placeholder="e.g. 2025/2026" required />
          <FormField label="Start Date" value={form.startDate} onChangeText={(v) => setForm({ ...form, startDate: v })} placeholder="YYYY-MM-DD" required />
          <FormField label="End Date" value={form.endDate} onChangeText={(v) => setForm({ ...form, endDate: v })} placeholder="YYYY-MM-DD" required />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.7}>
            <Text style={styles.submitText}>Create Semester</Text>
          </TouchableOpacity>
        </Card>
      )}

      <FlatList
        contentContainerStyle={styles.list}
        data={semesters}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState message="No semesters." />}
        renderItem={({ item }) => (
          <Card style={styles.semesterCard}>
            <View style={styles.semesterHeader}>
              <Text style={styles.semesterName}>{item.name}</Text>
              {item.isCurrent && (
                <Badge label="Current" color="#16a34a" bgColor="#dcfce7" />
              )}
            </View>
            <Text style={styles.academicYear}>{item.academicYear}</Text>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Start: {formatDate(item.startDate)}</Text>
              <Text style={styles.dateLabel}>End: {formatDate(item.endDate)}</Text>
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
  list: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  semesterCard: {
    marginBottom: spacing.md,
  },
  semesterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  semesterName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[900],
  },
  academicYear: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
});

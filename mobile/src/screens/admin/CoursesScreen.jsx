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
import FormField from '../../components/FormField';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatCurrency } from '../../utils/format';

export default function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', credits: '120', department: '', fee: '' });

  const load = async () => {
    try {
      const [c, l] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/lecturers'),
      ]);
      setCourses(c.data.courses || []);
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
      await api.post('/admin/courses', {
        ...form,
        credits: parseInt(form.credits),
        fee: parseFloat(form.fee),
      });
      setShowForm(false);
      setForm({ code: '', name: '', credits: '120', department: '', fee: '' });
      Alert.alert('Success', 'Course created.');
      load();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to create course.');
    }
  };

  const assignCoordinator = async (courseId, lecturerId) => {
    try {
      await api.post('/admin/assign-course-lecturer', { courseId, lecturerId: lecturerId ? +lecturerId : null });
      load();
    } catch (err) {
      Alert.alert('Error', 'Failed to assign coordinator.');
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
        <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Add Course'}</Text>
      </TouchableOpacity>

      {showForm && (
        <Card style={styles.formCard}>
          <FormField label="Code" value={form.code} onChangeText={(v) => setForm({ ...form, code: v })} required />
          <FormField label="Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} required />
          <FormField label="Credits" value={form.credits} onChangeText={(v) => setForm({ ...form, credits: v })} keyboardType="numeric" />
          <FormField label="Department" value={form.department} onChangeText={(v) => setForm({ ...form, department: v })} />
          <FormField label="Semester Fee (KES)" value={form.fee} onChangeText={(v) => setForm({ ...form, fee: v })} keyboardType="numeric" required />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.7}>
            <Text style={styles.submitText}>Create Course</Text>
          </TouchableOpacity>
        </Card>
      )}

      <FlatList
        contentContainerStyle={styles.list}
        data={courses}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState message="No courses." />}
        renderItem={({ item }) => (
          <Card style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <Text style={styles.courseCode}>{item.code}</Text>
              <Text style={styles.courseFee}>{formatCurrency(item.fee)}</Text>
            </View>
            <Text style={styles.courseName}>{item.name}</Text>
            <Text style={styles.courseMeta}>
              {item.credits} Credits • {item.department || 'No department'}
            </Text>
            <View style={styles.coordinatorRow}>
              <Text style={styles.coordinatorLabel}>Coordinator:</Text>
              <View style={styles.coordinatorPicker}>
                {lecturers.map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    style={[
                      styles.coordinatorBtn,
                      item.coordinator?.id === l.id && styles.coordinatorBtnActive,
                    ]}
                    onPress={() => assignCoordinator(item.id, item.coordinator?.id === l.id ? '' : l.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.coordinatorText,
                        item.coordinator?.id === l.id && styles.coordinatorTextActive,
                      ]}
                    >
                      {l.firstName} {l.lastName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  courseCard: {
    marginBottom: spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  courseCode: {
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
    color: colors.maroon[700],
    fontWeight: '600',
  },
  courseFee: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[900],
  },
  courseName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  courseMeta: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  coordinatorRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: spacing.sm,
  },
  coordinatorLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  coordinatorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  coordinatorBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  coordinatorBtnActive: {
    backgroundColor: colors.maroon[900],
    borderColor: colors.maroon[900],
  },
  coordinatorText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },
  coordinatorTextActive: {
    color: colors.white,
  },
});

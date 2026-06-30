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

export default function UnitsScreen() {
  const [units, setUnits] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', credits: '3', courseId: '', semesterId: '', lecturerId: '' });

  const load = async () => {
    try {
      const [u, c, l, s] = await Promise.all([
        api.get('/admin/units'),
        api.get('/admin/courses'),
        api.get('/admin/lecturers'),
        api.get('/admin/semesters'),
      ]);
      setUnits(u.data.units || []);
      setCourses(c.data.courses || []);
      setLecturers(l.data.lecturers || []);
      setSemesters(s.data.semesters || []);
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
      await api.post('/admin/units', {
        ...form,
        credits: parseInt(form.credits),
        courseId: parseInt(form.courseId),
        semesterId: form.semesterId ? parseInt(form.semesterId) : undefined,
        lecturerId: form.lecturerId ? parseInt(form.lecturerId) : undefined,
      });
      setShowForm(false);
      setForm({ code: '', name: '', credits: '3', courseId: '', semesterId: '', lecturerId: '' });
      Alert.alert('Success', 'Unit created.');
      load();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to create unit.');
    }
  };

  if (loading) return <Loading />;

  const courseMap = {};
  courses.forEach((c) => { courseMap[c.id] = c; });
  const semesterMap = {};
  semesters.forEach((s) => { semesterMap[s.id] = s; });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.addBtn, showForm && styles.cancelBtn]}
        onPress={() => setShowForm(!showForm)}
        activeOpacity={0.7}
      >
        <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Add Unit'}</Text>
      </TouchableOpacity>

      {showForm && (
        <Card style={styles.formCard}>
          <FormField label="Code" value={form.code} onChangeText={(v) => setForm({ ...form, code: v })} required />
          <FormField label="Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} required />
          <FormField label="Credits" value={form.credits} onChangeText={(v) => setForm({ ...form, credits: v })} keyboardType="numeric" />
          <Text style={styles.fieldLabel}>Course</Text>
          <View style={styles.pickerRow}>
            {courses.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.pickerBtn, form.courseId === String(c.id) && styles.pickerBtnActive]}
                onPress={() => setForm({ ...form, courseId: String(c.id) })}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerText, form.courseId === String(c.id) && styles.pickerTextActive]}>
                  {c.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fieldLabel}>Semester</Text>
          <View style={styles.pickerRow}>
            {semesters.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.pickerBtn, form.semesterId === String(s.id) && styles.pickerBtnActive]}
                onPress={() => setForm({ ...form, semesterId: String(s.id) })}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerText, form.semesterId === String(s.id) && styles.pickerTextActive]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fieldLabel}>Lecturer</Text>
          <View style={styles.pickerRow}>
            {lecturers.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={[styles.pickerBtn, form.lecturerId === String(l.id) && styles.pickerBtnActive]}
                onPress={() => setForm({ ...form, lecturerId: String(l.id) })}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerText, form.lecturerId === String(l.id) && styles.pickerTextActive]}>
                  {l.firstName} {l.lastName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.7}>
            <Text style={styles.submitText}>Create Unit</Text>
          </TouchableOpacity>
        </Card>
      )}

      <FlatList
        contentContainerStyle={styles.list}
        data={units}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState message="No units." />}
        renderItem={({ item }) => (
          <Card style={styles.unitCard}>
            <Text style={styles.unitCode}>{item.code}</Text>
            <Text style={styles.unitName}>{item.name}</Text>
            <View style={styles.unitMeta}>
              <Text style={styles.metaText}>{item.credits} Credits</Text>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>{courseMap[item.courseId]?.code || '—'}</Text>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>{semesterMap[item.semesterId]?.name || '—'}</Text>
            </View>
            {item.lecturer && (
              <Text style={styles.lecturerName}>
                Lecturer: {item.lecturer.firstName} {item.lecturer.lastName}
              </Text>
            )}
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
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  pickerBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  pickerBtnActive: {
    backgroundColor: colors.maroon[900],
    borderColor: colors.maroon[900],
  },
  pickerText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },
  pickerTextActive: {
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
  list: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  unitCard: {
    marginBottom: spacing.md,
  },
  unitCode: {
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
    color: colors.maroon[700],
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  unitName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  unitMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  lecturerName: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
});

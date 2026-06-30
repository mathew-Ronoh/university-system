import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { computeGrade, getGradeColor } from '../../utils/format';

export default function CourseStudentsScreen({ route }) {
  const { id, unitName } = route.params;
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [s, r] = await Promise.all([
        api.get(`/lecturer/courses/${id}/students`),
        api.get(`/lecturer/courses/${id}/results`),
      ]);
      setStudents(s.data.students || []);
      const res = r.data.results || [];
      const m = {};
      res.forEach((r) => {
        m[r.studentId] = { marks: String(r.marks ?? ''), grade: r.grade };
      });
      setMarks(m);
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleMarksChange = (studentId, value) => {
    const grade = computeGrade(value);
    setMarks((prev) => ({ ...prev, [studentId]: { marks: value, grade } }));
  };

  const saveResult = async (studentId) => {
    const entry = marks[studentId];
    if (!entry || entry.marks === '') return;
    setSaving(studentId);
    try {
      await api.put(`/lecturer/courses/${id}/results`, {
        studentId,
        marks: parseFloat(entry.marks),
        grade: entry.grade,
      });
      Alert.alert('Saved', 'Result updated successfully.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={students}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState message="No students enrolled." />}
        renderItem={({ item }) => {
          const entry = marks[item.id] || {};
          return (
            <Card style={styles.studentCard}>
              <View style={styles.studentHeader}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {item.user?.firstName} {item.user?.lastName}
                  </Text>
                  <Text style={styles.admissionNo}>{item.admissionNo}</Text>
                </View>
              </View>
              <View style={styles.marksRow}>
                <View style={styles.marksInput}>
                  <Text style={styles.marksLabel}>Marks</Text>
                  <TextInput
                    style={styles.input}
                    value={entry.marks ?? ''}
                    onChangeText={(v) => handleMarksChange(item.id, v)}
                    keyboardType="numeric"
                    placeholder="0-100"
                    placeholderTextColor={colors.gray[400]}
                  />
                </View>
                <View style={styles.gradeBox}>
                  <Text style={styles.marksLabel}>Grade</Text>
                  <Text style={[styles.gradeText, { color: getGradeColor(entry.grade) }]}>
                    {entry.grade || '—'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.saveBtn, saving === item.id && styles.saveBtnDisabled]}
                  onPress={() => saveResult(item.id)}
                  disabled={saving === item.id}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveText}>
                    {saving === item.id ? '...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
      />
    </View>
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
  studentCard: {
    marginBottom: spacing.md,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  studentInfo: {},
  studentName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[900],
  },
  admissionNo: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    fontFamily: 'monospace',
  },
  marksRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  marksInput: {
    flex: 1,
  },
  marksLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: fontSize.md,
    color: colors.gray[900],
    width: 80,
    textAlign: 'center',
  },
  gradeBox: {
    alignItems: 'center',
  },
  gradeText: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: colors.maroon[900],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

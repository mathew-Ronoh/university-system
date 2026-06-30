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
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function EnrollmentsScreen() {
  const [students, setStudents] = useState([]);
  const [units, setUnits] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);

  const load = async () => {
    try {
      const [s, u, sem] = await Promise.all([
        api.get('/admin/users?role=student'),
        api.get('/admin/units'),
        api.get('/admin/semesters'),
      ]);
      setStudents(s.data.users || []);
      setUnits(u.data.units || []);
      setSemesters(sem.data.semesters || []);
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const toggleUnit = (unitId) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId],
    );
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedSemester || selectedUnits.length === 0) {
      Alert.alert('Error', 'Please select a student, semester, and at least one unit.');
      return;
    }
    try {
      await api.post('/admin/enroll-student', {
        studentId: selectedStudent,
        unitIds: selectedUnits,
        semesterId: selectedSemester,
      });
      Alert.alert('Success', 'Student enrolled successfully.');
      setSelectedStudent(null);
      setSelectedUnits([]);
      setSelectedSemester(null);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Enrollment failed.');
    }
  };

  if (loading) return <Loading />;

  const currentSemester = semesters.find((s) => s.isCurrent);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={['form', 'studentList']}
      keyExtractor={(item) => item}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Enroll Students</Text>

          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Select Student</Text>
            <View style={styles.studentPicker}>
              {students.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.pickerBtn,
                    selectedStudent === s.student?.id && styles.pickerBtnActive,
                  ]}
                  onPress={() => setSelectedStudent(s.student?.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      selectedStudent === s.student?.id && styles.pickerTextActive,
                    ]}
                  >
                    {s.firstName} {s.lastName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Select Semester</Text>
            <View style={styles.semesterPicker}>
              {semesters.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.pickerBtn,
                    selectedSemester === s.id && styles.pickerBtnActive,
                  ]}
                  onPress={() => setSelectedSemester(s.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      selectedSemester === s.id && styles.pickerTextActive,
                    ]}
                  >
                    {s.name}{s.isCurrent ? ' (Current)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Select Units</Text>
            <View style={styles.unitPicker}>
              {units.map((u) => {
                const isSelected = selectedUnits.includes(u.id);
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.unitBtn, isSelected && styles.unitBtnActive]}
                    onPress={() => toggleUnit(u.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.unitCode, isSelected && styles.unitCodeActive]}>
                      {u.code}
                    </Text>
                    <Text style={[styles.unitNameSmall, isSelected && styles.unitNameSmallActive]}>
                      {u.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <TouchableOpacity
            style={[
              styles.enrollBtn,
              (!selectedStudent || !selectedSemester || selectedUnits.length === 0) && styles.enrollBtnDisabled,
            ]}
            onPress={handleEnroll}
            disabled={!selectedStudent || !selectedSemester || selectedUnits.length === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.enrollBtnText}>
              Enroll ({selectedUnits.length} unit{selectedUnits.length !== 1 ? 's' : ''})
            </Text>
          </TouchableOpacity>
        </>
      }
      renderItem={null}
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
  formCard: {
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  studentPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  semesterPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
  unitPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  unitBtn: {
    width: '47%',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  unitBtnActive: {
    backgroundColor: colors.maroon[900],
    borderColor: colors.maroon[900],
  },
  unitCode: {
    fontSize: fontSize.xs,
    fontFamily: 'monospace',
    color: colors.maroon[700],
    fontWeight: '600',
  },
  unitCodeActive: {
    color: colors.maroon[200],
  },
  unitNameSmall: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    marginTop: 2,
  },
  unitNameSmallActive: {
    color: colors.white,
  },
  enrollBtn: {
    backgroundColor: colors.green[600],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  enrollBtnDisabled: {
    opacity: 0.5,
  },
  enrollBtnText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Loading from '../../components/Loading';

export default function LecturerDashboard({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/lecturer/courses');
      setCourses(data.units || []);
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <Loading />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>My Courses</Text>
      <Text style={styles.subtitle}>{courses.length} unit(s) assigned</Text>

      {courses.map((unit) => (
        <TouchableOpacity
          key={unit.id}
          style={styles.courseCard}
          onPress={() => navigation.navigate('Courses', {
            screen: 'CourseStudents',
            params: { id: unit.id, unitName: unit.name },
          })}
          activeOpacity={0.7}
        >
          <View style={styles.courseHeader}>
            <Text style={styles.courseCode}>{unit.code}</Text>
          </View>
          <Text style={styles.courseName}>{unit.name}</Text>
          <Text style={styles.courseMeta}>
            {unit.course?.name} • {unit.semester?.name || '—'}
          </Text>
        </TouchableOpacity>
      ))}

      {courses.length === 0 && (
        <Text style={styles.empty}>No courses assigned yet.</Text>
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
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.lg,
  },
  courseCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  courseCode: {
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
    color: colors.maroon[700],
    fontWeight: '600',
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
  },
  empty: {
    textAlign: 'center',
    color: colors.gray[500],
    marginTop: spacing.xxxl,
  },
});

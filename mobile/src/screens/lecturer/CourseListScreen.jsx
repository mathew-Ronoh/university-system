import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function CourseListScreen({ navigation }) {
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
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={courses}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<EmptyState message="No courses assigned." />}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('CourseStudents', {
              id: item.id,
              unitName: item.name,
            })
          }
          activeOpacity={0.7}
        >
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.course?.name} • {item.semester?.name || '—'}
          </Text>
          <Text style={styles.action}>Enter Results →</Text>
        </TouchableOpacity>
      )}
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
  },
  card: {
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
  code: {
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
    color: colors.maroon[700],
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  action: {
    fontSize: fontSize.sm,
    color: colors.green[600],
    fontWeight: '600',
  },
});

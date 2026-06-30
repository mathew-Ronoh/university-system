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
import { getGradeColor } from '../../utils/format';

export default function TranscriptScreen() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/student/transcript');
      setResults(data.results || []);
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const downloadPDF = () => {
    Alert.alert('Download Transcript', 'PDF download will open in your browser.');
  };

  if (loading) return <Loading />;

  const groupedBySemester = {};
  results.forEach((r) => {
    const key = r.semester?.name || 'Unknown';
    if (!groupedBySemester[key]) groupedBySemester[key] = [];
    groupedBySemester[key].push(r);
  });

  const sections = Object.entries(groupedBySemester);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.downloadBtn} onPress={downloadPDF} activeOpacity={0.7}>
        <Text style={styles.downloadText}>Download PDF</Text>
      </TouchableOpacity>

      <FlatList
        contentContainerStyle={styles.content}
        data={sections}
        keyExtractor={([name]) => name}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState message="No results yet." />}
        renderItem={({ item: [semesterName, semesterResults] }) => (
          <Card style={styles.section}>
            <Text style={styles.semesterTitle}>{semesterName}</Text>
            {semesterResults.map((r) => (
              <View key={r.id} style={styles.resultRow}>
                <View style={styles.resultInfo}>
                  <Text style={styles.unitName}>{r.unit?.name || '—'}</Text>
                  <Text style={styles.unitCode}>{r.unit?.code || ''}</Text>
                </View>
                <View style={styles.resultMarks}>
                  <Text style={styles.marks}>{r.marks ?? '—'}</Text>
                  <Text style={[styles.grade, { color: getGradeColor(r.grade) }]}>
                    {r.grade || '—'}
                  </Text>
                </View>
              </View>
            ))}
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
  downloadBtn: {
    backgroundColor: colors.maroon[900],
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  downloadText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  semesterTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  resultInfo: {
    flex: 1,
  },
  unitName: {
    fontSize: fontSize.md,
    color: colors.gray[700],
  },
  unitCode: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    fontFamily: 'monospace',
  },
  resultMarks: {
    alignItems: 'center',
    minWidth: 60,
  },
  marks: {
    fontSize: fontSize.md,
    color: colors.gray[900],
    fontWeight: '600',
  },
  grade: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});

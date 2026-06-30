import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function DashboardScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/admin/users?role=student');
      setUsers(data.users || []);
      setFiltered(data.users || []);
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(users);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.student?.admissionNo?.toLowerCase().includes(q),
      ),
    );
  }, [search, users]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Search students by name, email or admission no..."
        placeholderTextColor={colors.gray[400]}
      />
      <FlatList
        contentContainerStyle={styles.content}
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState message="No students found." />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.studentCard}
            onPress={() =>
              navigation.navigate('StudentFees', { id: item.student?.id, studentName: `${item.firstName} ${item.lastName}` })
            }
            activeOpacity={0.7}
          >
            <Avatar firstName={item.firstName} lastName={item.lastName} avatarUrl={item.avatarUrl} size={44} />
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.studentEmail}>{item.email}</Text>
              {item.student?.admissionNo && (
                <Text style={styles.admissionNo}>{item.student.admissionNo}</Text>
              )}
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
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
  searchInput: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    fontSize: fontSize.md,
    color: colors.gray[900],
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  studentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  studentName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[900],
  },
  studentEmail: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  admissionNo: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    fontFamily: 'monospace',
  },
  arrow: {
    fontSize: 24,
    color: colors.gray[400],
    marginLeft: spacing.sm,
  },
});

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
  Modal,
  ScrollView,
} from 'react-native';
import api from '../../api/client';
import colors from '../../constants/colors';
import { spacing, fontSize, borderRadius } from '../../constants/layout';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import FormField from '../../components/FormField';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const roles = ['student', 'lecturer', 'finance', 'admin'];

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'student',
    firstName: '',
    lastName: '',
    phone: '',
    admissionNo: '',
    courseId: '',
  });

  const load = async () => {
    try {
      const [u, c] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/courses'),
      ]);
      setUsers(u.data.users || []);
      setCourses(c.data.courses || []);
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
      const payload = { ...form };
      if (payload.role !== 'student') {
        delete payload.admissionNo;
        delete payload.courseId;
      }
      await api.post('/admin/users', payload);
      setShowForm(false);
      setForm({
        email: '',
        password: '',
        role: 'student',
        firstName: '',
        lastName: '',
        phone: '',
        admissionNo: '',
        courseId: '',
      });
      Alert.alert('Success', 'User created.');
      load();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to create user.');
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.post(`/admin/users/${id}/toggle-active`);
      load();
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle status.');
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
        <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Add User'}</Text>
      </TouchableOpacity>

      {showForm && (
        <Card style={styles.formCard}>
          <ScrollView>
            <FormField label="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" required />
            <FormField label="Password" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry required />
            <Text style={styles.fieldLabel}>Role</Text>
            <View style={styles.roleRow}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, form.role === r && styles.roleBtnActive]}
                  onPress={() => setForm({ ...form, role: r })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.roleText, form.role === r && styles.roleTextActive]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <FormField label="First Name" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} required />
            <FormField label="Last Name" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} required />
            <FormField label="Phone" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />

            {form.role === 'student' && (
              <>
                <FormField label="Admission No" value={form.admissionNo} onChangeText={(v) => setForm({ ...form, admissionNo: v })} required />
                <Text style={styles.fieldLabel}>Course</Text>
                <View style={styles.courseRow}>
                  {courses.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.courseBtn, form.courseId === String(c.id) && styles.courseBtnActive]}
                      onPress={() => setForm({ ...form, courseId: String(c.id) })}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.courseText, form.courseId === String(c.id) && styles.courseTextActive]}>
                        {c.code}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.7}>
              <Text style={styles.submitText}>Create User</Text>
            </TouchableOpacity>
          </ScrollView>
        </Card>
      )}

      <FlatList
        contentContainerStyle={styles.list}
        data={users}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState message="No users found." />}
        renderItem={({ item }) => (
          <Card style={styles.userCard}>
            <View style={styles.userRow}>
              <Avatar firstName={item.firstName} lastName={item.lastName} avatarUrl={item.avatarUrl} size={44} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.userMeta}>
                  <Badge label={item.role} color={colors.white} bgColor={item.role === 'admin' ? '#dc2626' : item.role === 'lecturer' ? '#2563eb' : item.role === 'finance' ? '#ca8a04' : '#16a34a'} size="sm" />
                  <Badge
                    label={item.isActive ? 'Active' : 'Inactive'}
                    color={item.isActive ? '#16a34a' : '#dc2626'}
                    bgColor={item.isActive ? '#dcfce7' : '#fee2e2'}
                    size="sm"
                  />
                </View>
              </View>
              <TouchableOpacity onPress={() => toggleActive(item.id)}>
                <Text style={styles.toggleBtn}>
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>
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
    maxHeight: 400,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  roleBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  roleBtnActive: {
    backgroundColor: colors.maroon[900],
    borderColor: colors.maroon[900],
  },
  roleText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },
  roleTextActive: {
    color: colors.white,
  },
  courseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  courseBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  courseBtnActive: {
    backgroundColor: colors.maroon[900],
    borderColor: colors.maroon[900],
  },
  courseText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },
  courseTextActive: {
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
  userCard: {
    marginBottom: spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[900],
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  userMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  toggleBtn: {
    color: colors.green[600],
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});

import { assessmentsApi } from '@/modules/assessments/services/assessmentsApi';
import { contentApi } from '@/modules/content/services/contentApi';
import { useAuth } from '@/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const menuItems = [
  { icon: 'bell' as const, label: 'Notifications' },
  { icon: 'lock' as const, label: 'Security & Privacy' },
  { icon: 'credit-card' as const, label: 'Billing - Pro $9.99/mo' },
];

const devices = [
  { name: 'iPhone 15 Pro', subtitle: 'Active now', status: 'Active' },
  { name: 'MacBook Pro', subtitle: 'Last seen 2d ago', status: 'Remove' },
];

export default function MeScreen() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [contentCount, setContentCount] = useState<number | null>(null);
  const [assessmentsCount, setAssessmentsCount] = useState<number | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const [content, assessments] = await Promise.all([
        contentApi.list({ token }),
        assessmentsApi.list(),
      ]);
      setContentCount(content.length);
      setAssessmentsCount(assessments.length);
    } catch {
      setContentCount(0);
      setAssessmentsCount(0);
    }
  }, [token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const name = user?.name || user?.email?.split('@')[0] || 'Alex';
  const email = user?.email || 'alex@example.com';
  const isPro = user?.subscription?.status === 'active';

  const statItems = [
    { label: 'Books', value: contentCount === null ? '—' : String(contentCount), icon: 'book' as const },
    { label: 'Done', value: '—', icon: 'check-square' as const },
    { label: 'Quizzes', value: assessmentsCount === null ? '—' : String(assessmentsCount), icon: 'award' as const },
    { label: 'Streak', value: '—', icon: 'zap' as const },
  ];

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Feather name="user" size={40} color="#64748b" />
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          {(isPro || user) && (
            <View style={[styles.badge, isPro && styles.badgePro]}>
              <Text style={styles.badgeText}>{isPro ? '★ Pro Member' : 'Free'}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          {statItems.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Feather name={s.icon} size={20} color="#64748b" />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Device Access</Text>
            <Text style={styles.sectionMeta}>2/3 devices</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
          {devices.map((d) => (
            <View key={d.name} style={styles.deviceRow}>
              <Feather
                name={d.status === 'Active' ? 'smartphone' : 'monitor'}
                size={20}
                color="#64748b"
              />
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{d.name}</Text>
                <Text style={styles.deviceSubtitle}>{d.subtitle}</Text>
              </View>
              <TouchableOpacity
                style={d.status === 'Active' ? styles.activePill : styles.removePill}
                activeOpacity={0.8}
              >
                <Text
                  style={d.status === 'Active' ? styles.activePillText : styles.removePillText}
                >
                  {d.status === 'Active' ? '• Active' : d.status}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => {
                if (item.label.startsWith('Billing')) router.push('/screens/subscription');
              }}
            >
              <Feather name={item.icon} size={20} color="#475569" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOut} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 40 },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginTop: 14 },
  email: { fontSize: 14, color: '#64748b', marginTop: 4 },
  badge: {
    marginTop: 10,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  badgePro: { backgroundColor: '#e0e7ff' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  section: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  sectionMeta: { fontSize: 13, color: '#64748b' },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: { height: '100%', backgroundColor: '#94a3b8', borderRadius: 3 },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  deviceSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  activePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  activePillText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  removePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
  },
  removePillText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  menu: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0f172a' },
  signOut: {
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
});

import { assessmentsApi, type AssessmentItem } from '@/modules/assessments/services/assessmentsApi';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizScreen() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh?: boolean) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await assessmentsApi.list();
      setAssessments(data);
    } catch (err) {
      console.error('[Quiz] Failed to load assessments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const passedCount = 0; // Could be from local storage or API later
  const toDoCount = assessments.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Assessments</Text>
        <Text style={styles.subtitle}>Practice quizzes & tests</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />
        }
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="award" size={22} color="#64748b" />
            <Text style={styles.statValue}>{loading ? '—' : String(passedCount)}</Text>
            <Text style={styles.statLabel}>Passed</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="clock" size={22} color="#64748b" />
            <Text style={styles.statValue}>{loading ? '—' : String(toDoCount)}</Text>
            <Text style={styles.statLabel}>To Do</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="file-text" size={22} color="#64748b" />
            <Text style={styles.statValue}>{loading ? '—' : String(assessments.length)}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#64748b" />
            <Text style={styles.loadingText}>Loading assessments...</Text>
          </View>
        ) : assessments.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={40} color="#94a3b8" />
            <Text style={styles.emptyText}>No assessments yet</Text>
            <Text style={styles.emptySubtext}>Quizzes will appear here when added by your instructor.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {assessments.map((a) => (
              <View key={a.id} style={styles.assessmentCard}>
                <View style={styles.cardLeftBar} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>{a.title}</Text>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>{a.difficulty}</Text>
                    </View>
                  </View>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{a.courseName} · {a.sectionName}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailText}>? {a.questions}q</Text>
                    <Text style={styles.detailText}>{a.timeMinutes}m</Text>
                    <Text style={styles.detailText}>Avg: {a.avgScore}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.startButton}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/screens/quiz/${a.id}`)}
                  >
                    <Text style={styles.startButtonText}>Start →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  subtitle: { marginTop: 4, fontSize: 14, color: '#64748b' },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 24 },
  loadingText: { fontSize: 14, color: '#64748b' },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#475569' },
  emptySubtext: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
  list: { gap: 14 },
  assessmentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardLeftBar: { width: 4, backgroundColor: '#94a3b8' },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1 },
  difficultyBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  categoryText: { fontSize: 12, color: '#475569' },
  detailsRow: { flexDirection: 'row', gap: 14, marginTop: 10 },
  detailText: { fontSize: 13, color: '#64748b' },
  startButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    backgroundColor: '#475569',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  startButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

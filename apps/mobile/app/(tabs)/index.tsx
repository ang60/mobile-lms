import { contentApi, type ContentItem } from '@/modules/content/services/contentApi';
import { coursesApi, type CourseWithSections, type SectionItem } from '@/modules/courses/services/coursesApi';
import { useAuth } from '@/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getInitials(title: string) {
  return title
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  const d = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${days[d.getDay()]} - ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [coursesWithSections, setCoursesWithSections] = useState<CourseWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadContent = useCallback(async (opts?: { isRefresh?: boolean }) => {
    const isRefresh = opts?.isRefresh ?? false;
    try {
      if (!isRefresh) setLoading(true);
      const [contentData, coursesData] = await Promise.all([
        contentApi.list(),
        coursesApi.list(),
      ]);
      setContent(contentData);
      if (coursesData.length > 0) {
        const first = await coursesApi.get(coursesData[0].id);
        setCoursesWithSections(first);
      } else {
        setCoursesWithSections(null);
      }
    } catch (error) {
      console.error('[HomeScreen]', error);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const continueReading = useMemo(() => content.slice(0, 4), [content]);
  const firstName = user?.name?.split(' ')[0] || 'Alex';
  const sections = coursesWithSections?.sections ?? [];
  const courseName = coursesWithSections?.name ?? 'Course';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadContent({ isRefresh: true }); }} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{formatDate()}</Text>
            <Text style={styles.greeting}>
              {getGreeting()}, {firstName} 👋
            </Text>
          </View>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <Feather name="bell" size={22} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <View style={styles.streakCard}>
          <View style={styles.streakLeft}>
            <Feather name="zap" size={22} color="#64748b" />
            <View>
              <Text style={styles.streakTitle}>7-day reading streak</Text>
              <Text style={styles.streakSubtitle}>Read 20 min today to keep it going.</Text>
            </View>
          </View>
          <Text style={styles.streakNumber}>7</Text>
        </View>

        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search materials, quizzes...."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Reading</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/library')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color="#64748b" />
          </View>
        ) : continueReading.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {continueReading.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.continueCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/screens/content/${item.id}`)}
              >
                <View style={styles.continueCardTop}>
                  <View style={styles.continueInitials}>
                    <Text style={styles.continueInitialsText}>{getInitials(item.title)}</Text>
                  </View>
                  <Feather name="zap" size={14} color="#94a3b8" />
                </View>
                <Text style={styles.continueTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.continueCategory}>{item.subject}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '32%' }]} />
                </View>
                <Text style={styles.progressLabel}>32%</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContinue}>
            <Text style={styles.emptyContinueText}>No items in progress</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Sections</Text>
            <Text style={styles.sectionSubtitle}>Course: {courseName}</Text>
          </View>
        </View>
        <View style={styles.categoriesGrid}>
          {sections.length === 0 ? (
            <View style={styles.sectionPlaceholder}>
              <Text style={styles.sectionPlaceholderText}>No sections yet</Text>
              <Text style={styles.sectionPlaceholderSubtext}>Courses and sections are managed in the dashboard</Text>
            </View>
          ) : (
            sections.map((sec) => (
              <TouchableOpacity
                key={sec.id}
                style={styles.categoryCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/(tabs)/library?sectionId=${encodeURIComponent(sec.id)}&sectionName=${encodeURIComponent(sec.name)}`)}
              >
                <Text style={styles.categoryIcon}>{sec.order || sec.name.slice(0, 1)}</Text>
                <Text style={styles.categoryName}>{sec.name}</Text>
                <Text style={styles.categoryCount}>→</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1 },
  content: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  date: { fontSize: 12, color: '#64748b', textTransform: 'uppercase' },
  greeting: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  streakSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  streakNumber: { fontSize: 28, fontWeight: '700', color: '#475569' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0f172a', padding: 0 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  sectionSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  seeAll: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  horizontalList: { paddingHorizontal: 20, gap: 14, paddingBottom: 8 },
  continueCard: {
    width: 160,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  continueCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  continueInitials: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueInitialsText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  continueTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginTop: 10 },
  continueCategory: { fontSize: 12, color: '#64748b', marginTop: 4 },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#94a3b8', borderRadius: 3 },
  progressLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  emptyContinue: { paddingHorizontal: 20, paddingVertical: 24 },
  emptyContinueText: { fontSize: 14, color: '#64748b' },
  loadingState: { paddingHorizontal: 20, paddingVertical: 24, alignItems: 'center' },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    minWidth: 100,
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryIcon: { fontSize: 24, fontWeight: '700', color: '#64748b' },
  categoryName: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginTop: 8 },
  categoryCount: { fontSize: 12, color: '#64748b', marginTop: 4 },
  sectionPlaceholder: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionPlaceholderText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  sectionPlaceholderSubtext: { fontSize: 13, color: '#94a3b8', marginTop: 6 },
});

import { contentApi, type ContentItem } from '@/modules/content/services/contentApi';
import { useAuth } from '@/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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

const cardColors = ['#e2e8f0', '#cbd5e1', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#f1f5f9'];

export default function LibraryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { sectionId, sectionName } = useLocalSearchParams<{ sectionId?: string; sectionName?: string }>();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadContent = async () => {
    try {
      const data = await contentApi.list({
        token,
        ...(sectionId ? { sectionId } : {}),
      });
      setContent(data);
    } catch (error) {
      console.error('[LibraryScreen]', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [token, sectionId]);

  const categories = useMemo(() => {
    const subs = Array.from(new Set(content.map((c) => c.subject))).sort();
    return ['All', ...subs];
  }, [content]);

  const filtered = useMemo(() => {
    return content.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.subject === selectedCategory;
      const matchQuery = item.title.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [content, query, selectedCategory]);

  const startedCount = Math.min(4, filtered.length);
  const subtitle = `${filtered.length} materials - ${startedCount} started`;

  const renderItem = ({ item, index }: { item: ContentItem; index: number }) => {
    const progress = (index % 3 === 0) ? 60 : (index % 3 === 1) ? null : 'completed';
    const isLocked = !token && index % 4 === 1;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          if (isLocked) return;
          router.push(`/screens/content/${item.id}`);
        }}
      >
        <View style={[styles.cardIcon, { backgroundColor: cardColors[index % cardColors.length] }]}>
          <Text style={styles.cardInitials}>{getInitials(item.title)}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.subject}</Text>
            </View>
            <Text style={styles.pagesText}>{item.lessons}pp</Text>
            <Text style={styles.ratingText}>★ 4.5</Text>
          </View>
          {progress === 'completed' ? (
            <Text style={styles.completedText}>✓ Completed</Text>
          ) : isLocked ? (
            <TouchableOpacity
              style={styles.unlockButton}
              activeOpacity={0.8}
              onPress={() => router.push('/screens/subscription')}
            >
              <Text style={styles.unlockButtonText}>Unlock - KES {item.price}</Text>
            </TouchableOpacity>
          ) : progress !== null ? (
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressPct}>{progress}%</Text>
            </View>
          ) : null}
        </View>
        {!isLocked && progress !== 'completed' && (
          <Feather name="zap" size={18} color="#94a3b8" style={styles.flameIcon} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{sectionName ? `${sectionName}` : 'My Library'}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {sectionId ? (
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/library')}
              style={styles.clearFilterButton}
              activeOpacity={0.8}
            >
              <Text style={styles.clearFilterText}>All</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterLabel, selectedCategory === cat && styles.filterLabelActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#64748b" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="book-open" size={48} color="#94a3b8" />
          <Text style={styles.emptyTitle}>
            {content.length === 0 ? 'No content yet' : 'No matching materials'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {content.length === 0
              ? 'Content will appear here once available'
              : 'Try a different filter or search'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadContent(); }} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  subtitle: { marginTop: 4, fontSize: 14, color: '#64748b' },
  clearFilterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  clearFilterText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  filtersScroll: { maxHeight: 44 },
  filters: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  filterChipActive: { backgroundColor: '#475569' },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  filterLabelActive: { color: '#fff' },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748b' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#334155' },
  emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInitials: { fontSize: 14, fontWeight: '700', color: '#475569' },
  cardBody: { flex: 1, marginLeft: 14 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  categoryTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryTagText: { fontSize: 12, fontWeight: '500', color: '#475569' },
  pagesText: { fontSize: 12, color: '#64748b' },
  ratingText: { fontSize: 12, color: '#64748b' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#94a3b8', borderRadius: 3 },
  progressPct: { fontSize: 12, color: '#64748b' },
  completedText: { marginTop: 8, fontSize: 13, fontWeight: '600', color: '#475569' },
  unlockButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#475569',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  unlockButtonText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  flameIcon: { marginLeft: 8 },
});

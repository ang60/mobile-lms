import { contentApi, type ContentItem } from '@/modules/content/services/contentApi';
import { useAuth } from '@/providers/AuthProvider';
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

function getInitials(title: string) {
  return title
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ReadScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh?: boolean) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await contentApi.list({ token });
      setContent(data);
    } catch (err) {
      console.error('[Read] Failed to load content:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const readingList = content.slice(0, 12);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Read</Text>
        <Text style={styles.subtitle}>Your reading list and in-progress materials</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />
        }
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#64748b" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : readingList.length === 0 ? (
          <View style={styles.placeholder}>
            <Feather name="book-open" size={48} color="#94a3b8" />
            <Text style={styles.placeholderTitle}>Your reading list</Text>
            <Text style={styles.placeholderSubtitle}>
              Content you've started or saved will appear here. Browse the library to add materials.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(tabs)/library')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Browse Library</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={styles.sectionLabel}>Continue reading</Text>
            {readingList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => router.push(`/screens/content/${item.id}`)}
              >
                <View style={styles.cardIcon}>
                  <Text style={styles.cardInitials}>{getInitials(item.title)}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.cardMeta}>{item.subject} · {item.lessons} lessons</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.browseMore}
              onPress={() => router.push('/(tabs)/library')}
              activeOpacity={0.8}
            >
              <Text style={styles.browseMoreText}>Browse all in Library</Text>
              <Feather name="arrow-right" size={16} color="#475569" />
            </TouchableOpacity>
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
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 24 },
  loadingText: { fontSize: 14, color: '#64748b' },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  placeholderTitle: { fontSize: 18, fontWeight: '600', color: '#334155' },
  placeholderSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  button: {
    marginTop: 16,
    backgroundColor: '#475569',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 12 },
  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInitials: { fontSize: 14, fontWeight: '700', color: '#475569' },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  cardMeta: { fontSize: 13, color: '#64748b', marginTop: 2 },
  browseMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 12,
  },
  browseMoreText: { fontSize: 14, fontWeight: '600', color: '#475569' },
});

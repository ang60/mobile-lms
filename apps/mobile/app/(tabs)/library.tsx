import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { contentApi, type ContentItem } from '@/modules/content/services/contentApi';
import { useAuth } from '@/providers/AuthProvider';
import { AppBar } from '@/components/AppBar';

export default function LibraryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadContent = async () => {
    try {
      const data = await contentApi.list(token);
      setContent(data);
    } catch (error) {
      console.error('[LibraryScreen] Failed to load content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [token]);

  const subjects = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(content.map((item) => item.subject))).sort();
    return ['All', ...uniqueSubjects];
  }, [content]);

  const filtered = useMemo(() => {
    return content.filter((item) => {
      const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
      const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
      return matchesSubject && matchesQuery;
    });
  }, [content, query, selectedSubject]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadContent();
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      <AppBar title="Library" />
      <View style={styles.header}>
        <Text style={styles.title}>My Library</Text>
        <Text style={styles.subtitle}>Access the kits you have unlocked</Text>
      </View>

      <View style={styles.searchBox}>
        <Feather name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your revision kits"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.filters}>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={[
              styles.filterChip,
              selectedSubject === subject && styles.filterChipActive,
            ]}
            onPress={() => setSelectedSubject(subject)}
          >
            <Text
              style={[
                styles.filterLabel,
                selectedSubject === subject && styles.filterLabelActive,
              ]}
            >
              {subject}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="book-open" size={48} color="#CBD5F5" />
          <Text style={styles.emptyTitle}>
            {content.length === 0 ? 'No content yet' : 'No matching content'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {content.length === 0
              ? 'Content will appear here once uploaded'
              : 'Try adjusting your search or filters'}
          </Text>
          {content.length === 0 && (
            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.9}
              onPress={() => router.push('/(tabs)/subscription')}
            >
              <Text style={styles.emptyButtonText}>Get Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/content/${item.id}`)}
            >
              <View style={styles.cardIcon}>
                <Feather name="book" size={20} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubject}>{item.subject}</Text>
              </View>
              <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    color: '#6B7280',
  },
  searchBox: {
    marginHorizontal: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#1F2937',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  filters: {
    marginHorizontal: 22,
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyButton: {
    marginTop: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#1F2937',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubject: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
});


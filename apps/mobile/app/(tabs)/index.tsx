import { AppBar } from '@/components/AppBar';
import { contentApi, type ContentItem } from '@/modules/content/services/contentApi';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const colors = ['#FDE68A', '#DBEAFE', '#FDEAF1', '#D1FAE5', '#FCE7F3'];

export default function HomeScreen() {
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadContent = async (opts?: { isRefresh?: boolean }) => {
    const isRefresh = opts?.isRefresh ?? false;
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const data = await contentApi.list();
      setContent(data);
    } catch (error) {
      console.error('[HomeScreen] Failed to load content:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const featured = useMemo(() => {
    return content.slice(0, 3).map((item, index) => ({
      ...item,
      color: colors[index % colors.length],
    }));
  }, [content]);

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadContent({ isRefresh: true });
  };

  return (
    <View style={styles.container}>
      <AppBar title="Home" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient colors={['#213FDD', '#142A84']} style={styles.hero}>
        <View style={styles.heroBadge}>
          <Feather name="award" size={18} color="#FFD166" />
          <Text style={styles.heroBadgeText}>Unlock all content</Text>
        </View>
        <Text style={styles.heroTitle}>Hello, Student!</Text>
        <Text style={styles.heroSubtitle}>Continue your learning journey</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.heroButton}
          onPress={() => router.push('/(tabs)/subscription')}
        >
          <LinearGradient colors={['#FFD166', '#F59E0B']} style={styles.heroButtonInner}>
            <Text style={styles.heroButtonText}>Subscribe Now - KES 999/month</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Revision Kits</Text>
        <Link href="/(tabs)/library" asChild>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>View all</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      ) : featured.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="book-open" size={48} color="#CBD5F5" />
          <Text style={styles.emptyTitle}>No content yet</Text>
          <Text style={styles.emptySubtitle}>Content will appear here once uploaded</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {featured.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/content/${item.id}`)}
            >
              <View style={[styles.cardIcon, { backgroundColor: item.color }]}>
                <Feather name="book" size={22} color="#1F2937" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
                <View style={styles.cardMetaRow}>
                  <View style={styles.cardMeta}>
                    <Feather name="book-open" size={14} color="#6B7280" />
                    <Text style={styles.cardMetaText}>{item.lessons} lessons</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Feather name="tag" size={14} color="#6B7280" />
                    <Text style={styles.cardMetaText}>{item.subject}</Text>
                  </View>
                </View>
                <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 28,
    padding: 24,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    marginTop: 6,
  },
  heroButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroButtonInner: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  heroButtonText: {
    color: '#1A1B52',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionAction: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    gap: 18,
  },
  card: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    shadowColor: '#1F2937',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 10,
  },
  loadingState: {
    paddingVertical: 40,
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
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

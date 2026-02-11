import { AppBar } from '@/components/AppBar';
import { contentApi, type ContentItem } from '@/modules/content/services/contentApi';
import { subscriptionApi } from '@/modules/subscription/services/subscriptionApi';
import { useAuth } from '@/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ContentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user, refreshUser } = useAuth();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (id) {
      loadContent();
    }
  }, [id]);

  const loadContent = async () => {
    try {
      const data = await contentApi.get(id!, token);
      setContent(data);
    } catch (error) {
      console.error('[ContentDetail] Failed to load content:', error);
      Alert.alert('Error', 'Failed to load content details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!token) {
      Alert.alert('Login Required', 'Please login to subscribe', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    try {
      setSubscribing(true);
      // Get plans and activate premium plan
      const plans = await subscriptionApi.getPlans();
      const premiumPlan = plans.find((p) => p.id === 'premium') || plans[0];
      
      await subscriptionApi.activate(premiumPlan.id, token);
      
      // Refresh user data to get updated subscription info
      await refreshUser();
      
      Alert.alert('Success', 'Subscription activated! You now have access to all content.', [
        { text: 'OK', onPress: () => loadContent() },
      ]);
    } catch (error: any) {
      console.error('[ContentDetail] Subscription failed:', error);
      Alert.alert('Error', error?.message || 'Failed to activate subscription');
    } finally {
      setSubscribing(false);
    }
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppBar title="Content" showBack />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.container}>
        <AppBar title="Content" showBack />
        <View style={styles.emptyState}>
          <Feather name="alert-circle" size={48} color="#CBD5F5" />
          <Text style={styles.emptyTitle}>Content not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isFree = content.price === 0;
  const hasAccess = isFree || user?.subscription?.status === 'active';

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title={content.title} showBack />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Feather name="book" size={32} color="#4F46E5" />
        </View>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subject}>{content.subject}</Text>
        <Text style={styles.description}>{content.description}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="book-open" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{content.lessons} lessons</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="tag" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{content.type.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.price}>{formatPrice(content.price)}</Text>
        </View>
      </View>

      {hasAccess ? (
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => {
            // TODO: Open/download content file
            Alert.alert('Coming Soon', 'Content viewer will be available soon');
          }}
        >
          <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.actionButtonInner}>
            <Feather name="download" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>View Content</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={handleSubscribe}
          disabled={subscribing}
        >
          <LinearGradient colors={['#FBBF24', '#F97316']} style={styles.actionButtonInner}>
            {subscribing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="lock" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Subscribe to Unlock</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}

      {!hasAccess && (
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color="#2563EB" />
          <Text style={styles.infoText}>
            Subscribe to get access to this content and all other revision kits
          </Text>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
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
    marginTop: 12,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#1F2937',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subject: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  priceContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
  },
  actionButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});


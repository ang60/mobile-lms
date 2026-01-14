import { useEffect, useState } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { subscriptionApi, type SubscriptionPlan } from '@/modules/subscription/services/subscriptionApi';
import { useAuth } from '@/providers/AuthProvider';
import { AppBar } from '@/components/AppBar';

const benefits = [
  'Access to all revision kits',
  'Unlimited downloads',
  'Offline reading mode',
  'Ad-free experience',
  'Priority support',
  'New content every week',
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { token, user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await subscriptionApi.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('[SubscriptionScreen] Failed to load plans:', error);
      Alert.alert('Error', 'Failed to load subscription plans');
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
      // Get premium plan (or first plan if premium doesn't exist)
      const premiumPlan = plans.find((p) => p.id === 'premium') || plans[0];
      
      if (!premiumPlan) {
        Alert.alert('Error', 'No subscription plan available');
        return;
      }

      await subscriptionApi.activate(premiumPlan.id, token);
      
      // Refresh user data to get updated subscription info
      await refreshUser();
      
      Alert.alert(
        'Success!',
        'Your subscription has been activated. You now have access to all content.',
        [
          { text: 'OK', onPress: () => router.back() },
        ]
      );
    } catch (error: any) {
      console.error('[SubscriptionScreen] Subscription failed:', error);
      Alert.alert('Error', error?.message || 'Failed to activate subscription');
    } finally {
      setSubscribing(false);
    }
  };

  const premiumPlan = plans.find((p) => p.id === 'premium') || plans[0];
  const isSubscribed = user?.subscription?.status === 'active';

  return (
    <View style={styles.container}>
      <AppBar title="Subscription" showBack />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <LinearGradient colors={['#2F4BFF', '#7C3AED']} style={styles.hero}>
        <Text style={styles.heroTitle}>Go Premium</Text>
        <Text style={styles.heroSubtitle}>Unlock all revision kits and materials</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      ) : (
        <>
          <View style={styles.planCard}>
            <LinearGradient colors={['#FBBF24', '#F97316']} style={styles.planInner}>
              <Text style={styles.planTitle}>{premiumPlan?.name || 'Premium Plan'}</Text>
              <Text style={styles.planPrice}>
                KES {premiumPlan ? Math.round(premiumPlan.price * 100) : 999}
              </Text>
              <Text style={styles.planPeriod}>per month</Text>
            </LinearGradient>
          </View>

          <View style={styles.benefitList}>
            {benefits.map((benefit) => (
              <View key={benefit} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <FeatherIcon name="check" size={16} color="#16A34A" />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {isSubscribed ? (
            <View style={styles.subscribedCard}>
              <FeatherIcon name="check-circle" size={24} color="#16A34A" />
              <Text style={styles.subscribedText}>You are subscribed!</Text>
              <Text style={styles.subscribedSubtext}>
                Your subscription is active. Enjoy unlimited access to all content.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.9}
              onPress={handleSubscribe}
              disabled={subscribing}
            >
              <LinearGradient colors={['#7C3AED', '#2F4BFF']} style={styles.ctaInner}>
                {subscribing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.ctaText}>Subscribe Now</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </>
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
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 28,
    padding: 24,
    gap: 12,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },
  planCard: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 24,
    shadowColor: '#1F2937',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    overflow: 'hidden',
  },
  planInner: {
    paddingVertical: 28,
    alignItems: 'center',
    gap: 6,
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  planPrice: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  planPeriod: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  benefitList: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#1F2937',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  cta: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 18,
    overflow: 'hidden',
  },
  ctaInner: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
  subscribedCard: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: '#DCFCE7',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  subscribedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
  },
  subscribedSubtext: {
    fontSize: 14,
    color: '#15803D',
    textAlign: 'center',
  },
});


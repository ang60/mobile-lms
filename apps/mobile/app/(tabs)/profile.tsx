import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { AppBar } from '@/components/AppBar';

const menuItems = [
  { 
    icon: 'user', 
    label: 'Edit Profile',
    action: 'edit',
  },
  { 
    icon: 'crown', 
    label: 'Subscription',
    action: 'subscription',
  },
  { 
    icon: 'book', 
    label: 'My Library',
    action: 'library',
  },
  { 
    icon: 'download', 
    label: 'Downloaded Content',
    action: 'downloads',
  },
  { 
    icon: 'shield', 
    label: 'Privacy & Security',
    action: 'privacy',
  },
];

export default function ProfileScreen() {
  const { user, logout, token, isRestoring } = useAuth();
  const router = useRouter();
  
  // Don't show fallback values while loading
  const name = user?.name || (user?.email ? user.email.split('@')[0] : null);
  const email = user?.email || null;
  const initials = name
    ? name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : email
    ? email.slice(0, 2).toUpperCase()
    : '?';

  const isSubscribed = user?.subscription?.status === 'active';
  const subscriptionExpires = user?.subscription?.expiresAt
    ? new Date(user.subscription.expiresAt)
    : null;
  const isExpired = subscriptionExpires ? subscriptionExpires < new Date() : false;
  const subscriptionStatus = isSubscribed && !isExpired ? 'Premium' : 'Free';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'edit':
        Alert.alert('Edit Profile', 'Profile editing will be available soon.');
        break;
      case 'subscription':
        if (isSubscribed && !isExpired) {
          Alert.alert(
            'Subscription Active',
            `Your ${user.subscription?.planId || 'premium'} subscription is active until ${subscriptionExpires ? formatDate(subscriptionExpires) : 'N/A'}.`,
            [{ text: 'OK' }]
          );
        } else {
          router.push('/(tabs)/subscription');
        }
        break;
      case 'library':
        router.push('/(tabs)/library');
        break;
      case 'downloads':
        Alert.alert('Downloaded Content', 'Your downloaded content will appear here.');
        break;
      case 'privacy':
        Alert.alert('Privacy & Security', 'Privacy settings will be available soon.');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <AppBar title="Profile" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <LinearGradient colors={['#2F4BFF', '#7C3AED']} style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        {isRestoring ? (
          <>
            <Text style={styles.heroName}>Loading...</Text>
            <Text style={styles.heroEmail}>Please wait</Text>
          </>
        ) : user ? (
          <>
            <Text style={styles.heroName}>{name || 'User'}</Text>
            <Text style={styles.heroEmail}>{email}</Text>
          </>
        ) : (
          <>
            <Text style={styles.heroName}>Not logged in</Text>
            <Text style={styles.heroEmail}>Please sign in to view your profile</Text>
          </>
        )}
        {isSubscribed && !isExpired ? (
          <TouchableOpacity 
            style={styles.planBadge}
            onPress={() => handleMenuAction('subscription')}
          >
            <Feather name="crown" size={14} color="#FCD34D" />
            <Text style={styles.planText}>{subscriptionStatus} member</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.freeBadge}
            onPress={() => handleMenuAction('subscription')}
          >
            <Feather name="user" size={14} color="#FFFFFF" />
            <Text style={styles.freeText}>{subscriptionStatus} Plan</Text>
          </TouchableOpacity>
        )}
        {isSubscribed && subscriptionExpires && !isExpired && (
          <Text style={styles.expiryText}>
            Expires: {formatDate(subscriptionExpires)}
          </Text>
        )}
      </LinearGradient>

      <View style={styles.menuCard}>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.label} 
            style={styles.menuRow} 
            activeOpacity={0.8}
            onPress={() => handleMenuAction(item.action)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Feather name={item.icon as any} size={18} color="#4F46E5" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {!token && (
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.9}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Login to access your profile</Text>
        </TouchableOpacity>
      )}

      {token && (
        <TouchableOpacity
          style={styles.signOut}
          activeOpacity={0.9}
          onPress={async () => {
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
          }}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  heroEmail: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  planBadge: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  planText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  freeBadge: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  freeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  expiryText: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  loginButton: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  menuCard: {
    marginHorizontal: 20,
    marginTop: 26,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 6,
    shadowColor: '#1F2937',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  signOut: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
});


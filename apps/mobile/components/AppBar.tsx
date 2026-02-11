import { useAuth } from '@/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type AppBarProps = {
  title?: string;
  showBack?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
};

export function AppBar({ title, showBack = false, rightAction }: AppBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Get title from pathname if not provided
  const getTitle = () => {
    if (title) return title;
    
    if (pathname?.includes('/library')) return 'Library';
    if (pathname?.includes('/subscription')) return 'Subscription';
    if (pathname?.includes('/profile')) return 'Profile';
    if (pathname?.includes('/content/')) return 'Content';
    return 'Mobile LMS';
  };

  const displayTitle = getTitle();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <Feather name="book-open" size={24} color="#4F46E5" />
          </View>
        )}

        <Text style={styles.title} numberOfLines={1}>
          {displayTitle}
        </Text>

        {rightAction ? (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Feather name={rightAction.icon as any} size={22} color="#111827" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  logoContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 12,
    textAlign: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  placeholder: {
    width: 40,
  },
});



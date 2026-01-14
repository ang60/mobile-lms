import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const canSubmit = email.length > 0 && password.length >= 6 && !isLoading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    try {
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Unable to sign in.');
    }
  };

  return (
    <LinearGradient colors={['#1F3B95', '#1A1B52']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.headerIcon}>
            <FontAwesome5 name="book-reader" size={48} color="#FFD166" />
          </View>
          <Text style={styles.title}>CPA Excellence</Text>
          <Text style={styles.subtitle}>Master Your CPA Journey</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>

            <View style={styles.inputContainer}>
              <Feather name="mail" size={18} color="#6B7280" />
              <TextInput
                placeholder="your.email@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color="#6B7280" />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setRemember((prev) => !prev)}
                style={[styles.checkbox, remember && styles.checkboxChecked]}
              >
                {remember ? <Feather name="check" size={12} color="#FFFFFF" /> : null}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Remember me</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity>
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.9} onPress={handleLogin} disabled={!canSubmit} style={{ marginTop: 8 }}>
              <LinearGradient
                colors={canSubmit ? ['#7F57FF', '#4F46E5'] : ['#A5B4FC', '#A5B4FC']}
                style={styles.primaryButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.bottomText}>
              Don&apos;t have an account?{' '}
              <Link href="/(auth)/register" style={styles.bottomLink} replace>
                Sign Up
              </Link>
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <MaterialIcons name="auto-stories" size={20} color="#FFFFFF" />
              <Text style={styles.featureText}>Complete Notes</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="file-text" size={20} color="#FFFFFF" />
              <Text style={styles.featureText}>Past Papers</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={20} color="#FFFFFF" />
              <Text style={styles.featureText}>Solutions</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  headerIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: '#1F2937',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#7F57FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#7F57FF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  linkText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomText: {
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 14,
  },
  bottomLink: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  features: {
    marginTop: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
});


import { useAuth } from '@/providers/AuthProvider';
import FeatherIcon from '@expo/vector-icons/Feather';
import FontAwesomeIcon from '@expo/vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
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

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const canSubmit =
    fullName.trim().length > 2 &&
    email.length > 0 &&
    password.length >= 6 &&
    confirm === password &&
    acceptTerms &&
    !isLoading;

  const handleRegister = async () => {
    if (!canSubmit) return;
    try {
      await register(fullName.trim(), email.trim(), password, phone.trim());
    } catch (error) {
      Alert.alert('Registration failed', error instanceof Error ? error.message : 'Unable to create account.');
    }
  };

  return (
    <LinearGradient colors={['#3F2B96', '#1A1B52']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.headerIcon}>
            <FontAwesomeIcon name="graduation-cap" size={48} color="#FFD166" />
          </View>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Start your CPA success story</Text>

          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <FeatherIcon name="user" size={18} color="#6B7280" />
              <TextInput
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <FeatherIcon name="mail" size={18} color="#6B7280" />
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
              <FeatherIcon name="phone" size={18} color="#6B7280" />
              <TextInput
                placeholder="+254 700 000 000"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
              />
            </View>
            <Text style={styles.helperText}>For M-Pesa payments & notifications</Text>
            <View style={styles.inputContainer}>
              <FeatherIcon name="lock" size={18} color="#6B7280" />
              <TextInput
                placeholder="Create a strong password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <FeatherIcon name="lock" size={18} color="#6B7280" />
              <TextInput
                placeholder="Re-enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
                style={styles.input}
              />
            </View>

            <TouchableOpacity style={styles.termsRow} onPress={() => setAcceptTerms((prev) => !prev)}>
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms ? <FeatherIcon name="check" size={12} color="#FFFFFF" /> : null}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={handleRegister} disabled={!canSubmit} style={{ marginTop: 4 }}>
              <LinearGradient
                colors={canSubmit ? ['#7F57FF', '#4F46E5'] : ['#A5B4FC', '#A5B4FC']}
                style={styles.primaryButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.bottomText}>
            Already have an account?{' '}
            <Link href="/(auth)/login" style={styles.bottomLink} replace>
              Sign In
            </Link>
          </Text>
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
    gap: 16,
  },
  headerIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 14,
    shadowColor: '#1F2937',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
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
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: -6,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#7F57FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7F57FF',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
  },
  linkText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  bottomLink: {
    color: '#FFD166',
    fontWeight: '600',
  },
});


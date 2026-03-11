import { AppBar } from '@/components/AppBar';
import { assessmentsApi, type QuestionItem } from '@/modules/assessments/services/assessmentsApi';
import { useAuth } from '@/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AnswerState = Record<string, number>; // questionId -> selectedOptionIndex

export default function TakeQuizScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  const loadQuestions = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await assessmentsApi.getQuestions(id);
      setQuestions(data);
      setAnswers({});
      setCurrentIndex(0);
      setSubmitted(false);
      setScore(null);
    } catch (err) {
      console.error('[TakeQuiz] Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const current = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const selectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      let correct = 0;
      questions.forEach((q) => {
        const selected = answers[q.id];
        if (selected !== undefined && selected === q.correctIndex) correct++;
      });
      setScore({ correct, total: totalQuestions });
      setSubmitted(true);
      if (id && token) {
        try {
          const answersPayload = questions.map((q) => ({
            questionId: q.id,
            selectedIndex: answers[q.id] ?? -1,
          }));
          await assessmentsApi.submitAttempt(id, answersPayload, token);
        } catch (err) {
          console.error('[TakeQuiz] Failed to submit attempt:', err);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppBar title="Quiz" showBack />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#475569" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <AppBar title="Quiz" showBack />
        <View style={styles.centered}>
          <Feather name="alert-circle" size={48} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No questions yet</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (submitted && score !== null) {
    const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <SafeAreaView style={styles.container}>
        <AppBar title="Result" showBack />
        <View style={styles.resultCard}>
          <View style={styles.resultIcon}>
            <Feather name={pct >= 70 ? 'check-circle' : 'info'} size={56} color={pct >= 70 ? '#22c55e' : '#f59e0b'} />
          </View>
          <Text style={styles.resultTitle}>{pct >= 70 ? 'Well done!' : 'Keep practicing'}</Text>
          <Text style={styles.resultScore}>
            {score.correct} / {score.total} correct ({pct}%)
          </Text>
          <TouchableOpacity style={styles.resultButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.resultButtonText}>Back to assessments</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title={`Question ${currentIndex + 1} of ${totalQuestions}`}
        showBack
        onBackPress={handleBack}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{current?.questionText}</Text>
          <View style={styles.options}>
            {(current?.options ?? []).map((option, idx) => {
              const selected = answers[current.id] === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => selectOption(current.id, idx)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <Feather name="check" size={16} color="#fff" /> : null}
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.progressText}>
            <Text style={styles.progressLabel}>Answered {answeredCount} of {totalQuestions}</Text>
          </View>
          <TouchableOpacity
            style={[styles.nextButton, answeredCount === 0 && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={answeredCount === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex < totalQuestions - 1 ? 'Next' : 'Submit'}
            </Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748b' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#475569' },
  backBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#e2e8f0', borderRadius: 12 },
  backBtnText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  questionText: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 20 },
  options: { gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  optionSelected: { borderColor: '#475569', backgroundColor: '#f1f5f9' },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#94a3b8',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: '#475569', borderColor: '#475569' },
  optionText: { fontSize: 16, color: '#0f172a', flex: 1 },
  footer: { marginTop: 24, gap: 12 },
  progressText: {},
  progressLabel: { fontSize: 14, color: '#64748b' },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#475569',
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextButtonDisabled: { opacity: 0.5 },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resultIcon: { marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  resultScore: { fontSize: 18, color: '#475569', marginBottom: 24 },
  resultButton: {
    backgroundColor: '#475569',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  resultButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

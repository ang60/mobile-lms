export type Role = 'student' | 'admin';

export type SubscriptionStatus = 'active' | 'inactive' | 'past_due';

export interface Subscription {
  planId: string;
  status: SubscriptionStatus;
  expiresAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  subscription: Subscription | null;
  library: string[];
  createdAt: string;
  updatedAt: string;
}

export type ContentType =
  | 'pdf'
  | 'epub'
  | 'doc'
  | 'docx'
  | 'ppt'
  | 'pptx'
  | 'txt'
  | 'audio'
  | 'video'
  | 'other';

export interface CourseItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SectionItem {
  id: string;
  courseId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  previewUrl?: string;
  type: ContentType;
  lessons: number;
  courseId?: string;
  sectionId?: string;
  fileId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface CreateContentInput {
  title: string;
  description: string;
  subject: string;
  price: number;
  previewUrl?: string;
  type?: ContentType;
  lessons: number;
  courseId?: string;
  sectionId?: string;
  fileId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface UpdateContentInput extends Partial<CreateContentInput> {
  courseId?: string;
  sectionId?: string;
}

export interface AssessmentItem {
  id: string;
  title: string;
  courseId?: string;
  sectionId?: string;
  courseName: string;
  sectionName: string;
  questions: number;
  timeMinutes: number;
  difficulty: string;
  attempts: number;
  avgScore: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentInput {
  title: string;
  courseId?: string;
  sectionId?: string;
  courseName?: string;
  sectionName?: string;
  questions: number;
  timeMinutes: number;
  difficulty?: string;
}

export interface QuestionItem {
  id: string;
  assessmentId: string;
  order: number;
  questionText: string;
  type: 'mcq' | 'true_false';
  options: string[];
  correctIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionInput {
  assessmentId: string;
  order?: number;
  questionText: string;
  type?: 'mcq' | 'true_false';
  options: string[];
  correctIndex: number;
}

export interface AttemptItem {
  id: string;
  userId: string;
  assessmentId: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentItem {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  planId?: string;
  createdAt: string;
  updatedAt: string;
}




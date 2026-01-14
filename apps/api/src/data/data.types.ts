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

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  previewUrl?: string;
  type: ContentType;
  lessons: number;
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
  fileId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface UpdateContentInput extends Partial<CreateContentInput> {}




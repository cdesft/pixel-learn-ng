export interface School {
  id: string;
  name: string;
  slug: string;
  adminEmail: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  state?: string;
  country: string;
  zipcode?: string;
  createdAt: Date;
  status: 'active' | 'suspended';
  setupComplete: boolean;
}

export interface Student {
  id: string;
  role: 'student';
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  class: string;
  gender: 'Male' | 'Female';
  parentId: string;
  email: string;
  trialStartDate: Date | null;
  trialExpiryDate: Date | null;
  subscriptionStatus: 'pending_trial' | 'trial' | 'active' | 'expired';
  subscriptionExpiryDate: Date | null;
  totalTimeSpent: number;
  lastLogin: Date | null;
  createdAt: Date;
  career: string | null;
  hobbies: string[];
  chatHistory: string[];
}

export interface Parent {
  id: string;
  role: 'parent';
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  zipcode: string;
  country: string;
  childrenIds: string[];
  paymentHistory: Payment[];
  lastLogin: Date | null;
  createdAt: Date;
}

export interface SchoolAdmin {
  id: string;
  role: 'schoolAdmin';
  email: string;
  schoolId: string;
  requiresPasswordChange: boolean;
  createdAt: Date;
}

export interface Payment {
  date: Date;
  amount: number;
  childrenCovered: string[];
  childrenNames: string[];
  status: 'success' | 'failed' | 'pending';
  paystackReference: string;
}

export interface Chat {
  id: string;
  studentId: string;
  studentName: string;
  startedAt: Date;
  lastMessageAt: Date;
  messages: ChatMessage[];
  firstMessagePreview: string;
  totalMessages: number;
  durationMinutes: number;
}

export interface ChatMessage {
  role: 'student' | 'ai';
  text: string;
  timestamp: Date;
}

export type UserRole = 'superadmin' | 'schoolAdmin' | 'parent' | 'student';

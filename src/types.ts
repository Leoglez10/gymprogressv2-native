
export enum Screen {
  ONBOARDING = 'ONBOARDING',
  SIGNUP = 'SIGNUP',
  LOGIN = 'LOGIN',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  GOAL_SELECTION = 'GOAL_SELECTION',
  BODY_DATA = 'BODY_DATA',
  ALIAS_SETTING = 'ALIAS_SETTING',
  DASHBOARD = 'DASHBOARD',
  START_WORKOUT = 'START_WORKOUT',
  CREATE_WORKOUT = 'CREATE_WORKOUT',
  ACTIVE_SESSION = 'ACTIVE_SESSION',
  EXERCISE_LIBRARY = 'EXERCISE_LIBRARY',
  STATS = 'STATS',
  RISK_ANALYSIS = 'RISK_ANALYSIS',
  SUMMARY = 'SUMMARY',
  PROFILE = 'PROFILE',
  MANUAL_LOG = 'MANUAL_LOG'
}

export type GoalType = 'sessions' | 'prs' | 'volume';

export interface GoalSettings {
  targetSessionsPerMonth: number;
  targetVolumePerWeek: number;
  targetPRsPerMonth: number;
  activeGoals: GoalType[];
}

export interface NotificationSettings {
  workoutReminders: boolean;
  weeklySummaries: boolean;
  aiTips: boolean;
}

export interface UserProfile {
  goal: string;
  gender: string;
  age: number;
  weight: number;
  height: number;
  alias: string;
  avatarUrl?: string;
  weightUnit: 'kg' | 'lb';
  goalSettings: GoalSettings;
  notificationSettings: NotificationSettings;
}

export interface WellnessEntry {
  date: string;
  sleep: number;
  stress: number;
  energy: number;
  soreness: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup?: string;
  muscle?: string;
  equipment?: string;
  type?: string;
  difficulty?: string;
  custom?: boolean;
  lastWeight?: number;
  isFavorite?: boolean;
  description?: string;
}

export interface SetData {
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number;
  rir?: number;
}

export interface SessionExercise {
  exercise: Exercise;
  sets: SetData[];
  notes?: string;
}

export interface ExerciseSession {
  id: string;
  exercises: SessionExercise[];
  startTime: number;
  endTime?: number;
  duration?: number;
  totalVolume?: number;
  notes?: string;
}

export interface ExerciseSet {
  weight: number;
  reps: number;
  rpe?: number;
  rir?: number;
  tempo?: string;
  completed?: boolean;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: ExerciseSet[];
  notes?: string;
}

export type PlanType = 'free' | 'trial' | 'pro';

export interface EntitlementsState {
  plan: PlanType;
  trialStartDate?: number;
  trialDurationDays: number;
  usage: {
    aiCalls: number;
    sessionsCompleted: number;
  };
}

export interface OnboardingState {
  hasSeenIntro: boolean;
  hasCompletedTour: boolean;
  dismissedTour: boolean;
  currentStepIndex: number;
}

export interface WorkoutSession {
  id: string;
  routine?: any;
  exercises: WorkoutExercise[];
  startTime: number;
  endTime?: number;
  duration?: number;
  totalVolume?: number;
  notes?: string;
  wellness?: WellnessEntry;
  date?: string;
}

// --- TOUR CONFIGURATION ---

export interface TourStep {
  target: string; // data-tour identifier or ref name in RN
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  badge?: 'PRO' | 'NUEVO' | 'GRATIS';
  screen?: Screen;
}

export interface CustomExerciseEntry {
  exerciseId: string;
  name: string;
  sets: Array<{
    weight: number;
    reps: number;
    completed?: boolean;
    duration?: number;
  }>;
}

export interface CustomRoutine {
  id: string;
  name: string;
  exercises: CustomExerciseEntry[];
  mainMuscleGroups?: string[];
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- NAVIGATION TYPES (nuevo para React Navigation) ---

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ActiveSession: { routine: CustomRoutine | null };
  Summary: { sessionId: string };
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  GoalSelection: undefined;
  BodyData: undefined;
  AliasSetting: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  StartWorkout: undefined;
  Stats: undefined;
  Profile: undefined;
};


export type OnboardingStackParamList = {
  GoalSelection: undefined;
  BodyData: { goal: string };
  AliasSetting: { goal: string; age: number; weight: number; height: number };
};

export type WorkoutStackParamList = {
  StartWorkout: undefined;
  CreateWorkout: undefined;
  ActiveSession: { routine?: CustomRoutine | null; routineId?: string; freeSession?: boolean };
  ExerciseLibrary: undefined;
  Summary: { sessionId: string };
  WorkoutHome: undefined;
  ManualLog: Record<string, any>;
};

// Dashboard Widget Types
export type WidgetId = 'streak' | 'volume' | 'fatigue' | 'goals' | 'nextWorkout' | 'muscleMap' | 'quickStart' | 'weekly_progress' | 'wellness';

export interface WidgetConfig {
  id: WidgetId;
  visible?: boolean;
  isVisible?: boolean;
  order: number;
}

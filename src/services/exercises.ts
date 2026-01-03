import { Exercise } from '../types';
import { storage, STORAGE_KEYS } from './storage';
import { supabase } from '../lib/supabase';

// ============ EJERCICIOS PREDEFINIDOS DEL SISTEMA (~80 ejercicios) ============

export const DEFAULT_EXERCISES: Exercise[] = [
  // ==================== PUSH ====================

  // PECHO (12 ejercicios)
  { id: 'default-1', name: 'Press de Banca', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-2', name: 'Press Inclinado con Barra', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-3', name: 'Press Declinado con Barra', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-4', name: 'Press de Banca con Mancuernas', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-5', name: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-6', name: 'Press Declinado con Mancuernas', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-7', name: 'Aperturas con Mancuernas', muscleGroup: 'Pecho', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-8', name: 'Aperturas Inclinadas', muscleGroup: 'Pecho', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-9', name: 'Fondos en Paralelas', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Peso Corporal', custom: false },
  { id: 'default-10', name: 'Cruces en Polea Alta', muscleGroup: 'Pecho', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-11', name: 'Cruces en Polea Baja', muscleGroup: 'Pecho', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-12', name: 'Press en Máquina', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-13', name: 'Pec Deck (Mariposa)', muscleGroup: 'Pecho', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-14', name: 'Flexiones', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },
  { id: 'default-15', name: 'Flexiones Diamante', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Peso Corporal', custom: false },

  // HOMBROS (12 ejercicios)
  { id: 'default-16', name: 'Press Militar con Barra', muscleGroup: 'Hombros', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-17', name: 'Press Militar con Mancuernas', muscleGroup: 'Hombros', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-18', name: 'Press Arnold', muscleGroup: 'Hombros', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-19', name: 'Elevaciones Laterales', muscleGroup: 'Hombros', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-20', name: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-21', name: 'Elevaciones Frontales', muscleGroup: 'Hombros', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-22', name: 'Pájaros (Rear Delt)', muscleGroup: 'Hombros', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-23', name: 'Pájaros en Máquina', muscleGroup: 'Hombros', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-24', name: 'Face Pulls', muscleGroup: 'Hombros', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-25', name: 'Remo al Mentón', muscleGroup: 'Hombros', category: 'Pull', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-26', name: 'Press en Máquina de Hombros', muscleGroup: 'Hombros', category: 'Push', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-27', name: 'Encogimientos de Hombros', muscleGroup: 'Hombros', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },

  // TRÍCEPS (8 ejercicios)
  { id: 'default-28', name: 'Extensiones de Tríceps en Polea', muscleGroup: 'Brazos', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-29', name: 'Extensiones de Tríceps con Cuerda', muscleGroup: 'Brazos', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-30', name: 'Press Francés', muscleGroup: 'Brazos', category: 'Push', type: 'Aislamiento', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-31', name: 'Press Francés con Mancuerna', muscleGroup: 'Brazos', category: 'Push', type: 'Aislamiento', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-32', name: 'Fondos en Banco', muscleGroup: 'Brazos', category: 'Push', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },
  { id: 'default-33', name: 'Patada de Tríceps', muscleGroup: 'Brazos', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-34', name: 'Press Cerrado', muscleGroup: 'Brazos', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-35', name: 'Extensión de Tríceps Overhead', muscleGroup: 'Brazos', category: 'Push', type: 'Aislamiento', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },

  // ==================== PULL ====================

  // ESPALDA (14 ejercicios)
  { id: 'default-36', name: 'Peso Muerto Convencional', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Avanzado', equipment: 'Barra', custom: false },
  { id: 'default-37', name: 'Peso Muerto Sumo', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Avanzado', equipment: 'Barra', custom: false },
  { id: 'default-38', name: 'Dominadas', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Peso Corporal', custom: false },
  { id: 'default-39', name: 'Dominadas Supinas', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Peso Corporal', custom: false },
  { id: 'default-40', name: 'Dominadas Neutras', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Peso Corporal', custom: false },
  { id: 'default-41', name: 'Remo con Barra', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-42', name: 'Remo Pendlay', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Avanzado', equipment: 'Barra', custom: false },
  { id: 'default-43', name: 'Remo con Mancuerna', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-44', name: 'Jalón al Pecho', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-45', name: 'Jalón Agarre Cerrado', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-46', name: 'Jalón Tras Nuca', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Polea', custom: false },
  { id: 'default-47', name: 'Remo en Polea Baja', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-48', name: 'Remo en Máquina', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-49', name: 'Pullover con Mancuerna', muscleGroup: 'Espalda', category: 'Pull', type: 'Aislamiento', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-50', name: 'Remo T-Bar', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },

  // BÍCEPS (8 ejercicios)
  { id: 'default-51', name: 'Curl con Barra', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Barra', custom: false },
  { id: 'default-52', name: 'Curl con Barra Z', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Barra', custom: false },
  { id: 'default-53', name: 'Curl con Mancuernas', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-54', name: 'Curl Martillo', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-55', name: 'Curl Concentrado', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-56', name: 'Curl en Predicador', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Barra', custom: false },
  { id: 'default-57', name: 'Curl en Polea', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-58', name: 'Curl Inclinado', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },

  // ==================== LEGS ====================

  // CUÁDRICEPS (10 ejercicios)
  { id: 'default-59', name: 'Sentadilla con Barra', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Avanzado', equipment: 'Barra', custom: false },
  { id: 'default-60', name: 'Sentadilla Frontal', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Avanzado', equipment: 'Barra', custom: false },
  { id: 'default-61', name: 'Sentadilla Goblet', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-62', name: 'Sentadilla Búlgara', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-63', name: 'Prensa de Piernas', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Máquina', custom: false },
  { id: 'default-64', name: 'Prensa 45°', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Máquina', custom: false },
  { id: 'default-65', name: 'Hack Squat', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Máquina', custom: false },
  { id: 'default-66', name: 'Extensiones de Cuádriceps', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-67', name: 'Zancadas con Mancuernas', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-68', name: 'Zancadas Caminando', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-69', name: 'Step Ups', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-70', name: 'Sentadilla en Smith', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Máquina', custom: false },

  // FEMORALES / GLÚTEOS (8 ejercicios)
  { id: 'default-71', name: 'Peso Muerto Rumano', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-72', name: 'Peso Muerto Rumano con Mancuernas', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-73', name: 'Curl Femoral Acostado', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-74', name: 'Curl Femoral Sentado', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-75', name: 'Hip Thrust con Barra', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-76', name: 'Hip Thrust en Máquina', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-77', name: 'Patada de Glúteo en Polea', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-78', name: 'Buenos Días', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-79', name: 'Glute Bridge', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },

  // PANTORRILLAS (4 ejercicios)
  { id: 'default-80', name: 'Elevación de Pantorrillas de Pie', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-81', name: 'Elevación de Pantorrillas Sentado', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-82', name: 'Elevación de Pantorrillas en Prensa', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-83', name: 'Elevación de Pantorrillas Unilateral', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },

  // ==================== CORE ====================

  // ABDOMINALES (10 ejercicios)
  { id: 'default-84', name: 'Plancha Frontal', muscleGroup: 'Core', category: 'Core', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },
  { id: 'default-85', name: 'Plancha Lateral', muscleGroup: 'Core', category: 'Core', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },
  { id: 'default-86', name: 'Crunch Abdominal', muscleGroup: 'Core', category: 'Core', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },
  { id: 'default-87', name: 'Crunch en Polea Alta', muscleGroup: 'Core', category: 'Core', type: 'Aislamiento', difficulty: 'Intermedio', equipment: 'Polea', custom: false },
  { id: 'default-88', name: 'Elevación de Piernas Colgado', muscleGroup: 'Core', category: 'Core', type: 'Aislamiento', difficulty: 'Intermedio', equipment: 'Peso Corporal', custom: false },
  { id: 'default-89', name: 'Elevación de Piernas Acostado', muscleGroup: 'Core', category: 'Core', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },
  { id: 'default-90', name: 'Russian Twist', muscleGroup: 'Core', category: 'Core', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },
  { id: 'default-91', name: 'Ab Wheel Rollout', muscleGroup: 'Core', category: 'Core', type: 'Aislamiento', difficulty: 'Avanzado', equipment: 'Otro', custom: false },
  { id: 'default-92', name: 'Dead Bug', muscleGroup: 'Core', category: 'Core', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },
  { id: 'default-93', name: 'Mountain Climbers', muscleGroup: 'Core', category: 'Core', type: 'Cardio', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },
  { id: 'default-94', name: 'Bicycle Crunch', muscleGroup: 'Core', category: 'Core', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },
  { id: 'default-95', name: 'Pallof Press', muscleGroup: 'Core', category: 'Core', type: 'Aislamiento', difficulty: 'Intermedio', equipment: 'Polea', custom: false },
];

// ============ INTERFACES PARA SUPABASE ============

interface ExerciseDB {
  id: string;
  user_id: string;
  name: string;
  muscle_group: string;
  category: string;
  equipment?: string;
  type?: string;
  difficulty?: string;
  description?: string;
  is_favorite: boolean;
  last_weight?: number;
  created_at: string;
  updated_at: string;
}

interface ExerciseUserState {
  exercise_id: string;
  user_id: string;
  is_favorite: boolean;
  last_weight?: number;
}

// ============ STORAGE KEYS ============

const EXERCISES_KEY = STORAGE_KEYS?.EXERCISES || 'gymProgress_exercises';
const USER_EXERCISE_STATES_KEY = 'gymProgress_user_exercise_states';

// ============ HELPERS ============

const exerciseToDBFormat = (exercise: Exercise, userId: string): Omit<ExerciseDB, 'created_at' | 'updated_at'> => ({
  id: exercise.id,
  user_id: userId,
  name: exercise.name,
  muscle_group: exercise.muscleGroup || 'Otros',
  category: exercise.category,
  equipment: exercise.equipment,
  type: exercise.type,
  difficulty: exercise.difficulty,
  description: exercise.description,
  is_favorite: exercise.isFavorite || false,
  last_weight: exercise.lastWeight,
});

const dbToExerciseFormat = (db: ExerciseDB): Exercise => ({
  id: db.id,
  name: db.name,
  muscleGroup: db.muscle_group,
  category: db.category,
  equipment: db.equipment,
  type: db.type,
  difficulty: db.difficulty,
  description: db.description,
  isFavorite: db.is_favorite,
  lastWeight: db.last_weight,
  custom: true,
});

// ============ SERVICIO DE EJERCICIOS ============

export const exerciseService = {

  // ========== OBTENER TODOS LOS EJERCICIOS ==========
  /**
   * Obtiene todos los ejercicios: predefinidos + personalizados
   * Combina con estados guardados (favoritos, último peso)
   */
  async getAllExercises(): Promise<Exercise[]> {
    try {
      // 1. Obtener ejercicios custom del storage local
      const customExercises = await storage.get<Exercise[]>(EXERCISES_KEY) || [];

      // 2. Obtener estados de usuario (favoritos/pesos de ejercicios del sistema)
      const userStates = await storage.get<Record<string, { isFavorite?: boolean; lastWeight?: number }>>(USER_EXERCISE_STATES_KEY) || {};

      // 3. Aplicar estados a ejercicios predefinidos
      const systemExercisesWithState = DEFAULT_EXERCISES.map(ex => ({
        ...ex,
        isFavorite: userStates[ex.id]?.isFavorite || false,
        lastWeight: userStates[ex.id]?.lastWeight,
      }));

      // 4. Combinar: custom primero, luego sistema
      // IMPORTANTE: Filtrar duplicados. Si un ejercicio custom tiene el mismo ID que uno del sistema,
      // o si hay duplicados en custom, debemos limpiar.

      const allExercises = [...customExercises, ...systemExercisesWithState];
      const uniqueExercisesMap = new Map<string, Exercise>();

      allExercises.forEach(ex => {
        // Si ya existe (por ID), sobrescribir (custom debería tener prioridad si coincide ID,
        // pero en teoría IDs son distintos: 'default-X' vs 'custom-Y')
        // Si por error se guardó un default como custom, esto lo maneja.
        uniqueExercisesMap.set(ex.id, ex);
      });

      return Array.from(uniqueExercisesMap.values());
    } catch (error) {
      console.error('Error loading exercises:', error);
      return DEFAULT_EXERCISES;
    }
  },

  // ========== OBTENER SOLO EJERCICIOS PERSONALIZADOS ==========
  async getCustomExercises(): Promise<Exercise[]> {
    try {
      return await storage.get<Exercise[]>(EXERCISES_KEY) || [];
    } catch (error) {
      console.error('Error loading custom exercises:', error);
      return [];
    }
  },

  // ========== CREAR EJERCICIO PERSONALIZADO ==========
  async createExercise(exercise: Omit<Exercise, 'id' | 'custom'>): Promise<Exercise> {
    const newExercise: Exercise = {
      ...exercise,
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Ensure unique ID
      custom: true,
      isFavorite: false,
    };

    try {
      // 1. Guardar en storage local
      const existing = await this.getCustomExercises();
      await storage.set(EXERCISES_KEY, [...existing, newExercise]);

      // 2. Sincronizar con Supabase si hay sesión
      // No esperamos a que termine para retornar, optimizamos la UI
      this.syncExerciseToCloud(newExercise).catch(err => {
        console.warn('Background sync failed for new exercise:', err);
      });

      return newExercise;
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  },

  // ========== ACTUALIZAR EJERCICIO ==========
  async updateExercise(exerciseId: string, updates: Partial<Exercise>): Promise<void> {
    try {
      if (exerciseId.startsWith('default-')) {
        // Es un ejercicio del sistema, solo guardar estados
        const userStates = await storage.get<Record<string, any>>(USER_EXERCISE_STATES_KEY) || {};
        userStates[exerciseId] = {
          ...userStates[exerciseId],
          isFavorite: updates.isFavorite,
          lastWeight: updates.lastWeight,
        };
        await storage.set(USER_EXERCISE_STATES_KEY, userStates);
      } else {
        // Es un ejercicio custom, actualizar completo
        const exercises = await this.getCustomExercises();
        const idx = exercises.findIndex(e => e.id === exerciseId);
        if (idx !== -1) {
          exercises[idx] = { ...exercises[idx], ...updates };
          await storage.set(EXERCISES_KEY, exercises);

          // Sincronizar con Supabase
          await this.syncExerciseToCloud(exercises[idx]);
        }
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  },

  // ========== ELIMINAR EJERCICIO PERSONALIZADO ==========
  async deleteExercise(exerciseId: string): Promise<void> {
    if (exerciseId.startsWith('default-')) {
      throw new Error('No se pueden eliminar ejercicios del sistema');
    }

    try {
      const exercises = await this.getCustomExercises();
      const filtered = exercises.filter(e => e.id !== exerciseId);
      await storage.set(EXERCISES_KEY, filtered);

      // Eliminar de Supabase
      await this.deleteExerciseFromCloud(exerciseId);
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  },

  // ========== TOGGLE FAVORITO ==========
  async toggleFavorite(exerciseId: string): Promise<boolean> {
    try {
      if (exerciseId.startsWith('default-')) {
        // Ejercicio del sistema
        const userStates = await storage.get<Record<string, any>>(USER_EXERCISE_STATES_KEY) || {};
        const currentFav = userStates[exerciseId]?.isFavorite || false;
        userStates[exerciseId] = {
          ...userStates[exerciseId],
          isFavorite: !currentFav,
        };
        await storage.set(USER_EXERCISE_STATES_KEY, userStates);
        return !currentFav;
      } else {
        // Ejercicio custom
        const exercises = await this.getCustomExercises();
        const idx = exercises.findIndex(e => e.id === exerciseId);
        if (idx !== -1) {
          exercises[idx].isFavorite = !exercises[idx].isFavorite;
          await storage.set(EXERCISES_KEY, exercises);
          await this.syncExerciseToCloud(exercises[idx]);
          return exercises[idx].isFavorite || false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  },

  // ========== ACTUALIZAR ÚLTIMO PESO ==========
  async updateLastWeight(exerciseId: string, weight: number): Promise<void> {
    await this.updateExercise(exerciseId, { lastWeight: weight });
  },

  // ========== SINCRONIZACIÓN CON SUPABASE ==========

  async syncExerciseToCloud(exercise: Exercise): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // No hay sesión, no sincronizar

      const dbExercise = exerciseToDBFormat(exercise, user.id);

      const { error } = await supabase
        .from('custom_exercises')
        .upsert({
          ...dbExercise,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (error) {
        console.warn('Error syncing exercise to cloud:', error.message);
      }
    } catch (error) {
      console.warn('Cloud sync failed (offline?):', error);
    }
  },

  async deleteExerciseFromCloud(exerciseId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('custom_exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('user_id', user.id);

      if (error) {
        console.warn('Error deleting exercise from cloud:', error.message);
      }
    } catch (error) {
      console.warn('Cloud delete failed:', error);
    }
  },

  // ========== SINCRONIZAR TODO DESDE LA NUBE ==========
  async syncFromCloud(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cloudExercises, error } = await supabase
        .from('custom_exercises')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.warn('Error fetching from cloud:', error.message);
        return;
      }

      // Convertir a formato local (si es null/vacio usar array vacio)
      const exercises = (cloudExercises || []).map(dbToExerciseFormat);

      // Merge con ejercicios locales (cloud tiene prioridad)
      const localExercises = await this.getCustomExercises();
      const cloudIds = new Set(exercises.map(e => e.id));
      const localOnly = localExercises.filter(e => !cloudIds.has(e.id));

      // Guardar merge
      await storage.set(EXERCISES_KEY, [...exercises, ...localOnly]);

      // Subir los que solo están local (esto subirá los 90+ ejercicios la primera vez)
      if (localOnly.length > 0) {
        console.log(`Syncing ${localOnly.length} local exercises to cloud...`);
        for (const ex of localOnly) {
          await this.syncExerciseToCloud(ex);
        }
      }
    } catch (error) {
      console.warn('Cloud sync failed:', error);
    }
  },

  // ========== VERIFICAR DUPLICADOS ==========
  async checkDuplicate(name: string): Promise<boolean> {
    const all = await this.getAllExercises();
    const normalized = name.toLowerCase().trim();
    return all.some(e => e.name.toLowerCase().trim() === normalized);
  },

  // ========== BÚSQUEDA FUZZY ==========
  fuzzySearch(exercises: Exercise[], searchTerm: string): Exercise[] {
    if (!searchTerm.trim()) return exercises;

    const terms = searchTerm.toLowerCase().split(' ').filter(Boolean);

    return exercises.filter(ex => {
      const name = ex.name.toLowerCase();
      const muscle = (ex.muscleGroup || '').toLowerCase();
      const equipment = (ex.equipment || '').toLowerCase();

      // Cada término debe coincidir con algo
      return terms.every(term =>
        name.includes(term) ||
        muscle.includes(term) ||
        equipment.includes(term)
      );
    }).sort((a, b) => {
      // Ordenar por relevancia: coincidencias exactas primero
      const aExact = a.name.toLowerCase().includes(searchTerm.toLowerCase());
      const bExact = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.name.localeCompare(b.name);
    });
  },
};

export default exerciseService;

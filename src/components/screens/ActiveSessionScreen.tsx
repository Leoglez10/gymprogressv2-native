import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  Vibration,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  CustomRoutine,
  Exercise,
  WorkoutStackParamList,
  SetData,
  WorkoutSession,
  SessionExercise,
} from '../../types';
import { storage } from '../../services/storage';
import { exerciseService } from '../../services/exercises';

// Local type for active session exercises
interface ActiveSetData {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number;
}

interface ActiveExerciseSession {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: ActiveSetData[];
  restTime: number;
}

const { width } = Dimensions.get('window');

const ALL_MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];
const CATEGORIES = ['Push', 'Pull', 'Legs', 'Core'] as const;

const getCategoryColor = (category?: string): string => {
  const map: Record<string, string> = {
    'Push': '#ef4444',
    'Pull': '#3b82f6',
    'Legs': '#22c55e',
    'Core': '#eab308',
  };
  return map[category || ''] || '#FFEF0A';
};

const getMuscleIcon = (muscle: string): string => {
  const map: Record<string, string> = {
    'Pecho': 'fitness-center',
    'Espalda': 'accessibility',
    'Piernas': 'directions-run',
    'Hombros': 'sports-handball',
    'Brazos': 'sports-mma',
    'Core': 'self-improvement',
    'Otros': 'sports-gymnastics',
  };
  return map[muscle] || 'sports-gymnastics';
};

type ActiveSessionRouteProp = RouteProp<WorkoutStackParamList, 'ActiveSession'>;

export default function ActiveSessionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();
  const route = useRoute<ActiveSessionRouteProp>();
  const insets = useSafeAreaInsets();

  const { routineId, freeSession } = route.params || {};

  // States
  const [routine, setRoutine] = useState<CustomRoutine | null>(null);
  const [exercises, setExercises] = useState<ActiveExerciseSession[]>([]);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [restTarget, setRestTarget] = useState(90);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState('');

  // Estados para el modal de ejercicios mejorado
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateName, setQuickCreateName] = useState('');
  const [quickCreateMuscle, setQuickCreateMuscle] = useState('');

  // Estados para cronómetro de descanso automático
  const [autoRestTimer, setAutoRestTimer] = useState(true); // Toggle on/off
  const [restTimerDuration, setRestTimerDuration] = useState(90); // Duración default

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load routine and exercises
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar ejercicios usando el servicio centralizado
        const allLoadedExercises = await exerciseService.getAllExercises();
        setAllExercises(allLoadedExercises);

        if (routineId) {
          const routines = await storage.get('gymProgress_custom_routines');
          const found = routines?.find((r: CustomRoutine) => r.id === routineId);
          if (found) {
            setRoutine(found);
            // Initialize exercise sessions from routine
            const initialExercises: ActiveExerciseSession[] = found.exercises.map((ex: any) => ({
              exerciseId: ex.exerciseId || ex.id,
              name: ex.name,
              muscleGroup: ex.muscleGroup || 'Otros',
              sets: Array(ex.sets || 3).fill(null).map((_: any, i: number) => ({
                id: `set-${i}`,
                weight: ex.lastWeight || 0,
                reps: ex.targetReps || 10,
                completed: false,
              })),
              restTime: ex.restTime || 90,
            }));
            setExercises(initialExercises);
          }
        } else if (freeSession) {
          // Start with empty session
          setExercises([]);
        }
      } catch (error) {
        console.error('Error loading session data:', error);
      }
    };

    loadData();
  }, [routineId, freeSession]);

  // Main timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime]);

  // Rest timer
  useEffect(() => {
    if (isResting) {
      restTimerRef.current = setInterval(() => {
        setRestTime(prev => {
          if (prev >= restTarget) {
            // Vibrate when rest is done
            if (Platform.OS !== 'web') {
              Vibration.vibrate([0, 500, 200, 500]);
            }
            setIsResting(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    }

    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [isResting, restTarget]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatRestTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = exercises[activeExerciseIdx];

  // Update set data
  const updateSet = (setIdx: number, field: 'weight' | 'reps', value: number) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[activeExerciseIdx] = {
        ...updated[activeExerciseIdx],
        sets: updated[activeExerciseIdx].sets.map((s, i) =>
          i === setIdx ? { ...s, [field]: value } : s
        ),
      };
      return updated;
    });
  };

  // Complete set
  const completeSet = (setIdx: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const set = updated[activeExerciseIdx].sets[setIdx];
      updated[activeExerciseIdx] = {
        ...updated[activeExerciseIdx],
        sets: updated[activeExerciseIdx].sets.map((s, i) =>
          i === setIdx ? { ...s, completed: !s.completed } : s
        ),
      };
      return updated;
    });

    // Start rest timer if set was completed AND auto rest timer is enabled
    if (!currentExercise.sets[setIdx].completed && autoRestTimer) {
      setRestTarget(restTimerDuration);
      setRestTime(0);
      setIsResting(true);
    }
  };

  // Add set
  const addSet = () => {
    setExercises(prev => {
      const updated = [...prev];
      const lastSet = updated[activeExerciseIdx].sets[updated[activeExerciseIdx].sets.length - 1];
      updated[activeExerciseIdx] = {
        ...updated[activeExerciseIdx],
        sets: [
          ...updated[activeExerciseIdx].sets,
          {
            id: `set-${Date.now()}`,
            weight: lastSet?.weight || 0,
            reps: lastSet?.reps || 10,
            completed: false,
          },
        ],
      };
      return updated;
    });
  };

  // Remove set
  const removeSet = (setIdx: number) => {
    if (exercises[activeExerciseIdx].sets.length <= 1) return;

    setExercises(prev => {
      const updated = [...prev];
      updated[activeExerciseIdx] = {
        ...updated[activeExerciseIdx],
        sets: updated[activeExerciseIdx].sets.filter((_, i) => i !== setIdx),
      };
      return updated;
    });
  };

  // Add exercise from library
  const addExercise = (exercise: Exercise) => {
    const newExerciseSession: ActiveExerciseSession = {
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup || 'Otros',
      sets: Array(3).fill(null).map((_, i) => ({
        id: `set-${Date.now()}-${i}`,
        weight: exercise.lastWeight || 0, // Usar el último peso conocido
        reps: 10,
        completed: false,
      })),
      restTime: 90,
    };

    setExercises(prev => {
      const updated = [...prev, newExerciseSession];
      // Cambiar al nuevo ejercicio después de actualizar el estado
      setTimeout(() => setActiveExerciseIdx(updated.length - 1), 0);
      return updated;
    });
    setShowExerciseModal(false);
    // Reset filters
    setExerciseSearch('');
    setSelectedMuscleFilter(null);
    setSelectedCategoryFilter(null);
  };

  // Filtrar ejercicios en el modal
  const filteredModalExercises = useMemo(() => {
    const searched = exerciseSearch.trim()
      ? exerciseService.fuzzySearch(allExercises, exerciseSearch)
      : allExercises;
    
    return searched.filter(ex => {
      const matchMuscle = !selectedMuscleFilter || ex.muscleGroup === selectedMuscleFilter;
      const matchCategory = !selectedCategoryFilter || ex.category === selectedCategoryFilter;
      return matchMuscle && matchCategory;
    });
  }, [allExercises, exerciseSearch, selectedMuscleFilter, selectedCategoryFilter]);

  // Crear ejercicio rápido
  const handleQuickCreate = async () => {
    if (!quickCreateName.trim()) {
      Alert.alert('Error', 'El nombre del ejercicio es requerido');
      return;
    }
    if (!quickCreateMuscle) {
      Alert.alert('Error', 'Selecciona un grupo muscular');
      return;
    }

    // Determinar categoría basada en grupo muscular
    const getCategoryFromMuscle = (muscle: string): string => {
      const map: Record<string, string> = {
        'Pecho': 'Push',
        'Hombros': 'Push',
        'Espalda': 'Pull',
        'Piernas': 'Legs',
        'Brazos': quickCreateName.toLowerCase().includes('curl') || quickCreateName.toLowerCase().includes('bíceps') ? 'Pull' : 'Push',
        'Core': 'Core',
      };
      return map[muscle] || 'Push';
    };

    try {
      // Usar exerciseService para crear y sincronizar con Supabase
      const newExercise = await exerciseService.createExercise({
        name: quickCreateName.trim(),
        muscleGroup: quickCreateMuscle,
        category: getCategoryFromMuscle(quickCreateMuscle),
        type: 'Compuesto',
        difficulty: 'Intermedio',
        equipment: 'Otro',
        description: '',
      });

      // Actualizar lista local
      setAllExercises(prev => [...prev, newExercise]);

      // Añadir a la sesión
      addExercise(newExercise);

      // Reset form
      setShowQuickCreate(false);
      setQuickCreateName('');
      setQuickCreateMuscle('');

      Alert.alert('Ejercicio Creado', `"${newExercise.name}" se ha añadido y sincronizado`);
    } catch (error) {
      console.error('Error creating exercise:', error);
      Alert.alert('Error', 'No se pudo crear el ejercicio');
    }
  };

  // Remove exercise
  const removeExercise = (idx: number) => {
    if (exercises.length <= 1) {
      Alert.alert('Aviso', 'Debes tener al menos un ejercicio');
      return;
    }

    setExercises(prev => prev.filter((_, i) => i !== idx));
    if (activeExerciseIdx >= exercises.length - 1) {
      setActiveExerciseIdx(Math.max(0, exercises.length - 2));
    }
  };

  // Calculate stats
  const sessionStats = useMemo(() => {
    let totalVolume = 0;
    let completedSets = 0;
    let totalSets = 0;

    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        totalSets++;
        if (set.completed) {
          completedSets++;
          totalVolume += (set.weight || 0) * (set.reps || 0);
        }
      });
    });

    return { totalVolume, completedSets, totalSets };
  }, [exercises]);

  // Finish workout
  const finishWorkout = async () => {
    try {
      const sessionExercises = exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets.filter((s: ActiveSetData) => s.completed).map((s: ActiveSetData) => ({
          id: s.id,
          weight: s.weight,
          reps: s.reps,
          completed: s.completed,
        })),
      }));

      const session = {
        id: `session-${Date.now()}`,
        date: new Date().toISOString(),
        duration: elapsedTime,
        volume: sessionStats.totalVolume,
        exercises: sessionExercises,
        routineId: routineId || undefined,
        routineName: routine?.name,
        notes,
      };

      // Save to history
      const history = await storage.get('gymProgress_workout_history') || [];
      await storage.set('gymProgress_workout_history', [session, ...history]);

      // Update exercise last weights using service to sync properly
      const weightUpdates = exercises.map(async (ex) => {
        const maxWeight = Math.max(...ex.sets.filter(s => s.completed).map(s => s.weight || 0), 0);
        if (maxWeight > 0) {
          await exerciseService.updateLastWeight(ex.exerciseId, maxWeight);
        }
      });

      await Promise.all(weightUpdates);

      // Navigate to summary
      navigation.replace('Summary', { sessionId: session.id });
    } catch (error) {
      console.error('Error finishing workout:', error);
      Alert.alert('Error', 'No se pudo guardar el entrenamiento');
    }
  };

  // Cancel workout
  const cancelWorkout = () => {
    Alert.alert(
      'Cancelar Entrenamiento',
      '¿Estás seguro? Se perderá todo el progreso.',
      [
        { text: 'Continuar', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="px-6 py-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={cancelWorkout} className="py-2 flex-row items-center gap-1">
            <MaterialIcons name="close" size={20} color="#ef4444" />
            <Text className="text-red-500 font-semibold text-base">Cancelar</Text>
          </TouchableOpacity>

          {/* Cronómetro Principal Rediseñado */}
          <View className="items-center">
            <View className="bg-zinc-900/60 px-6 py-3 rounded-3xl" style={{ shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }}>
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 bg-[#FFEF0A] rounded-full" style={{ shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 }} />
                <Text className="text-white text-3xl font-bold" style={{ fontVariant: ['tabular-nums'], letterSpacing: 1 }}>{formatTime(elapsedTime)}</Text>
              </View>
            </View>
            <Text className="text-zinc-500 text-xs font-medium mt-2">Duración</Text>
          </View>

          <TouchableOpacity
            className="bg-[#FFEF0A] px-6 py-3 rounded-full flex-row items-center gap-2"
            onPress={() => setShowFinishModal(true)}
            activeOpacity={0.75}
            style={{ shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}
          >
            <MaterialIcons name="check" size={20} color="#000" />
            <Text className="text-black font-semibold text-base">Terminar</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Descanso Automático - Estilo iOS */}
        <View className="mx-4 mt-4 bg-zinc-900/80 rounded-2xl p-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className={`w-10 h-10 rounded-xl items-center justify-center ${autoRestTimer ? 'bg-[#FFEF0A]/15' : 'bg-zinc-800'}`}>
                <MaterialIcons name="timer" size={22} color={autoRestTimer ? '#FFEF0A' : '#666'} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">Descanso Automático</Text>
                <Text className="text-zinc-500 text-xs">{formatRestTime(restTimerDuration)} al completar set</Text>
              </View>
            </View>

            {/* iOS Toggle Switch */}
            <TouchableOpacity
              onPress={() => setAutoRestTimer(!autoRestTimer)}
              activeOpacity={0.8}
            >
              <View
                className={`w-14 h-8 rounded-full p-1 ${autoRestTimer ? 'bg-[#FFEF0A]' : 'bg-zinc-700'}`}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 1 }}
              >
                <View
                  className={`w-6 h-6 rounded-full bg-white ${autoRestTimer ? 'ml-auto' : ''}`}
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 }}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Selector de Duración - Solo visible cuando está activo */}
          {autoRestTimer && (
            <View className="flex-row gap-2 mt-4">
              {[60, 90, 120, 180].map(secs => (
                <TouchableOpacity
                  key={secs}
                  className={`flex-1 py-2.5 rounded-xl ${restTimerDuration === secs ? 'bg-[#FFEF0A]' : 'bg-zinc-800'}`}
                  onPress={() => setRestTimerDuration(secs)}
                  activeOpacity={0.7}
                >
                  <Text className={`text-center font-bold text-sm ${restTimerDuration === secs ? 'text-black' : 'text-zinc-400'}`}>
                    {secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Rest Timer Overlay */}
      {isResting && (
        <View
          className="absolute left-0 right-0 bg-[#FFEF0A] z-10 py-5 px-6"
          style={{
            top: insets.top,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-black/10 rounded-full items-center justify-center">
                <MaterialIcons name="self-improvement" size={28} color="#000" />
              </View>
              <View>
                <Text className="text-black text-3xl font-semibold" style={{ fontVariant: ['tabular-nums'] }}>{formatRestTime(restTime)}</Text>
                <Text className="text-black/60 text-sm font-medium">de {formatRestTime(restTarget)}</Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="bg-black/10 px-4 py-2.5 rounded-full"
                onPress={() => setRestTime(prev => Math.max(0, prev - 15))}
              >
                <Text className="text-black font-semibold">-15s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-black/10 px-4 py-2.5 rounded-full"
                onPress={() => setRestTarget(prev => prev + 15)}
              >
                <Text className="text-black font-semibold">+15s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-black px-4 py-2.5 rounded-full flex-row items-center gap-1"
                onPress={() => setIsResting(false)}
              >
                <MaterialIcons name="skip-next" size={18} color="#FFEF0A" />
                <Text className="text-[#FFEF0A] font-semibold">Saltar</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Progress bar */}
          <View className="h-1.5 bg-black/20 rounded-full mt-4 overflow-hidden">
            <View
              className="h-full bg-black rounded-full"
              style={{ width: `${Math.min(100, (restTime / restTarget) * 100)}%` }}
            />
          </View>
        </View>
      )}

      {/* Quick Stats */}
      <View className="px-6 py-4 flex-row gap-3">
        <View className="flex-1 bg-zinc-900/80 rounded-3xl p-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }}>
          <Text className="text-zinc-500 text-xs font-medium">Volumen</Text>
          <Text className="text-white text-xl font-semibold mt-1" style={{ fontVariant: ['tabular-nums'] }}>{sessionStats.totalVolume.toLocaleString()}</Text>
        </View>
        <View className="flex-1 bg-zinc-900/80 rounded-3xl p-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }}>
          <Text className="text-zinc-500 text-xs font-medium">Sets</Text>
          <Text className="text-white text-xl font-semibold mt-1" style={{ fontVariant: ['tabular-nums'] }}>{sessionStats.completedSets}/{sessionStats.totalSets}</Text>
        </View>
        <View className="flex-1 bg-zinc-900/80 rounded-3xl p-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }}>
          <Text className="text-zinc-500 text-xs font-medium">Ejercicios</Text>
          <Text className="text-white text-xl font-semibold mt-1" style={{ fontVariant: ['tabular-nums'] }}>{exercises.length}</Text>
        </View>
      </View>

      {/* Exercise Tabs */}
      <View className="px-6 mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          decelerationRate="fast"
        >
          <View className="flex-row gap-3">
            {exercises.map((ex, idx) => (
              <TouchableOpacity
                key={ex.exerciseId + idx}
                className={`px-5 py-2.5 rounded-full ${activeExerciseIdx === idx ? 'bg-[#FFEF0A]' : 'bg-zinc-800/80'
                  }`}
                onPress={() => setActiveExerciseIdx(idx)}
                activeOpacity={0.7}
                style={activeExerciseIdx === idx ? { shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 } : {}}
              >
                <Text className={`font-semibold text-sm ${activeExerciseIdx === idx ? 'text-black' : 'text-white'
                  }`} numberOfLines={1}>
                  {ex.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              className="px-5 py-2.5 rounded-full bg-zinc-800/50"
              onPress={() => setShowExerciseModal(true)}
              style={{ borderWidth: 1, borderColor: '#52525b', borderStyle: 'dashed' }}
            >
              <Text className="text-[#FFEF0A] font-semibold text-sm">+ Añadir</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Current Exercise */}
      {currentExercise ? (
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="bg-zinc-900/80 rounded-3xl p-6 mb-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 }}>
            {/* Exercise Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-14 h-14 bg-[#FFEF0A]/15 rounded-2xl items-center justify-center">
                  <MaterialIcons name="fitness-center" size={28} color="#FFEF0A" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-xl" numberOfLines={1}>{currentExercise.name}</Text>
                  <Text className="text-zinc-500 text-sm font-medium mt-0.5">
                    {currentExercise.muscleGroup}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="w-10 h-10 bg-zinc-800 rounded-full items-center justify-center ml-2"
                onPress={() => removeExercise(activeExerciseIdx)}
              >
                <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>

            {/* Sets Header */}
            <View className="flex-row items-center mb-4 px-2">
              <Text className="text-zinc-500 text-xs font-medium w-12">Set</Text>
              <Text className="text-zinc-500 text-xs font-medium flex-1 text-center">Peso (kg)</Text>
              <Text className="text-zinc-500 text-xs font-medium flex-1 text-center">Reps</Text>
              <View className="w-16" />
            </View>

            {/* Sets */}
            {currentExercise.sets.map((set, idx) => (
              <View
                key={set.id}
                className={`mb-4 p-5 rounded-3xl ${set.completed ? 'bg-[#FFEF0A]/10' : 'bg-zinc-800/60'
                  }`}
                style={set.completed ? { borderWidth: 2, borderColor: '#FFEF0A40', shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 } : {}}
              >
                {/* Set Number */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${set.completed ? 'bg-[#FFEF0A]' : 'bg-zinc-700/80'
                    }`} style={set.completed ? { shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 } : {}}>
                    <Text className={`font-semibold text-lg ${set.completed ? 'text-black' : 'text-zinc-400'}`}>
                      {idx + 1}
                    </Text>
                  </View>

                  {/* Complete Button */}
                  <TouchableOpacity
                    className={`px-6 h-11 rounded-full items-center justify-center flex-row gap-2 ${set.completed ? 'bg-[#FFEF0A]' : 'bg-zinc-800'
                      }`}
                    onPress={() => completeSet(idx)}
                    style={{ shadowColor: set.completed ? '#FFEF0A' : '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 }}
                  >
                    {set.completed && <MaterialIcons name="check" size={20} color="#000" />}
                    <Text className={`${set.completed ? 'text-black' : 'text-white'} text-base font-semibold`}>
                      {set.completed ? 'Completado' : 'Completar'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Weight Controls */}
                <View className="mb-4">
                  <Text className="text-zinc-500 text-sm font-medium mb-2">
                    Peso (kg)
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      className="w-14 h-14 bg-zinc-900/80 rounded-2xl items-center justify-center active:bg-zinc-700"
                      onPress={() => updateSet(idx, 'weight', Math.max(0, (set.weight || 0) - 2.5))}
                      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 }}
                    >
                      <MaterialIcons name="remove" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View className="flex-1">
                      <TextInput
                        className="bg-zinc-900/80 text-white text-center font-semibold text-2xl h-14 rounded-2xl"
                        style={{ fontVariant: ['tabular-nums'] }}
                        value={set.weight?.toString() || '0'}
                        onChangeText={(text) => updateSet(idx, 'weight', parseFloat(text) || 0)}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                    </View>

                    <TouchableOpacity
                      className="w-14 h-14 bg-zinc-900/80 rounded-2xl items-center justify-center active:bg-zinc-700"
                      onPress={() => updateSet(idx, 'weight', (set.weight || 0) + 2.5)}
                      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 }}
                    >
                      <MaterialIcons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Reps Controls */}
                <View>
                  <Text className="text-zinc-500 text-sm font-medium mb-2">
                    Repeticiones
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      className="w-14 h-14 bg-zinc-900/80 rounded-2xl items-center justify-center active:bg-zinc-700"
                      onPress={() => updateSet(idx, 'reps', Math.max(0, (set.reps || 0) - 1))}
                      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 }}
                    >
                      <MaterialIcons name="remove" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View className="flex-1">
                      <TextInput
                        className="bg-zinc-900/80 text-white text-center font-semibold text-2xl h-14 rounded-2xl"
                        style={{ fontVariant: ['tabular-nums'] }}
                        value={set.reps?.toString() || '0'}
                        onChangeText={(text) => updateSet(idx, 'reps', parseInt(text) || 0)}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                    </View>

                    <TouchableOpacity
                      className="w-14 h-14 bg-zinc-900/80 rounded-2xl items-center justify-center active:bg-zinc-700"
                      onPress={() => updateSet(idx, 'reps', (set.reps || 0) + 1)}
                      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 }}
                    >
                      <MaterialIcons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Add/Remove Set Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                className="flex-1 bg-zinc-800/60 py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
                onPress={addSet}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text className="text-white font-semibold">Añadir Set</Text>
              </TouchableOpacity>
              {currentExercise.sets.length > 1 && (
                <TouchableOpacity
                  className="bg-zinc-800/60 px-4 py-3.5 rounded-2xl flex-row items-center gap-2"
                  onPress={() => removeSet(currentExercise.sets.length - 1)}
                >
                  <MaterialIcons name="remove" size={20} color="#ef4444" />
                  <Text className="text-red-500 font-semibold">Quitar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Navigation between exercises */}
          <View className="flex-row gap-3 mb-8">
            <TouchableOpacity
              className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center gap-2 ${activeExerciseIdx > 0 ? 'bg-zinc-800/60' : 'bg-zinc-900/40'
                }`}
              disabled={activeExerciseIdx === 0}
              onPress={() => setActiveExerciseIdx(prev => prev - 1)}
              activeOpacity={activeExerciseIdx > 0 ? 0.6 : 1}
              style={activeExerciseIdx > 0 ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 } : {}}
            >
              <MaterialIcons name="chevron-left" size={20} color={activeExerciseIdx > 0 ? '#fff' : '#52525b'} />
              <Text className={`font-semibold ${activeExerciseIdx > 0 ? 'text-white' : 'text-zinc-600'}`}>
                Anterior
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center gap-2 ${activeExerciseIdx < exercises.length - 1 ? 'bg-[#FFEF0A]' : 'bg-zinc-900/40'
                }`}
              disabled={activeExerciseIdx === exercises.length - 1}
              onPress={() => setActiveExerciseIdx(prev => prev + 1)}
              activeOpacity={activeExerciseIdx < exercises.length - 1 ? 0.7 : 1}
              style={activeExerciseIdx < exercises.length - 1 ? { shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 } : {}}
            >
              <Text className={`font-semibold ${activeExerciseIdx < exercises.length - 1 ? 'text-black' : 'text-zinc-600'
                }`}>
                Siguiente
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={activeExerciseIdx < exercises.length - 1 ? '#000' : '#52525b'} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-[#FFEF0A]/10 rounded-full items-center justify-center mb-4" style={{ shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3 }}>
            <MaterialIcons name="fitness-center" size={48} color="#FFEF0A" />
          </View>
          <Text className="text-white font-bold text-xl mb-2 text-center">
            Añade tu primer ejercicio
          </Text>
          <Text className="text-zinc-500 text-sm text-center mb-6">
            Empieza agregando ejercicios a tu sesión
          </Text>
          <TouchableOpacity
            className="bg-[#FFEF0A] px-8 py-4 rounded-2xl flex-row items-center gap-2"
            onPress={() => setShowExerciseModal(true)}
            style={{ shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 }}
          >
            <MaterialIcons name="add" size={20} color="#000" />
            <Text className="text-black font-bold text-base">Añadir Ejercicio</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Exercise Selection Modal - MEJORADO */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowExerciseModal(false);
          setExerciseSearch('');
          setSelectedMuscleFilter(null);
          setSelectedCategoryFilter(null);
          setShowQuickCreate(false);
        }}
      >
        <View className="flex-1 bg-black/80">
          <View className="flex-1 mt-16 bg-zinc-900 rounded-t-[32px]">
            <View className="p-6 border-b border-zinc-800">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-2xl font-black">Añadir Ejercicio</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowExerciseModal(false);
                    setExerciseSearch('');
                    setSelectedMuscleFilter(null);
                    setSelectedCategoryFilter(null);
                    setShowQuickCreate(false);
                  }}
                  className="w-10 h-10 bg-zinc-800 rounded-full items-center justify-center"
                >
                  <MaterialIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Barra de búsqueda */}
              <View className="bg-zinc-800 rounded-xl flex-row items-center px-4 mb-4">
                <MaterialIcons name="search" size={20} color="#71717a" />
                <View className="w-2" />
                <TextInput
                  className="flex-1 h-12 text-white font-bold"
                  placeholder="Buscar ejercicios..."
                  placeholderTextColor="#52525b"
                  value={exerciseSearch}
                  onChangeText={setExerciseSearch}
                />
                {exerciseSearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setExerciseSearch('')}
                    className="w-6 h-6 items-center justify-center"
                  >
                    <MaterialIcons name="close" size={18} color="#71717a" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filtros por categoría */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-full ${!selectedCategoryFilter ? 'bg-[#FFEF0A]' : 'bg-zinc-800'}`}
                    onPress={() => setSelectedCategoryFilter(null)}
                  >
                    <Text className={`font-bold text-sm ${!selectedCategoryFilter ? 'text-black' : 'text-white'}`}>
                      Todos
                    </Text>
                  </TouchableOpacity>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      className="px-4 py-2 rounded-full"
                      style={{ backgroundColor: selectedCategoryFilter === cat ? getCategoryColor(cat) : '#27272a' }}
                      onPress={() => setSelectedCategoryFilter(selectedCategoryFilter === cat ? null : cat)}
                    >
                      <Text className="text-white font-bold text-sm">{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Filtros por músculo */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {ALL_MUSCLE_GROUPS.map(muscle => (
                    <TouchableOpacity
                      key={muscle}
                      className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${selectedMuscleFilter === muscle ? 'bg-[#FFEF0A]' : 'bg-zinc-800'}`}
                      onPress={() => setSelectedMuscleFilter(selectedMuscleFilter === muscle ? null : muscle)}
                    >
                      <MaterialIcons
                        name={getMuscleIcon(muscle) as any}
                        size={14}
                        color={selectedMuscleFilter === muscle ? '#000' : '#fff'}
                      />
                      <Text className={`font-bold text-xs ${selectedMuscleFilter === muscle ? 'text-black' : 'text-white'}`}>
                        {muscle}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Sugerencia para crear ejercicio */}
            {exerciseSearch.length > 2 && filteredModalExercises.length === 0 && (
              <TouchableOpacity
                className="mx-6 mt-4 bg-[#FFEF0A]/10 border border-[#FFEF0A]/30 rounded-xl p-4 flex-row items-center gap-3"
                onPress={() => {
                  setQuickCreateName(exerciseSearch);
                  setShowQuickCreate(true);
                }}
                style={{ shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2 }}
              >
                <View className="w-10 h-10 bg-[#FFEF0A]/20 rounded-full items-center justify-center">
                  <MaterialIcons name="add-circle" size={24} color="#FFEF0A" />
                </View>
                <View className="flex-1">
                  <Text className="text-[#FFEF0A] font-bold">¿No encuentras "{exerciseSearch}"?</Text>
                  <Text className="text-zinc-400 text-sm">Toca aquí para crearlo rápido</Text>
                </View>
                <MaterialIcons name="arrow-forward" size={20} color="#FFEF0A" />
              </TouchableOpacity>
            )}

            <ScrollView className="flex-1 px-6 py-4">
              {/* Botón para crear ejercicio nuevo */}
              <TouchableOpacity
                className="bg-[#FFEF0A]/10 border border-[#FFEF0A]/30 rounded-2xl p-4 mb-4 flex-row items-center gap-4"
                onPress={() => setShowQuickCreate(true)}
                style={{ shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2 }}
              >
                <View className="w-12 h-12 bg-[#FFEF0A]/20 rounded-xl items-center justify-center">
                  <MaterialIcons name="add-circle" size={28} color="#FFEF0A" />
                </View>
                <View className="flex-1">
                  <Text className="text-[#FFEF0A] font-bold text-base">Crear Ejercicio Nuevo</Text>
                  <Text className="text-zinc-400 text-xs">Añade un ejercicio personalizado</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#FFEF0A" />
              </TouchableOpacity>

              {filteredModalExercises.length > 0 ? (
                filteredModalExercises.map(exercise => {
                  const categoryColor = getCategoryColor(exercise.category);
                  return (
                    <TouchableOpacity
                      key={exercise.id}
                      className="bg-zinc-800 rounded-2xl p-4 mb-3 flex-row items-center gap-4"
                      onPress={() => addExercise(exercise)}
                      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 }}
                    >
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center"
                        style={{ backgroundColor: categoryColor + '15' }}
                      >
                        <MaterialIcons
                          name={getMuscleIcon(exercise.muscleGroup || '') as any}
                          size={24}
                          color={categoryColor}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-white font-bold text-base flex-1" numberOfLines={1}>
                            {exercise.name}
                          </Text>
                          {exercise.custom && (
                            <View className="bg-[#FFEF0A]/20 px-2 py-0.5 rounded">
                              <Text className="text-[#FFEF0A] text-[9px] font-bold">PERSONAL</Text>
                            </View>
                          )}
                        </View>
                        <View className="flex-row items-center gap-2 mt-1">
                          <View
                            className="px-2 py-0.5 rounded"
                            style={{ backgroundColor: categoryColor + '20' }}
                          >
                            <Text style={{ color: categoryColor }} className="text-[10px] font-bold">
                              {exercise.category}
                            </Text>
                          </View>
                          <Text className="text-zinc-500 text-xs">{exercise.muscleGroup}</Text>
                          {(exercise.lastWeight ?? 0) > 0 && (
                            <>
                              <Text className="text-zinc-700">•</Text>
                              <Text className="text-[#FFEF0A] text-xs font-bold">{exercise.lastWeight} kg</Text>
                            </>
                          )}
                        </View>
                      </View>
                      <View className="w-10 h-10 bg-[#FFEF0A] rounded-xl items-center justify-center">
                        <MaterialIcons name="add" size={24} color="#000" />
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : allExercises.length > 0 ? (
                <View className="py-12 items-center">
                  <View className="w-16 h-16 bg-zinc-800 rounded-full items-center justify-center mb-4">
                    <MaterialIcons name="search-off" size={32} color="#71717a" />
                  </View>
                  <Text className="text-zinc-500 text-base text-center mb-4">
                    No se encontraron ejercicios
                  </Text>
                  {exerciseSearch && (
                    <TouchableOpacity
                      className="mt-2 bg-[#FFEF0A] px-6 py-3 rounded-xl flex-row items-center gap-2"
                      onPress={() => {
                        setQuickCreateName(exerciseSearch);
                        setShowQuickCreate(true);
                      }}
                      style={{ shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 }}
                    >
                      <MaterialIcons name="add-circle" size={20} color="#000" />
                      <Text className="text-black font-bold">Crear "{exerciseSearch}"</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="py-12 items-center">
                  <Text className="text-zinc-500 text-base text-center">
                    Cargando ejercicios...
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Quick Create Exercise Modal */}
      <Modal
        visible={showQuickCreate}
        animationType="fade"
        transparent
        onRequestClose={() => setShowQuickCreate(false)}
      >
        <View className="flex-1 bg-black/90 items-center justify-center px-6">
          <View className="bg-zinc-900 rounded-[32px] p-6 w-full max-w-sm border border-zinc-800">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center gap-2">
                <View className="w-10 h-10 bg-[#FFEF0A]/15 rounded-full items-center justify-center">
                  <MaterialIcons name="add-circle" size={24} color="#FFEF0A" />
                </View>
                <Text className="text-white text-xl font-black">Crear Ejercicio</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowQuickCreate(false)}
                className="w-10 h-10 bg-zinc-800 rounded-full items-center justify-center"
              >
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Nombre */}
            <View className="mb-4">
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Nombre *
              </Text>
              <TextInput
                className="bg-zinc-800 text-white font-bold text-base px-4 h-14 rounded-xl"
                placeholder="Ej: Press de Banca"
                placeholderTextColor="#52525b"
                value={quickCreateName}
                onChangeText={setQuickCreateName}
                autoFocus
              />
            </View>

            {/* Grupo Muscular */}
            <View className="mb-6">
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Grupo Muscular *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ALL_MUSCLE_GROUPS.map(muscle => (
                  <TouchableOpacity
                    key={muscle}
                    className={`px-3 py-2 rounded-xl flex-row items-center gap-1 ${quickCreateMuscle === muscle ? 'bg-[#FFEF0A]' : 'bg-zinc-800'
                      }`}
                    onPress={() => setQuickCreateMuscle(muscle)}
                  >
                    <MaterialIcons
                      name={getMuscleIcon(muscle) as any}
                      size={16}
                      color={quickCreateMuscle === muscle ? '#000' : '#fff'}
                    />
                    <Text className={`font-bold text-sm ${quickCreateMuscle === muscle ? 'text-black' : 'text-white'}`}>
                      {muscle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="gap-3">
              <TouchableOpacity
                className="bg-[#FFEF0A] py-4 rounded-2xl items-center flex-row justify-center gap-2"
                onPress={handleQuickCreate}
                style={{ shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 }}
              >
                <MaterialIcons name="check" size={20} color="#000" />
                <Text className="text-black font-black text-base">Crear y Añadir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-3 items-center"
                onPress={() => setShowQuickCreate(false)}
              >
                <Text className="text-zinc-500 font-bold">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Finish Modal */}
      <Modal
        visible={showFinishModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowFinishModal(false)}
      >
        <View className="flex-1 bg-black/90 items-center justify-center px-6">
          <View className="bg-zinc-900 rounded-[32px] p-8 w-full max-w-sm border border-zinc-800">
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-[#FFEF0A]/10 rounded-full items-center justify-center mb-4">
                <MaterialIcons name="emoji-events" size={48} color="#FFEF0A" />
              </View>
              <Text className="text-white text-2xl font-black text-center">
                ¿Terminar Entrenamiento?
              </Text>
            </View>

            {/* Summary Stats */}
            <View className="bg-zinc-800 rounded-2xl p-4 mb-6">
              <View className="flex-row justify-between mb-3">
                <Text className="text-zinc-400 font-bold">Duración</Text>
                <Text className="text-white font-black">{formatTime(elapsedTime)}</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-zinc-400 font-bold">Volumen Total</Text>
                <Text className="text-white font-black">{sessionStats.totalVolume.toLocaleString()} kg</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-zinc-400 font-bold">Sets Completados</Text>
                <Text className="text-white font-black">{sessionStats.completedSets}</Text>
              </View>
            </View>

            {/* Notes */}
            <TextInput
              className="bg-zinc-800 text-white p-4 rounded-2xl mb-6 min-h-[80px]"
              placeholder="Notas del entrenamiento (opcional)"
              placeholderTextColor="#52525b"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />

            <View className="gap-3">
              <TouchableOpacity
                className="bg-[#FFEF0A] py-4 rounded-2xl items-center flex-row justify-center gap-2"
                onPress={finishWorkout}
                style={{ shadowColor: '#FFEF0A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 }}
              >
                <MaterialIcons name="check-circle" size={24} color="#000" />
                <Text className="text-black font-black text-lg">Guardar y Terminar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-3 items-center"
                onPress={() => setShowFinishModal(false)}
              >
                <Text className="text-zinc-500 font-bold">Continuar Entrenando</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

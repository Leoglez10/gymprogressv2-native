import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import { CustomRoutine, Exercise, WorkoutStackParamList } from '../../types';
import { storage } from '../../services/storage';
import { exerciseService } from '../../services/exercises';

const ALL_MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

interface RoutineExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: number;
  targetReps: number;
  restTime: number;
}

export default function CreateWorkoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();

  const [routineName, setRoutineName] = useState('');
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // States for new exercise creation within the modal
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState<string>('Pecho');

  const loadExercises = useCallback(async () => {
    try {
      // Usar el nuevo servicio que combina predefinidos + custom
      const exercises = await exerciseService.getAllExercises();
      setAllExercises(exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  // Usar búsqueda fuzzy del servicio
  const filteredExercises = React.useMemo(() => {
    let results = searchTerm.trim()
      ? exerciseService.fuzzySearch(allExercises, searchTerm)
      : allExercises;

    return results.filter(ex => {
      const matchMuscle = !selectedMuscle || ex.muscleGroup === selectedMuscle;
      const notAdded = !routineExercises.some(re => re.exerciseId === ex.id);
      return matchMuscle && notAdded;
    });
  }, [allExercises, searchTerm, selectedMuscle, routineExercises]);

  const addExercise = (exercise: Exercise) => {
    const newExercise: RoutineExercise = {
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup || 'Otros',
      sets: 3,
      targetReps: 10,
      restTime: 90,
    };
    setRoutineExercises([...routineExercises, newExercise]);
    setShowExerciseModal(false);
    setSearchTerm('');
  };

  const removeExercise = (index: number) => {
    setRoutineExercises(routineExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof RoutineExercise, value: any) => {
    setRoutineExercises(routineExercises.map((ex, i) =>
      i === index ? { ...ex, [field]: value } : ex
    ));
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= routineExercises.length) return;

    const updated = [...routineExercises];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setRoutineExercises(updated);
  };

  const getMainMuscleGroups = () => {
    const muscleCount: Record<string, number> = {};
    routineExercises.forEach(ex => {
      muscleCount[ex.muscleGroup] = (muscleCount[ex.muscleGroup] || 0) + 1;
    });
    return Object.entries(muscleCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([muscle]) => muscle);
  };

  const handleSave = async () => {
    if (!routineName.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para la rutina');
      return;
    }
    if (routineExercises.length === 0) {
      Alert.alert('Error', 'Agrega al menos un ejercicio');
      return;
    }

    // Convertir RoutineExercise a CustomExerciseEntry
    const exercisesForSave = routineExercises.map(ex => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      sets: Array.from({ length: ex.sets }, () => ({
        weight: 0,
        reps: ex.targetReps,
        completed: false,
      })),
    }));

    const newRoutine: CustomRoutine = {
      id: `routine-${Date.now()}`,
      name: routineName.trim(),
      exercises: exercisesForSave,
      mainMuscleGroups: getMainMuscleGroups(),
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = await storage.get('gymProgress_custom_routines') || [];
      await storage.set('gymProgress_custom_routines', [...existing, newRoutine]);
      Alert.alert('Éxito', 'Rutina creada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving routine:', error);
      Alert.alert('Error', 'No se pudo guardar la rutina');
    }
  };

  const getMuscleEmoji = (muscle: string) => {
    const map: Record<string, string> = {
      'Pecho': '💪',
      'Espalda': '🔙',
      'Piernas': '🦵',
      'Hombros': '🎯',
      'Brazos': '💪',
      'Core': '🔥',
    };
    return map[muscle] || '🏋️';
  };

  const estimatedDuration = routineExercises.reduce((acc, ex) => {
    const exerciseTime = ex.sets * (30 + ex.restTime); // 30s per set + rest
    return acc + exerciseTime;
  }, 0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-zinc-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-zinc-400 font-bold text-base">← Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-black">Nueva Rutina</Text>
        <TouchableOpacity
          className="bg-[#FFEF0A] px-4 py-2 rounded-xl"
          onPress={handleSave}
        >
          <Text className="text-black font-bold">Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Routine Name */}
        <View className="px-6 py-6">
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
            Nombre de la Rutina
          </Text>
          <TextInput
            className="bg-zinc-900 text-white text-2xl font-black px-4 h-16 rounded-2xl border border-zinc-800"
            placeholder="Ej: Push Day"
            placeholderTextColor="#52525b"
            value={routineName}
            onChangeText={setRoutineName}
          />
        </View>

        {/* Stats Preview */}
        {routineExercises.length > 0 && (
          <View className="px-6 mb-6">
            <View className="bg-zinc-900 rounded-2xl p-4 flex-row justify-around border border-zinc-800">
              <View className="items-center">
                <Text className="text-white text-xl font-black">{routineExercises.length}</Text>
                <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                  Ejercicios
                </Text>
              </View>
              <View className="w-px h-10 bg-zinc-800" />
              <View className="items-center">
                <Text className="text-white text-xl font-black">
                  {routineExercises.reduce((acc, ex) => acc + ex.sets, 0)}
                </Text>
                <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                  Series
                </Text>
              </View>
              <View className="w-px h-10 bg-zinc-800" />
              <View className="items-center">
                <Text className="text-white text-xl font-black">
                  ~{formatDuration(estimatedDuration)}
                </Text>
                <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                  Duración
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Exercises List */}
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
              Ejercicios
            </Text>
            <TouchableOpacity
              className="bg-[#FFEF0A] px-4 py-2 rounded-xl flex-row items-center gap-2"
              onPress={() => setShowExerciseModal(true)}
            >
              <Text className="text-black font-bold">+ Añadir</Text>
            </TouchableOpacity>
          </View>

          {routineExercises.length > 0 ? (
            routineExercises.map((exercise, idx) => (
              <View
                key={`${exercise.exerciseId}-${idx}`}
                className="bg-zinc-900 rounded-2xl p-4 mb-3 border border-zinc-800"
              >
                {/* Exercise Header */}
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-8 h-8 bg-[#FFEF0A]/10 rounded-lg items-center justify-center">
                    <Text className="text-sm font-black text-[#FFEF0A]">{idx + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base">{exercise.name}</Text>
                    <Text className="text-zinc-500 text-xs font-bold uppercase">
                      {exercise.muscleGroup}
                    </Text>
                  </View>
                  <View className="flex-row gap-1">
                    <TouchableOpacity
                      className="w-8 h-8 bg-zinc-800 rounded-lg items-center justify-center"
                      onPress={() => moveExercise(idx, 'up')}
                      disabled={idx === 0}
                    >
                      <Text className={`text-sm ${idx === 0 ? 'text-zinc-600' : 'text-white'}`}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-8 h-8 bg-zinc-800 rounded-lg items-center justify-center"
                      onPress={() => moveExercise(idx, 'down')}
                      disabled={idx === routineExercises.length - 1}
                    >
                      <Text className={`text-sm ${idx === routineExercises.length - 1 ? 'text-zinc-600' : 'text-white'}`}>↓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-8 h-8 bg-red-500/10 rounded-lg items-center justify-center"
                      onPress={() => removeExercise(idx)}
                    >
                      <Text className="text-red-500 text-sm">✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Exercise Settings */}
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">
                      Series
                    </Text>
                    <View className="flex-row items-center bg-zinc-800 rounded-xl">
                      <TouchableOpacity
                        className="w-10 h-10 items-center justify-center"
                        onPress={() => updateExercise(idx, 'sets', Math.max(1, exercise.sets - 1))}
                      >
                        <Text className="text-white text-lg">−</Text>
                      </TouchableOpacity>
                      <Text className="flex-1 text-center text-white font-bold text-lg">
                        {exercise.sets}
                      </Text>
                      <TouchableOpacity
                        className="w-10 h-10 items-center justify-center"
                        onPress={() => updateExercise(idx, 'sets', exercise.sets + 1)}
                      >
                        <Text className="text-white text-lg">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">
                      Reps
                    </Text>
                    <View className="flex-row items-center bg-zinc-800 rounded-xl">
                      <TouchableOpacity
                        className="w-10 h-10 items-center justify-center"
                        onPress={() => updateExercise(idx, 'targetReps', Math.max(1, exercise.targetReps - 1))}
                      >
                        <Text className="text-white text-lg">−</Text>
                      </TouchableOpacity>
                      <Text className="flex-1 text-center text-white font-bold text-lg">
                        {exercise.targetReps}
                      </Text>
                      <TouchableOpacity
                        className="w-10 h-10 items-center justify-center"
                        onPress={() => updateExercise(idx, 'targetReps', exercise.targetReps + 1)}
                      >
                        <Text className="text-white text-lg">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">
                      Descanso
                    </Text>
                    <View className="flex-row items-center bg-zinc-800 rounded-xl">
                      <TouchableOpacity
                        className="w-10 h-10 items-center justify-center"
                        onPress={() => updateExercise(idx, 'restTime', Math.max(15, exercise.restTime - 15))}
                      >
                        <Text className="text-white text-lg">−</Text>
                      </TouchableOpacity>
                      <Text className="flex-1 text-center text-white font-bold text-sm">
                        {exercise.restTime}s
                      </Text>
                      <TouchableOpacity
                        className="w-10 h-10 items-center justify-center"
                        onPress={() => updateExercise(idx, 'restTime', exercise.restTime + 15)}
                      >
                        <Text className="text-white text-lg">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="py-12 items-center">
              <View className="w-20 h-20 bg-zinc-800 rounded-full items-center justify-center mb-4">
                <Text className="text-4xl">📋</Text>
              </View>
              <Text className="text-white font-bold text-xl mb-2 text-center">
                Sin ejercicios
              </Text>
              <Text className="text-zinc-500 text-sm text-center mb-6">
                Añade ejercicios a tu rutina
              </Text>
              <TouchableOpacity
                className="bg-[#FFEF0A] px-8 py-4 rounded-2xl"
                onPress={() => setShowExerciseModal(true)}
              >
                <Text className="text-black font-bold text-base">Añadir Ejercicio</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Exercise Selection Modal */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View className="flex-1 bg-black/80">
          <View className="flex-1 mt-20 bg-zinc-900 rounded-t-[32px]">
            <View className="p-6 border-b border-zinc-800">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-2xl font-black">Añadir Ejercicio</Text>
                <TouchableOpacity onPress={() => {
                  setShowExerciseModal(false);
                  setSearchTerm('');
                  setSelectedMuscle(null);
                }}>
                  <Text className="text-zinc-500 text-2xl">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Header logic depending on mode */}
              {!showCreateForm ? (
                <>
                  {/* Search */}
                  <View className="bg-zinc-800 rounded-xl flex-row items-center px-4 mb-4">
                    <Text className="text-zinc-500 text-lg mr-2">🔍</Text>
                    <TextInput
                      className="flex-1 h-12 text-white font-bold"
                      placeholder="Buscar ejercicios..."
                      placeholderTextColor="#52525b"
                      value={searchTerm}
                      onChangeText={setSearchTerm}
                    />
                  </View>

                  {/* Muscle Filter */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        className={`px-3 py-2 rounded-full ${
                          !selectedMuscle ? 'bg-[#FFEF0A]' : 'bg-zinc-800'
                        }`}
                        onPress={() => setSelectedMuscle(null)}
                      >
                        <Text className={`font-bold text-xs ${!selectedMuscle ? 'text-black' : 'text-white'}`}>
                          Todos
                        </Text>
                      </TouchableOpacity>
                      {ALL_MUSCLE_GROUPS.map(muscle => (
                        <TouchableOpacity
                          key={muscle}
                          className={`px-3 py-2 rounded-full ${
                            selectedMuscle === muscle ? 'bg-[#FFEF0A]' : 'bg-zinc-800'
                          }`}
                          onPress={() => setSelectedMuscle(muscle)}
                        >
                          <Text className={`font-bold text-xs ${
                            selectedMuscle === muscle ? 'text-black' : 'text-white'
                          }`}>
                            {muscle}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Create New Button */}
                  <TouchableOpacity
                    className="flex-row items-center justify-center gap-2 bg-zinc-800 py-3 rounded-xl border border-zinc-700"
                    onPress={() => {
                      setNewExerciseName(searchTerm);
                      setShowCreateForm(true);
                    }}
                  >
                    <Text className="text-[#FFEF0A] text-lg font-black">+</Text>
                    <Text className="text-white font-bold">Crear Nuevo Ejercicio</Text>
                  </TouchableOpacity>
                </>
              ) : (
                 <View>
                   <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                      Nombre
                    </Text>
                    <TextInput
                      className="bg-zinc-800 text-white font-bold text-lg px-4 h-12 rounded-xl mb-4"
                      placeholder="Nombre del ejercicio"
                      placeholderTextColor="#52525b"
                      value={newExerciseName}
                      onChangeText={setNewExerciseName}
                      autoFocus
                    />

                    <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                      Músculo
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                      {ALL_MUSCLE_GROUPS.map(muscle => (
                        <TouchableOpacity
                          key={muscle}
                          className={`px-3 py-2 rounded-xl border ${
                            newExerciseMuscle === muscle
                              ? 'bg-[#FFEF0A] border-[#FFEF0A]'
                              : 'bg-zinc-800 border-zinc-700'
                          }`}
                          onPress={() => setNewExerciseMuscle(muscle)}
                        >
                          <Text className={`font-bold text-xs ${
                            newExerciseMuscle === muscle ? 'text-black' : 'text-white'
                          }`}>
                            {muscle}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        className="flex-1 bg-zinc-800 py-3 rounded-xl items-center"
                        onPress={() => setShowCreateForm(false)}
                      >
                        <Text className="text-white font-bold">Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 bg-[#FFEF0A] py-3 rounded-xl items-center"
                        onPress={async () => {
                          if (!newExerciseName.trim()) return;
                          try {
                            const newEx = await exerciseService.createExercise({
                              name: newExerciseName.trim(),
                              muscleGroup: newExerciseMuscle,
                              category: 'Push', // Default
                              type: 'Compuesto', // Default
                              difficulty: 'Intermedio', // Default
                              equipment: 'Barra' // Default
                            });
                            // Refresh list and add immediately
                            await loadExercises();
                            addExercise(newEx);
                            setShowCreateForm(false);
                            setNewExerciseName('');
                          } catch (e) {
                            Alert.alert('Error', 'No se pudo crear el ejercicio');
                          }
                        }}
                      >
                        <Text className="text-black font-bold">Crear y Añadir</Text>
                      </TouchableOpacity>
                    </View>
                 </View>
              )}
            </View>

            {!showCreateForm && (
              <ScrollView className="flex-1 px-6 py-4">
                {filteredExercises.length > 0 ? (
                  filteredExercises.map(exercise => (
                    <TouchableOpacity
                      key={exercise.id}
                      className="bg-zinc-800 rounded-2xl p-4 mb-3 flex-row items-center gap-4"
                      onPress={() => addExercise(exercise)}
                    >
                      <View className="w-12 h-12 bg-[#FFEF0A]/10 rounded-xl items-center justify-center">
                        <Text className="text-xl">{getMuscleEmoji(exercise.muscleGroup || '')}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-bold text-base">{exercise.name}</Text>
                        <Text className="text-zinc-500 text-xs font-bold uppercase">
                          {exercise.muscleGroup}
                        </Text>
                      </View>
                      <View className="w-10 h-10 bg-[#FFEF0A] rounded-xl items-center justify-center">
                        <Text className="text-black text-xl font-black">+</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : allExercises.length === 0 ? (
                  <View className="py-12 items-center">
                    <Text className="text-zinc-500 text-base text-center">
                      No hay ejercicios en tu biblioteca.{'\n'}
                      Crea algunos primero.
                    </Text>
                  </View>
                ) : (
                  <View className="py-12 items-center">
                    <Text className="text-zinc-500 text-base text-center">
                      No se encontraron ejercicios
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

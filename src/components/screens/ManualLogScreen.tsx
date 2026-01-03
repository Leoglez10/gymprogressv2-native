import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Exercise, WorkoutSession, WorkoutStackParamList, UserProfile } from '../../types';
import { storage } from '../../services/storage';

interface ManualExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: { weight: number; reps: number; completed: boolean }[];
}

export default function ManualLogScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ManualExercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedExercises, profile] = await Promise.all([
          storage.get('gymProgress_exercises'),
          storage.get('gymProgress_user_profile'),
        ]);
        if (savedExercises) setAllExercises(savedExercises);
        if (profile) setUserProfile(profile);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const addExercise = (exercise: Exercise) => {
    const newExercise: ManualExercise = {
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup || 'Otros',
      sets: [{ weight: exercise.lastWeight || 0, reps: 10, completed: true }],
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseModal(false);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const addSet = (exerciseIdx: number) => {
    setExercises(exercises.map((ex, i) => {
      if (i === exerciseIdx) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, {
            weight: lastSet?.weight || 0,
            reps: lastSet?.reps || 10,
            completed: true
          }],
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseIdx: number, setIdx: number) => {
    setExercises(exercises.map((ex, i) => {
      if (i === exerciseIdx && ex.sets.length > 1) {
        return {
          ...ex,
          sets: ex.sets.filter((_, si) => si !== setIdx),
        };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseIdx: number, setIdx: number, field: 'weight' | 'reps', value: number) => {
    setExercises(exercises.map((ex, i) => {
      if (i === exerciseIdx) {
        return {
          ...ex,
          sets: ex.sets.map((set, si) =>
            si === setIdx ? { ...set, [field]: value } : set
          ),
        };
      }
      return ex;
    }));
  };

  const totalVolume = exercises.reduce((acc, ex) => {
    return acc + ex.sets.reduce((setAcc, set) =>
      setAcc + (set.weight * set.reps), 0
    );
  }, 0);

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const handleSave = async () => {
    if (exercises.length === 0) {
      Alert.alert('Error', 'Añade al menos un ejercicio');
      return;
    }

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      date: date.toISOString(),
      duration: duration * 60 * 1000, // Convert to ms
      volume: totalVolume,
      exercises: exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets,
      })),
      notes: notes.trim() || undefined,
      isManual: true,
    };

    try {
      const history = await storage.get('gymProgress_workout_history') || [];
      await storage.set('gymProgress_workout_history', [session, ...history]);

      // Update last weights
      const savedExercises = await storage.get('gymProgress_exercises') || [];
      const updatedExercises = savedExercises.map((ex: Exercise) => {
        const sessionEx = exercises.find(e => e.exerciseId === ex.id);
        if (sessionEx) {
          const maxWeight = Math.max(...sessionEx.sets.map(s => s.weight), 0);
          if (maxWeight > 0) {
            return { ...ex, lastWeight: maxWeight };
          }
        }
        return ex;
      });
      await storage.set('gymProgress_exercises', updatedExercises);

      Alert.alert('Éxito', 'Entrenamiento registrado', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving manual log:', error);
      Alert.alert('Error', 'No se pudo guardar el entrenamiento');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
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

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-zinc-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-zinc-400 font-bold text-base">← Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-black">Log Manual</Text>
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
        {/* Date & Duration */}
        <View className="px-6 py-6">
          <View className="flex-row gap-4">
            {/* Date Picker */}
            <View className="flex-1">
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Fecha
              </Text>
              <TouchableOpacity
                className="bg-zinc-900 rounded-xl px-4 h-14 flex-row items-center justify-between border border-zinc-800"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-white font-bold">
                  {date.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
                <Text className="text-zinc-500">📅</Text>
              </TouchableOpacity>
            </View>

            {/* Duration */}
            <View className="flex-1">
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Duración (min)
              </Text>
              <View className="bg-zinc-900 rounded-xl h-14 flex-row items-center border border-zinc-800">
                <TouchableOpacity
                  className="w-12 h-full items-center justify-center"
                  onPress={() => setDuration(Math.max(5, duration - 5))}
                >
                  <Text className="text-white text-lg">−</Text>
                </TouchableOpacity>
                <TextInput
                  className="flex-1 text-center text-white font-bold text-lg"
                  value={duration.toString()}
                  onChangeText={(t) => setDuration(parseInt(t) || 0)}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  className="w-12 h-full items-center justify-center"
                  onPress={() => setDuration(duration + 5)}
                >
                  <Text className="text-white text-lg">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Preview */}
        {exercises.length > 0 && (
          <View className="px-6 mb-6">
            <View className="bg-zinc-900 rounded-2xl p-4 flex-row justify-around border border-zinc-800">
              <View className="items-center">
                <Text className="text-white text-xl font-black">{exercises.length}</Text>
                <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                  Ejercicios
                </Text>
              </View>
              <View className="w-px h-10 bg-zinc-800" />
              <View className="items-center">
                <Text className="text-white text-xl font-black">{totalSets}</Text>
                <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                  Series
                </Text>
              </View>
              <View className="w-px h-10 bg-zinc-800" />
              <View className="items-center">
                <Text className="text-white text-xl font-black">
                  {totalVolume.toLocaleString()}
                </Text>
                <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                  {userProfile?.weightUnit || 'kg'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Exercises */}
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

          {exercises.length > 0 ? (
            exercises.map((exercise, exIdx) => (
              <View
                key={`${exercise.exerciseId}-${exIdx}`}
                className="bg-zinc-900 rounded-2xl p-4 mb-3 border border-zinc-800"
              >
                {/* Exercise Header */}
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-10 h-10 bg-[#FFEF0A]/10 rounded-xl items-center justify-center">
                    <Text className="text-lg">{getMuscleEmoji(exercise.muscleGroup)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base">{exercise.name}</Text>
                    <Text className="text-zinc-500 text-xs font-bold uppercase">
                      {exercise.muscleGroup}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="w-8 h-8 bg-red-500/10 rounded-lg items-center justify-center"
                    onPress={() => removeExercise(exIdx)}
                  >
                    <Text className="text-red-500 text-sm">✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Sets */}
                {exercise.sets.map((set, setIdx) => (
                  <View
                    key={setIdx}
                    className="flex-row items-center gap-3 mb-2"
                  >
                    <View className="w-8 h-8 bg-zinc-800 rounded-lg items-center justify-center">
                      <Text className="text-zinc-400 font-bold text-sm">{setIdx + 1}</Text>
                    </View>

                    <View className="flex-1 flex-row gap-2">
                      <View className="flex-1">
                        <TextInput
                          className="bg-zinc-800 text-white text-center font-bold h-10 rounded-lg"
                          value={set.weight.toString()}
                          onChangeText={(t) => updateSet(exIdx, setIdx, 'weight', parseFloat(t) || 0)}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#52525b"
                        />
                        <Text className="text-zinc-500 text-[8px] font-bold text-center mt-1">
                          {userProfile?.weightUnit || 'kg'}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <TextInput
                          className="bg-zinc-800 text-white text-center font-bold h-10 rounded-lg"
                          value={set.reps.toString()}
                          onChangeText={(t) => updateSet(exIdx, setIdx, 'reps', parseInt(t) || 0)}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#52525b"
                        />
                        <Text className="text-zinc-500 text-[8px] font-bold text-center mt-1">
                          REPS
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      className="w-8 h-8 bg-zinc-800 rounded-lg items-center justify-center"
                      onPress={() => removeSet(exIdx, setIdx)}
                      disabled={exercise.sets.length <= 1}
                    >
                      <Text className={`text-sm ${exercise.sets.length <= 1 ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        −
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add Set Button */}
                <TouchableOpacity
                  className="bg-zinc-800 py-2 rounded-xl items-center mt-2"
                  onPress={() => addSet(exIdx)}
                >
                  <Text className="text-zinc-400 font-bold text-sm">+ Añadir Serie</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View className="py-12 items-center">
              <View className="w-20 h-20 bg-zinc-800 rounded-full items-center justify-center mb-4">
                <Text className="text-4xl">📝</Text>
              </View>
              <Text className="text-white font-bold text-xl mb-2 text-center">
                Sin ejercicios
              </Text>
              <Text className="text-zinc-500 text-sm text-center mb-6">
                Añade los ejercicios que realizaste
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

        {/* Notes */}
        <View className="px-6 mt-6">
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
            Notas (opcional)
          </Text>
          <TextInput
            className="bg-zinc-900 text-white font-bold text-base px-4 py-4 rounded-xl border border-zinc-800 min-h-[100px]"
            placeholder="¿Cómo te sentiste? ¿Algo destacable?"
            placeholderTextColor="#52525b"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

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
              <View className="flex-row items-center justify-between">
                <Text className="text-white text-2xl font-black">Añadir Ejercicio</Text>
                <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
                  <Text className="text-zinc-500 text-2xl">✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="flex-1 px-6 py-4">
              {allExercises.length > 0 ? (
                allExercises.map(exercise => (
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
              ) : (
                <View className="py-12 items-center">
                  <Text className="text-zinc-500 text-base text-center">
                    No hay ejercicios guardados
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

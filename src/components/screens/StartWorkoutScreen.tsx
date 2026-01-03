import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { CustomRoutine, WorkoutStackParamList } from '../../types';
import { storage } from '../../services/storage';
import { Icon } from '../ui';

interface StartWorkoutScreenProps {
  onStartRoutine?: (routine: CustomRoutine) => void;
  onStartFreeSession?: () => void;
  onManualLog?: () => void;
}

// Mapeo de grupos musculares a iconos
const MUSCLE_ICONS: Record<string, string> = {
  'Pecho': 'fitness_center',
  'Espalda': 'fitness_center',
  'Piernas': 'directions_run',
  'Hombros': 'fitness_center',
  'Brazos': 'fitness_center',
  'Core': 'self_improvement',
};

export default function StartWorkoutScreen({
  onStartRoutine,
  onStartFreeSession,
  onManualLog,
}: StartWorkoutScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();

  const [routines, setRoutines] = useState<CustomRoutine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [recentRoutineIds, setRecentRoutineIds] = useState<string[]>([]);

  const ALL_MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

  const loadData = useCallback(async () => {
    try {
      const [savedRoutines, savedRecent] = await Promise.all([
        storage.get('gymProgress_custom_routines'),
        storage.get('gymProgress_recent_routines'),
      ]);

      if (savedRoutines) setRoutines(savedRoutines);
      if (savedRecent) setRecentRoutineIds(savedRecent);
    } catch (error) {
      console.error('Error loading routines:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRoutines = routines.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMuscle = !selectedMuscle || r.mainMuscleGroups?.includes(selectedMuscle);
    return matchSearch && matchMuscle;
  });

  const recentRoutines = routines.filter(r => recentRoutineIds.includes(r.id));
  const favoriteRoutines = routines.filter(r => r.isFavorite);

  const handleStartRoutine = async (routine: CustomRoutine) => {
    try {
      const newRecent = [routine.id, ...recentRoutineIds.filter(id => id !== routine.id)].slice(0, 5);
      await storage.set('gymProgress_recent_routines', newRecent);
      setRecentRoutineIds(newRecent);

      if (onStartRoutine) {
        onStartRoutine(routine);
      } else {
        navigation.navigate('ActiveSession', { routineId: routine.id });
      }
    } catch (error) {
      console.error('Error starting routine:', error);
    }
  };

  const handleStartFreeSession = () => {
    if (onStartFreeSession) {
      onStartFreeSession();
    } else {
      navigation.navigate('ActiveSession', { freeSession: true });
    }
  };

  const handleManualLog = () => {
    if (onManualLog) {
      onManualLog();
    } else {
      navigation.navigate('ManualLog', {});
    }
  };

  const handleCreateRoutine = () => {
    navigation.navigate('CreateWorkout');
  };

  const getMuscleIcon = (muscles: string[]) => {
    if (muscles.length === 0) return 'fitness_center';
    return MUSCLE_ICONS[muscles[0]] || 'fitness_center';
  };

  // Colores por grupo muscular - igual que web
  const getMuscleColor = (muscles: string[]) => {
    if (muscles.includes('Pecho')) return '#ef4444';
    if (muscles.includes('Espalda')) return '#3b82f6';
    if (muscles.includes('Piernas')) return '#22c55e';
    if (muscles.includes('Hombros')) return '#f97316';
    if (muscles.includes('Brazos')) return '#a855f7';
    if (muscles.includes('Core')) return '#eab308';
    return '#FFEF0A';
  };

  const RoutineCard = ({ routine }: { routine: CustomRoutine }) => {
    const color = getMuscleColor(routine.mainMuscleGroups || []);

    return (
      <TouchableOpacity
        className="bg-zinc-900 rounded-[40px] p-6 border border-white/5 mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }}
        activeOpacity={0.8}
        onPress={() => handleStartRoutine(routine)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-5 flex-1">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center"
              style={{ backgroundColor: color + '15' }}
            >
              <Icon name={getMuscleIcon(routine.mainMuscleGroups || [])} size={28} color={color} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-black text-lg tracking-tight" numberOfLines={1}>
                {routine.name}
              </Text>
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em] mt-1">
                {routine.exercises.length} ejercicios • {routine.mainMuscleGroups?.slice(0, 2).join(', ')}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            {routine.isFavorite && (
              <Icon name="star" size={20} color="#FFEF0A" />
            )}
            <TouchableOpacity
              className="w-12 h-12 bg-[#FFEF0A] rounded-xl items-center justify-center"
              style={{
                shadowColor: '#FFEF0A',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Icon name="play_arrow" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header - Estilo Web */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-white text-4xl font-black tracking-tighter">Entrenar</Text>
          <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Elige cómo entrenar hoy
          </Text>
        </View>

        {/* Quick Actions - rounded-[3rem] como web */}
        <View className="px-6 mb-8">
          <View className="flex-row gap-4">
            {/* Free Session - Gradient card */}
            <TouchableOpacity
              className="flex-1 rounded-[40px] overflow-hidden"
              activeOpacity={0.9}
              onPress={handleStartFreeSession}
              style={{
                shadowColor: '#FFEF0A',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={['#FFEF0A', '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6"
                style={{ padding: 24 }}
              >
                <View className="w-14 h-14 bg-black rounded-2xl items-center justify-center mb-4">
                  <Icon name="bolt" size={28} color="#FFEF0A" />
                </View>
                <Text className="text-black font-black text-xl tracking-tight">Sesión Libre</Text>
                <Text className="text-black/60 text-[10px] font-black uppercase tracking-[0.15em] mt-1">
                  Sin rutina predefinida
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Manual Log */}
            <TouchableOpacity
              className="flex-1 bg-zinc-900 rounded-[40px] p-6 border border-white/5"
              activeOpacity={0.8}
              onPress={handleManualLog}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="w-14 h-14 bg-zinc-800 rounded-2xl items-center justify-center mb-4">
                <Icon name="edit" size={28} color="#71717a" />
              </View>
              <Text className="text-white font-black text-xl tracking-tight">Log Manual</Text>
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em] mt-1">
                Registrar después
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search - rounded-[2rem] */}
        <View className="px-6 mb-6">
          <View className="bg-zinc-900 rounded-[28px] flex-row items-center px-5 border border-white/5">
            <Icon name="fitness_center" size={20} color="#52525b" />
            <TextInput
              className="flex-1 h-14 text-white font-bold ml-3"
              placeholder="Buscar rutinas..."
              placeholderTextColor="#52525b"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')} className="p-2">
                <Icon name="close" size={18} color="#52525b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Muscle Filter Pills */}
        <View className="mb-8">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
          >
            <TouchableOpacity
              className={`px-5 py-2.5 rounded-full ${
                !selectedMuscle ? 'bg-[#FFEF0A]' : 'bg-zinc-800 border border-white/5'
              }`}
              onPress={() => setSelectedMuscle(null)}
            >
              <Text className={`font-black text-sm tracking-tight ${!selectedMuscle ? 'text-black' : 'text-white'}`}>
                Todos
              </Text>
            </TouchableOpacity>
            {ALL_MUSCLE_GROUPS.map(muscle => (
              <TouchableOpacity
                key={muscle}
                className={`px-5 py-2.5 rounded-full ${
                  selectedMuscle === muscle ? 'bg-[#FFEF0A]' : 'bg-zinc-800 border border-white/5'
                }`}
                onPress={() => setSelectedMuscle(selectedMuscle === muscle ? null : muscle)}
              >
                <Text className={`font-black text-sm tracking-tight ${selectedMuscle === muscle ? 'text-black' : 'text-white'}`}>
                  {muscle}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Routines */}
        {recentRoutines.length > 0 && !searchTerm && !selectedMuscle && (
          <View className="px-6 mb-8">
            <View className="flex-row items-center gap-3 mb-5">
              <Icon name="history" size={20} color="#71717a" />
              <Text className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.25em]">
                Recientes
              </Text>
            </View>
            {recentRoutines.slice(0, 3).map(routine => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </View>
        )}

        {/* Favorites */}
        {favoriteRoutines.length > 0 && !searchTerm && !selectedMuscle && (
          <View className="px-6 mb-8">
            <View className="flex-row items-center gap-3 mb-5">
              <Icon name="star" size={20} color="#FFEF0A" />
              <Text className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.25em]">
                Favoritas
              </Text>
            </View>
            {favoriteRoutines.map(routine => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </View>
        )}

        {/* All Routines */}
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center gap-3">
              <Icon name="fitness_center" size={20} color="#71717a" />
              <Text className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.25em]">
                {searchTerm || selectedMuscle ? 'Resultados' : 'Todas las Rutinas'}
              </Text>
            </View>
            <TouchableOpacity
              className="px-4 py-2.5 bg-zinc-800 rounded-xl flex-row items-center gap-2 border border-white/5"
              onPress={handleCreateRoutine}
            >
              <Icon name="add" size={18} color="#FFEF0A" />
              <Text className="text-white text-xs font-black">Nueva</Text>
            </TouchableOpacity>
          </View>

          {filteredRoutines.length > 0 ? (
            filteredRoutines.map(routine => (
              <RoutineCard key={routine.id} routine={routine} />
            ))
          ) : routines.length === 0 ? (
            <View className="py-16 items-center">
              <View className="w-24 h-24 bg-zinc-800 rounded-[32px] items-center justify-center mb-6">
                <Icon name="fitness_center" size={48} color="#27272a" />
              </View>
              <Text className="text-white font-black text-2xl mb-2 text-center tracking-tight">
                No tienes rutinas
              </Text>
              <Text className="text-zinc-500 text-sm text-center mb-8 px-8">
                Crea tu primera rutina personalizada para comenzar a entrenar
              </Text>
              <TouchableOpacity
                className="bg-[#FFEF0A] px-10 py-5 rounded-full"
                style={{
                  shadowColor: '#FFEF0A',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
                onPress={handleCreateRoutine}
              >
                <Text className="text-black font-black text-base uppercase tracking-[0.1em]">
                  Crear Rutina
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="py-16 items-center">
              <Icon name="fitness_center" size={48} color="#27272a" />
              <Text className="text-zinc-500 text-base text-center mt-4 font-bold">
                No se encontraron rutinas
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

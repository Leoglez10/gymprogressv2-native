import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { WorkoutStackParamList, WorkoutSession, UserProfile } from '../../types';
import { storage } from '../../services/storage';

type SummaryRouteProp = RouteProp<WorkoutStackParamList, 'Summary'>;

export default function SummaryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();
  const route = useRoute<SummaryRouteProp>();
  
  const { sessionId } = route.params || {};
  
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [newPRs, setNewPRs] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [history, profile] = await Promise.all([
          storage.get('gymProgress_workout_history'),
          storage.get('gymProgress_user_profile'),
        ]);

        if (profile) setUserProfile(profile);
        
        if (history && sessionId) {
          const found = history.find((s: WorkoutSession) => s.id === sessionId);
          if (found) {
            setSession(found);
            
            // Check for new PRs
            const exerciseMaxes: Record<string, number> = {};
            const prs: any[] = [];
            
            // Calculate previous maxes (excluding this session)
            history
              .filter((s: WorkoutSession) => s.id !== sessionId)
              .forEach((s: WorkoutSession) => {
                s.exercises?.forEach((ex: any) => {
                  const maxWeight = Math.max(
                    ...(ex.sets || []).map((set: any) => Number(set.weight) || 0),
                    0
                  );
                  exerciseMaxes[ex.exerciseId] = Math.max(
                    exerciseMaxes[ex.exerciseId] || 0,
                    maxWeight
                  );
                });
              });

            // Check if this session has new PRs
            found.exercises?.forEach((ex: any) => {
              const maxWeight = Math.max(
                ...(ex.sets || []).map((set: any) => Number(set.weight) || 0),
                0
              );
              const prevMax = exerciseMaxes[ex.exerciseId] || 0;
              if (maxWeight > prevMax && maxWeight > 0) {
                prs.push({
                  name: ex.name,
                  weight: maxWeight,
                  prevWeight: prevMax,
                  improvement: prevMax > 0 ? maxWeight - prevMax : null,
                });
              }
            });

            setNewPRs(prs);
          }
        }
      } catch (error) {
        console.error('Error loading summary data:', error);
      }
    };

    loadData();
  }, [sessionId]);

  const formatDuration = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const stats = useMemo(() => {
    if (!session) return null;

    const totalSets = session.exercises?.reduce(
      (acc, ex) => acc + (ex.sets?.length || 0),
      0
    ) || 0;

    const muscleGroups = new Set(
      session.exercises?.map(ex => ex.muscleGroup).filter(Boolean)
    );

    return {
      totalSets,
      exerciseCount: session.exercises?.length || 0,
      muscleGroups: Array.from(muscleGroups),
    };
  }, [session]);

  const handleShare = async () => {
    if (!session || !stats) return;

    const message = `🏋️ ¡Entrenamiento Completado!

📊 Resumen:
• Duración: ${formatDuration(session.duration)}
• Volumen: ${session.volume.toLocaleString()} kg
• Ejercicios: ${stats.exerciseCount}
• Series: ${stats.totalSets}
${newPRs.length > 0 ? `\n🏆 ¡${newPRs.length} nuevo(s) récord(s) personal(es)!` : ''}

#GymProgress #Fitness`;

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  if (!session || !stats) {
    return (
      <SafeAreaView className="flex-1 bg-[#0f0f0f] items-center justify-center">
        <Text className="text-white text-lg">Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Celebration */}
        <View className="items-center py-10 px-6">
          <View className="w-32 h-32 bg-[#FFEF0A]/10 rounded-full items-center justify-center mb-6">
            <Text className="text-6xl">🎉</Text>
          </View>
          <Text className="text-white text-3xl font-black text-center mb-2">
            ¡Entrenamiento Completado!
          </Text>
          <Text className="text-zinc-500 text-base text-center">
            {session.routineName || 'Sesión Libre'}
          </Text>
        </View>

        {/* Main Stats */}
        <View className="px-6 mb-6">
          <View className="bg-zinc-900 rounded-[32px] p-6 border border-zinc-800">
            <View className="flex-row flex-wrap gap-4">
              {/* Duration */}
              <View className="flex-1 min-w-[45%] bg-zinc-800 rounded-2xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Text className="text-2xl">⏱️</Text>
                  <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                    Duración
                  </Text>
                </View>
                <Text className="text-white text-3xl font-black">
                  {formatDuration(session.duration)}
                </Text>
              </View>

              {/* Volume */}
              <View className="flex-1 min-w-[45%] bg-zinc-800 rounded-2xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Text className="text-2xl">🏋️</Text>
                  <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                    Volumen
                  </Text>
                </View>
                <Text className="text-white text-3xl font-black">
                  {session.volume.toLocaleString()}
                  <Text className="text-lg text-zinc-500"> {userProfile?.weightUnit || 'kg'}</Text>
                </Text>
              </View>

              {/* Exercises */}
              <View className="flex-1 min-w-[45%] bg-zinc-800 rounded-2xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Text className="text-2xl">📋</Text>
                  <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                    Ejercicios
                  </Text>
                </View>
                <Text className="text-white text-3xl font-black">
                  {stats.exerciseCount}
                </Text>
              </View>

              {/* Sets */}
              <View className="flex-1 min-w-[45%] bg-zinc-800 rounded-2xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Text className="text-2xl">✅</Text>
                  <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                    Series
                  </Text>
                </View>
                <Text className="text-white text-3xl font-black">
                  {stats.totalSets}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* New PRs */}
        {newPRs.length > 0 && (
          <View className="px-6 mb-6">
            <View className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-[32px] p-6 border border-yellow-500/30">
              <View className="flex-row items-center gap-3 mb-4">
                <Text className="text-3xl">🏆</Text>
                <View>
                  <Text className="text-white text-xl font-black">¡Nuevos Récords!</Text>
                  <Text className="text-yellow-500 text-xs font-bold uppercase tracking-widest">
                    {newPRs.length} PR{newPRs.length > 1 ? 's' : ''} logrado{newPRs.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              <View className="gap-3">
                {newPRs.map((pr, i) => (
                  <View 
                    key={i} 
                    className="bg-black/30 rounded-2xl p-4 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 bg-yellow-500/20 rounded-xl items-center justify-center">
                        <Text className="text-lg">⭐</Text>
                      </View>
                      <Text className="text-white font-bold text-base">{pr.name}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-yellow-500 font-black text-lg">
                        {pr.weight} {userProfile?.weightUnit || 'kg'}
                      </Text>
                      {pr.improvement && (
                        <Text className="text-green-500 text-xs font-bold">
                          +{pr.improvement} {userProfile?.weightUnit || 'kg'}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Muscle Groups */}
        {stats.muscleGroups.length > 0 && (
          <View className="px-6 mb-6">
            <View className="bg-zinc-900 rounded-[32px] p-6 border border-zinc-800">
              <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                Grupos Musculares Trabajados
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {stats.muscleGroups.map(muscle => (
                  <View 
                    key={muscle} 
                    className="bg-[#FFEF0A]/10 px-4 py-2 rounded-full border border-[#FFEF0A]/30"
                  >
                    <Text className="text-[#FFEF0A] font-bold text-sm">{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Exercise Breakdown */}
        <View className="px-6 mb-6">
          <View className="bg-zinc-900 rounded-[32px] p-6 border border-zinc-800">
            <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              Detalle de Ejercicios
            </Text>
            <View className="gap-3">
              {session.exercises?.map((ex, i) => {
                const totalVolume = (ex.sets || []).reduce(
                  (acc: number, set: any) => acc + (Number(set.weight) * Number(set.reps) || 0),
                  0
                );
                const maxWeight = Math.max(
                  ...(ex.sets || []).map((s: any) => Number(s.weight) || 0),
                  0
                );

                return (
                  <View key={i} className="bg-zinc-800 rounded-2xl p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-white font-bold text-base flex-1" numberOfLines={1}>
                        {ex.name}
                      </Text>
                      <Text className="text-[#FFEF0A] text-xs font-bold bg-black px-2 py-1 rounded">
                        {ex.sets?.length || 0} sets
                      </Text>
                    </View>
                    <View className="flex-row gap-4">
                      <Text className="text-zinc-400 text-xs">
                        Vol: <Text className="text-white font-bold">{totalVolume.toLocaleString()}</Text> {userProfile?.weightUnit || 'kg'}
                      </Text>
                      <Text className="text-zinc-400 text-xs">
                        Max: <Text className="text-white font-bold">{maxWeight}</Text> {userProfile?.weightUnit || 'kg'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Notes */}
        {session.notes && (
          <View className="px-6 mb-6">
            <View className="bg-zinc-900 rounded-[32px] p-6 border border-zinc-800">
              <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                Notas
              </Text>
              <Text className="text-zinc-300 text-base leading-6">
                {session.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View className="px-6 gap-4">
          <TouchableOpacity
            className="bg-[#FFEF0A] py-5 rounded-2xl items-center flex-row justify-center gap-3"
            onPress={handleGoHome}
          >
            <Text className="text-2xl">🏠</Text>
            <Text className="text-black font-black text-lg">Volver al Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-zinc-800 py-4 rounded-2xl items-center flex-row justify-center gap-3"
            onPress={handleShare}
          >
            <Text className="text-xl">📤</Text>
            <Text className="text-white font-bold text-base">Compartir Logro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

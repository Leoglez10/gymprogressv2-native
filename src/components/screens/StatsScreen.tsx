import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { WorkoutSession, UserProfile, SessionExercise } from '../../types';
import { storage } from '../../services/storage';

const { width } = Dimensions.get('window');

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function StatsScreen() {
  const navigation = useNavigation();
  
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'calendar' | 'volume' | 'prs'>('calendar');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedHistory, profile] = await Promise.all([
          storage.get('gymProgress_workout_history'),
          storage.get('gymProgress_user_profile'),
        ]);

        if (savedHistory) setHistory(savedHistory);
        if (profile) setUserProfile(profile);
      } catch (error) {
        console.error('Error loading stats data:', error);
      }
    };

    loadData();
  }, []);

  // Calendar data
  const calendarData = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];
    
    // Empty slots before first day
    for (let i = 0; i < startDay; i++) {
      days.push({ day: 0, hasWorkout: false, isToday: false });
    }

    // Days of month
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(selectedYear, selectedMonth, d);
      const hasWorkout = history.some(h => 
        new Date(h.date).toDateString() === date.toDateString()
      );
      const isToday = date.toDateString() === today.toDateString();
      days.push({ day: d, hasWorkout, isToday });
    }

    return days;
  }, [history, selectedMonth, selectedYear]);

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const monthSessions = history.filter(h => {
      const d = new Date(h.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const totalVolume = monthSessions.reduce((acc, s) => acc + (s.volume || 0), 0);
    const totalDuration = monthSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const avgVolume = monthSessions.length > 0 ? Math.round(totalVolume / monthSessions.length) : 0;

    return {
      sessions: monthSessions.length,
      totalVolume,
      totalDuration,
      avgVolume,
    };
  }, [history, selectedMonth, selectedYear]);

  // Weekly volume data
  const volumeData = useMemo(() => {
    const weeks: { label: string; volume: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekVolume = history
        .filter(h => {
          const d = new Date(h.date);
          return d >= weekStart && d < weekEnd;
        })
        .reduce((acc, s) => acc + (s.volume || 0), 0);

      weeks.push({
        label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        volume: weekVolume,
      });
    }

    return weeks;
  }, [history]);

  // PR data
  const prData = useMemo(() => {
    const exerciseMaxes: Record<string, { name: string; maxWeight: number; date: string }[]> = {};
    
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedHistory.forEach(session => {
      session.exercises?.forEach(ex => {
        const maxWeight = Math.max(
          ...(ex.sets || []).map((s: any) => Number(s.weight) || 0),
          0
        );
        
        if (maxWeight > 0) {
          if (!exerciseMaxes[ex.exerciseId]) {
            exerciseMaxes[ex.exerciseId] = [];
          }
          
          const prevMax = exerciseMaxes[ex.exerciseId].length > 0
            ? exerciseMaxes[ex.exerciseId][exerciseMaxes[ex.exerciseId].length - 1].maxWeight
            : 0;

          if (maxWeight > prevMax) {
            exerciseMaxes[ex.exerciseId].push({
              name: ex.name,
              maxWeight,
              date: new Date(session.date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              }),
            });
          }
        }
      });
    });

    // Get latest PR for each exercise
    const latestPRs = Object.entries(exerciseMaxes)
      .filter(([_, records]) => records.length > 0)
      .map(([id, records]) => ({
        exerciseId: id,
        name: records[records.length - 1].name,
        weight: records[records.length - 1].maxWeight,
        date: records[records.length - 1].date,
        history: records,
      }))
      .sort((a, b) => b.weight - a.weight);

    return latestPRs;
  }, [history]);

  // Muscle distribution
  const muscleDist = useMemo(() => {
    const muscleMap: Record<string, number> = {};
    
    history.forEach(session => {
      session.exercises?.forEach(ex => {
        const muscle = ex.muscleGroup || 'Otros';
        const vol = (ex.sets || []).reduce(
          (a: number, s: any) => a + (Number(s.weight) * Number(s.reps) || 0),
          0
        );
        muscleMap[muscle] = (muscleMap[muscle] || 0) + vol;
      });
    });

    const total = Object.values(muscleMap).reduce((a, b) => a + b, 0);
    
    return Object.entries(muscleMap)
      .map(([name, value]) => ({
        name,
        value,
        percent: total > 0 ? Math.round((value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [history]);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const navigateMonth = (direction: number) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const maxVolume = Math.max(...volumeData.map(d => d.volume), 1);

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-white text-3xl font-black">Estadísticas</Text>
          <Text className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">
            Tu progreso en detalle
          </Text>
        </View>

        {/* Tab Selector */}
        <View className="px-6 mb-6">
          <View className="bg-zinc-900 rounded-2xl p-1 flex-row">
            {[
              { id: 'calendar', label: '📅 Calendario' },
              { id: 'volume', label: '📊 Volumen' },
              { id: 'prs', label: '🏆 Récords' },
            ].map(tab => (
              <TouchableOpacity
                key={tab.id}
                className={`flex-1 py-3 rounded-xl ${
                  activeTab === tab.id ? 'bg-[#FFEF0A]' : ''
                }`}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Text className={`text-center font-bold text-sm ${
                  activeTab === tab.id ? 'text-black' : 'text-zinc-400'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <>
            {/* Month Navigator */}
            <View className="px-6 mb-4">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  className="w-10 h-10 bg-zinc-800 rounded-xl items-center justify-center"
                  onPress={() => navigateMonth(-1)}
                >
                  <Text className="text-white text-lg">‹</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-black">
                  {MONTHS[selectedMonth]} {selectedYear}
                </Text>
                <TouchableOpacity
                  className="w-10 h-10 bg-zinc-800 rounded-xl items-center justify-center"
                  onPress={() => navigateMonth(1)}
                >
                  <Text className="text-white text-lg">›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Calendar Grid */}
            <View className="px-6 mb-6">
              <View className="bg-zinc-900 rounded-[32px] p-6 border border-zinc-800">
                {/* Day headers */}
                <View className="flex-row mb-4">
                  {DAYS.map(day => (
                    <View key={day} className="flex-1 items-center">
                      <Text className="text-zinc-500 text-xs font-bold">{day}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar days */}
                <View className="flex-row flex-wrap">
                  {calendarData.map((item, idx) => (
                    <View key={idx} className="w-[14.28%] aspect-square p-1">
                      {item.day > 0 && (
                        <TouchableOpacity 
                          className={`flex-1 rounded-xl items-center justify-center ${
                            item.hasWorkout 
                              ? 'bg-[#FFEF0A]' 
                              : item.isToday 
                                ? 'bg-zinc-800 border-2 border-[#FFEF0A]' 
                                : 'bg-zinc-800/50'
                          }`}
                          activeOpacity={item.hasWorkout ? 0.7 : 1}
                          onPress={() => {
                            if (item.hasWorkout) {
                              // Could open modal with workout details
                            }
                          }}
                        >
                          {item.hasWorkout && (
                            <Text className="text-xs absolute -top-1">🔥</Text>
                          )}
                          <Text className={`font-bold text-sm ${
                            item.hasWorkout ? 'text-black' : 'text-zinc-400'
                          }`}>
                            {item.day}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Monthly Summary */}
            <View className="px-6 mb-6">
              <View className="bg-zinc-900 rounded-[32px] p-6 border border-zinc-800">
                <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                  Resumen del Mes
                </Text>
                <View className="flex-row flex-wrap gap-4">
                  <View className="flex-1 min-w-[45%] bg-zinc-800 rounded-2xl p-4">
                    <Text className="text-zinc-500 text-xs font-bold mb-1">Sesiones</Text>
                    <Text className="text-white text-2xl font-black">{monthlyStats.sessions}</Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-zinc-800 rounded-2xl p-4">
                    <Text className="text-zinc-500 text-xs font-bold mb-1">Volumen Total</Text>
                    <Text className="text-white text-2xl font-black">
                      {monthlyStats.totalVolume.toLocaleString()}
                      <Text className="text-sm text-zinc-500"> {userProfile?.weightUnit || 'kg'}</Text>
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-zinc-800 rounded-2xl p-4">
                    <Text className="text-zinc-500 text-xs font-bold mb-1">Tiempo Total</Text>
                    <Text className="text-white text-2xl font-black">
                      {formatDuration(monthlyStats.totalDuration)}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-zinc-800 rounded-2xl p-4">
                    <Text className="text-zinc-500 text-xs font-bold mb-1">Vol. Promedio</Text>
                    <Text className="text-white text-2xl font-black">
                      {monthlyStats.avgVolume.toLocaleString()}
                      <Text className="text-sm text-zinc-500"> {userProfile?.weightUnit || 'kg'}</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Volume Tab */}
        {activeTab === 'volume' && (
          <>
            {/* Volume Chart */}
            <View className="px-6 mb-6">
              <View className="bg-zinc-900 rounded-[32px] p-6 border border-zinc-800">
                <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                  Volumen Semanal (Últimas 6 semanas)
                </Text>
                
                <View className="flex-row justify-between items-end h-40 mb-4">
                  {volumeData.map((week, idx) => (
                    <View key={idx} className="items-center flex-1">
                      <View 
                        className="w-8 bg-[#FFEF0A] rounded-t-lg"
                        style={{ 
                          height: Math.max(8, (week.volume / maxVolume) * 120),
                        }}
                      />
                      <Text className="text-zinc-500 text-[9px] font-bold mt-2">{week.label}</Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row justify-between pt-4 border-t border-zinc-800">
                  <View>
                    <Text className="text-zinc-500 text-xs font-bold">Semana Actual</Text>
                    <Text className="text-white text-xl font-black">
                      {volumeData[volumeData.length - 1]?.volume.toLocaleString() || 0}
                      <Text className="text-sm text-zinc-500"> {userProfile?.weightUnit || 'kg'}</Text>
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-zinc-500 text-xs font-bold">Promedio</Text>
                    <Text className="text-white text-xl font-black">
                      {Math.round(volumeData.reduce((a, b) => a + b.volume, 0) / volumeData.length).toLocaleString()}
                      <Text className="text-sm text-zinc-500"> {userProfile?.weightUnit || 'kg'}</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Muscle Distribution */}
            <View className="px-6 mb-6">
              <View className="bg-zinc-900 rounded-[32px] p-6 border border-zinc-800">
                <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                  Distribución Muscular
                </Text>
                
                {muscleDist.length > 0 ? (
                  <View className="gap-4">
                    {muscleDist.slice(0, 6).map((item, i) => (
                      <View key={item.name}>
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wide">
                            {item.name}
                          </Text>
                          <Text className="text-white font-black">{item.percent}%</Text>
                        </View>
                        <View className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                          <View 
                            className="h-full bg-[#FFEF0A] rounded-full"
                            style={{ width: `${item.percent}%` }}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="py-8 items-center">
                    <Text className="text-zinc-500 text-base text-center">
                      Sin datos de entrenamiento
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* PRs Tab */}
        {activeTab === 'prs' && (
          <View className="px-6">
            <View className="bg-zinc-900 rounded-[32px] p-6 border border-zinc-800">
              <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                Récords Personales
              </Text>
              
              {prData.length > 0 ? (
                <View className="gap-4">
                  {prData.map((pr, i) => (
                    <View 
                      key={pr.exerciseId} 
                      className="bg-zinc-800 rounded-2xl p-4"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-3">
                          <View className={`w-8 h-8 rounded-lg items-center justify-center ${
                            i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-zinc-400' : i === 2 ? 'bg-orange-600' : 'bg-zinc-700'
                          }`}>
                            <Text className="text-white font-black text-sm">{i + 1}</Text>
                          </View>
                          <Text className="text-white font-bold text-base flex-1" numberOfLines={1}>
                            {pr.name}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-[#FFEF0A] font-black text-xl">
                            {pr.weight} <Text className="text-sm">{userProfile?.weightUnit || 'kg'}</Text>
                          </Text>
                          <Text className="text-zinc-500 text-xs font-bold">{pr.date}</Text>
                        </View>
                      </View>
                      
                      {/* Mini progression */}
                      {pr.history.length > 1 && (
                        <View className="flex-row gap-2 mt-3 pt-3 border-t border-zinc-700">
                          {pr.history.slice(-5).map((h, idx) => (
                            <View key={idx} className="items-center">
                              <Text className="text-zinc-400 text-xs font-bold">{h.maxWeight}</Text>
                              <View className={`w-2 h-2 rounded-full mt-1 ${
                                idx === pr.history.slice(-5).length - 1 ? 'bg-[#FFEF0A]' : 'bg-zinc-600'
                              }`} />
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-12 items-center">
                  <View className="w-20 h-20 bg-zinc-800 rounded-full items-center justify-center mb-4">
                    <Text className="text-4xl">🏆</Text>
                  </View>
                  <Text className="text-white font-bold text-xl mb-2 text-center">
                    Sin récords aún
                  </Text>
                  <Text className="text-zinc-500 text-sm text-center">
                    Completa entrenamientos para ver tus PRs
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

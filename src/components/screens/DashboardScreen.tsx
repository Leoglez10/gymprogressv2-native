import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

import { UserProfile, WellnessEntry, GoalType, CustomRoutine, WorkoutStackParamList } from '../../types';
import { storage } from '../../services/storage';
import { Icon, IconBadge, AnimatedCircularProgress } from '../ui';
import StreakInfoModal from '../modals/StreakInfoModal';
import VolumeDetailModal from '../modals/VolumeDetailModal';
import FatigueDetailModal from '../modals/FatigueDetailModal';
import GoalPlannerModal from '../modals/GoalPlannerModal';
import CustomizeDashboardModal from '../modals/CustomizeDashboardModal';
import { WidgetConfig, WidgetId } from '../../types';

const { width } = Dimensions.get('window');

// Constantes
const ALL_MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

interface DashboardScreenProps {
  onStartWorkout?: () => void;
}

export default function DashboardScreen({ onStartWorkout }: DashboardScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [todayWellness, setTodayWellness] = useState<WellnessEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeGoalIdx, setActiveGoalIdx] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showStreakInfo, setShowStreakInfo] = useState(false);
  const [showVolumeDetail, setShowVolumeDetail] = useState(false);
  const [showFatigueDetail, setShowFatigueDetail] = useState(false);

  const [showGoalPlanner, setShowGoalPlanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>([
    { id: 'goals', isVisible: true, order: 0 },
    { id: 'weekly_progress', isVisible: true, order: 1 },
    { id: 'volume', isVisible: true, order: 2 },
    { id: 'wellness', isVisible: true, order: 3 },
  ]);

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      const [profile, workoutHistory, wellness, savedWidgetConfig] = await Promise.all([
        storage.get('gymProgress_user_profile'),
        storage.get('gymProgress_workout_history'),
        storage.get('gymProgress_daily_wellness'),
        storage.get('gymProgress_widget_config'),
      ]);

      if (profile) {
        // Asegurar valores por defecto para goalSettings y notificationSettings
        const completeProfile: UserProfile = {
          ...profile,
          goalSettings: profile.goalSettings || {
            targetSessionsPerMonth: 12,
            targetVolumePerWeek: 15000,
            targetPRsPerMonth: 2,
            activeGoals: ['sessions', 'volume'],
          },
          notificationSettings: profile.notificationSettings || {
            workoutReminders: true,
            weeklySummaries: true,
            aiTips: true,
          },
        };
        setUserProfile(completeProfile);
      }
      if (workoutHistory) setHistory(workoutHistory);

      if (wellness && wellness.date === new Date().toDateString()) {
        setTodayWellness(wellness);
      }

      // Load saved widget config
      if (savedWidgetConfig && Array.isArray(savedWidgetConfig)) {
        setWidgetConfig(savedWidgetConfig);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + weekOffset * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const historyWeek = history.filter(h => {
      const d = new Date(h.date);
      return d >= weekStart && d < weekEnd;
    });

    const totalVolume = historyWeek.reduce((acc, curr) => acc + (Number(curr.volume) || 0), 0);

    // Músculo distribution
    const muscleMap: Record<string, number> = {};
    historyWeek.forEach(session => {
      session.exercises?.forEach((ex: any) => {
        const muscle = ex.muscleGroup || 'Otros';
        const vol = (ex.sets || []).reduce((a: number, s: any) =>
          a + (Number(s.weight) * Number(s.reps) || 0), 0);
        muscleMap[muscle] = (muscleMap[muscle] || 0) + vol;
      });
    });

    const muscleDist = Object.entries(muscleMap)
      .map(([name, value]) => ({
        name,
        value,
        percent: totalVolume > 0 ? Math.round((value / totalVolume) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    // Streak
    const uniqueDates = Array.from(new Set(history.map(h => new Date(h.date).toDateString())))
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    if (uniqueDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const latestDate = uniqueDates[0];
      latestDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
          const gap = Math.floor((uniqueDates[i].getTime() - uniqueDates[i + 1].getTime()) / (1000 * 60 * 60 * 24));
          if (gap === 1) streak++;
          else break;
        }
      }
    }

    // PRs recientes
    const exerciseMaxes: Record<string, number> = {};
    const prRecords: any[] = [];
    const chronological = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    chronological.forEach(session => {
      session.exercises?.forEach((ex: any) => {
        const maxInSession = Math.max(...(ex.sets || []).filter((s: any) => s.completed).map((s: any) => Number(s.weight) || 0), 0);
        const prevMax = exerciseMaxes[ex.exerciseId] || 0;
        if (maxInSession > prevMax && maxInSession > 0) {
          exerciseMaxes[ex.exerciseId] = maxInSession;
          prRecords.push({
            name: ex.name,
            weight: maxInSession,
            date: new Date(session.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            timestamp: new Date(session.date).getTime()
          });
        }
      });
    });

    const recentPrs = prRecords.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

    // Monthly PR count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyPrCount = prRecords.filter(pr => pr.timestamp >= startOfMonth.getTime()).length;

    // ACWR simplificado
    const acwr = 1.0; // Placeholder

    // Prev Week Volume
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekEnd);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

    const prevHistory = history.filter(h => {
      const d = new Date(h.date);
      return d >= prevWeekStart && d < prevWeekEnd;
    });
    const prevWeekVolume = prevHistory.reduce((acc, curr) => acc + (Number(curr.volume) || 0), 0);

    return {
      totalVolume,
      prevWeekVolume,
      muscleDist,
      recentPrs,
      sessionsCount: historyWeek.length,
      monthlyPrCount,
      streak,
      acwr,
    };
  }, [history, weekOffset]);

  // Metas dinámicas
  const dynamicGoals = useMemo(() => {
    if (!userProfile || !userProfile.goalSettings) return [];
    const goals = [];
    const sessionsThisMonth = history.filter(h =>
      new Date(h.date).getMonth() === new Date().getMonth()
    ).length;

    const gs = userProfile.goalSettings;

    goals.push({
      id: 'sessions' as GoalType,
      label: 'Consistencia Mensual',
      current: sessionsThisMonth,
      target: gs.targetSessionsPerMonth || 12,
      progress: Math.min(100, Math.round((sessionsThisMonth / (gs.targetSessionsPerMonth || 12)) * 100)),
      unit: 'sesiones',
      icon: 'calendar_today',
      color: '#FFEF0A'
    });

    goals.push({
      id: 'prs' as GoalType,
      label: 'Récords del Mes',
      current: stats.monthlyPrCount,
      target: gs.targetPRsPerMonth || 2,
      progress: Math.min(100, Math.round((stats.monthlyPrCount / (gs.targetPRsPerMonth || 2)) * 100)),
      unit: 'récords',
      icon: 'stars',
      color: '#60a5fa'
    });

    goals.push({
      id: 'volume' as GoalType,
      label: 'Carga Semanal',
      current: stats.totalVolume,
      target: gs.targetVolumePerWeek || 15000,
      progress: Math.min(100, Math.round((stats.totalVolume / (gs.targetVolumePerWeek || 15000)) * 100)),
      unit: userProfile.weightUnit,
      icon: 'fitness_center',
      color: '#c084fc'
    });

    return goals.filter(g => (gs.activeGoals || ['sessions', 'volume']).includes(g.id));
  }, [userProfile, history, stats]);

  // Datos del gráfico semanal
  const chartData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const vol = history
        .filter(w => new Date(w.date).toDateString() === d.toDateString())
        .reduce((acc, curr) => acc + curr.volume, 0);
      result.push({ day: days[d.getDay()], volume: vol, isReal: vol > 0 });
    }
    return result;
  }, [history]);

  // Build week data
  const buildWeekData = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const hasWorkout = history.some(h => new Date(h.date).toDateString() === date.toDateString());
      days.push({
        date: date.toISOString(),
        label: ['D', 'L', 'M', 'X', 'J', 'V', 'S'][date.getDay()],
        hasWorkout,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    const sessionsCount = days.filter(d => d.hasWorkout).length;
    const startLabel = new Date(startOfWeek).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const endDate = new Date(startOfWeek);
    endDate.setDate(startOfWeek.getDate() + 6);
    const endLabel = endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

    return { days, sessionsCount, startLabel, endLabel };
  }, [history, weekOffset]);

  const weeklyTarget = userProfile?.goalSettings?.targetSessionsPerMonth
    ? Math.ceil(userProfile.goalSettings.targetSessionsPerMonth / 4)
    : 4;

  const globalProgress = useMemo(() => {
    if (dynamicGoals.length === 0) return 0;
    return Math.round(dynamicGoals.reduce((acc, g) => acc + g.progress, 0) / dynamicGoals.length);
  }, [dynamicGoals]);

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  }, []);

  const quickStatsProgressPercent = Math.min((buildWeekData.sessionsCount / weeklyTarget) * 100, 100);

  const handleStartWorkout = () => {
    if (onStartWorkout) {
      onStartWorkout();
    } else {
      navigation.navigate('WorkoutHome');
    }
  };

  if (!userProfile) {
    return (
      <SafeAreaView className="flex-1 bg-[#0f0f0f] items-center justify-center">
        <Text className="text-white text-lg font-bold">Cargando...</Text>
      </SafeAreaView>
    );
  }

  const renderWidget = (id: WidgetId, index: number) => {
    const enteringAnimation = FadeInDown.delay(index * 100).springify().damping(20);
    const layoutAnimation = Layout.springify();

    switch (id) {
      case 'goals':
        return dynamicGoals.length > 0 ? (
          <Animated.View
            key="goals"
            entering={enteringAnimation}
            layout={layoutAnimation}
            className="px-6 mb-8"
          >
            <TouchableOpacity
              className="bg-zinc-900 rounded-[56px] p-8 border border-white/5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
              activeOpacity={0.8}
              onPress={() => setActiveGoalIdx((prev) => (prev + 1) % dynamicGoals.length)}
            >
              <View className="items-center relative">
                <TouchableOpacity
                  onPress={() => setShowGoalPlanner(true)}
                  className="absolute top-0 right-0 p-2 z-10 bg-white/10 rounded-full"
                >
                  <Icon name="edit" size={16} color="#fff" />
                </TouchableOpacity>

                {/* Progress Ring mejorado */}
                <View className="mb-6">
                  <AnimatedCircularProgress
                    size={208} // w-52 = 208
                    strokeWidth={10}
                    progress={dynamicGoals[activeGoalIdx]?.progress || 0}
                    color={dynamicGoals[activeGoalIdx]?.color || '#FFEF0A'}
                    trackColor="#27272a"
                  >
                    <View className="items-center">
                      <Icon
                        name={dynamicGoals[activeGoalIdx]?.icon}
                        size={40}
                        color={dynamicGoals[activeGoalIdx]?.color}
                      />
                      <Text className="text-white text-6xl font-black tracking-tighter mt-2">
                        {dynamicGoals[activeGoalIdx]?.progress}%
                      </Text>
                    </View>
                  </AnimatedCircularProgress>
                </View>

                <Text className="text-white text-2xl font-black tracking-tighter text-center mb-2">
                  {dynamicGoals[activeGoalIdx]?.label}
                </Text>
                <Text className="text-zinc-400 text-sm font-bold">
                  {dynamicGoals[activeGoalIdx]?.current.toLocaleString()} de {dynamicGoals[activeGoalIdx]?.target.toLocaleString()} {dynamicGoals[activeGoalIdx]?.unit}
                </Text>

                {/* Dots indicadores */}
                <View className="flex-row gap-2 mt-8">
                  {dynamicGoals.map((_, i) => (
                    <View
                      key={i}
                      className={`h-2 rounded-full ${activeGoalIdx === i ? 'w-8 bg-[#FFEF0A]' : 'w-2 bg-zinc-700'}`}
                    />
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : null;
      case 'weekly_progress':
        return (
          <Animated.View
            key="weekly"
            entering={enteringAnimation}
            layout={layoutAnimation}
            className="px-6 mb-8"
          >
            <View
              className="bg-zinc-900 rounded-[56px] p-8 border border-white/5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <View className="flex-row justify-between items-start mb-8">
                <View>
                  <Text className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.25em] mb-2">
                    Progreso Semanal
                  </Text>
                  <Text className="text-white text-5xl font-black tracking-tighter">
                    {buildWeekData.sessionsCount} <Text className="text-zinc-600 text-xl">/ {weeklyTarget}</Text>
                  </Text>
                  <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                    {weekOffset === 0 ? 'Semana actual' : `Semana ${weekOffset > 0 ? '+' : ''}${weekOffset}`}
                  </Text>
                </View>

                {/* Circular Progress */}
                <AnimatedCircularProgress
                  size={80} // w-20 = 80
                  strokeWidth={4}
                  progress={quickStatsProgressPercent}
                  color="#FFEF0A"
                  trackColor="#27272a"
                  showText={true}
                  textSize={18}
                  textColor="white"
                />
              </View>

              {/* 7 Day Timeline */}
              <View className="mb-0">
                <Text className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                  Últimos 7 días
                </Text>
                <View className="flex-row justify-between">
                  {buildWeekData.days.map((day, idx) => (
                    <View key={idx} className="items-center gap-2">
                      <Text className="text-zinc-500 text-[8px] font-black uppercase">{day.label}</Text>
                      <View
                        className={`w-9 h-9 rounded-xl items-center justify-center ${day.hasWorkout
                          ? 'bg-[#FFEF0A]'
                          : day.isToday
                            ? 'bg-zinc-800 border-2 border-[#FFEF0A]'
                            : 'bg-zinc-800'
                          }`}
                      >
                        {day.hasWorkout ? (
                          <Icon name="check" size={18} color="#000" />
                        ) : (
                          <Text className="text-zinc-400 text-xs font-black">
                            {new Date(day.date).getDate()}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>
        );
      case 'volume':
        return (
          <Animated.View
            key="volume"
            entering={enteringAnimation}
            layout={layoutAnimation}
            className="px-6 mb-8"
          >
            <TouchableOpacity
              onPress={() => setShowVolumeDetail(true)}
              activeOpacity={0.8}
              className="bg-zinc-900 rounded-[56px] p-8 border border-white/5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <View className="flex-row justify-between items-start mb-8">
                <View>
                  <Text className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.25em] mb-2">
                    Volumen Semanal
                  </Text>
                  <Text className="text-white text-5xl font-black tracking-tighter">
                    {stats.totalVolume.toLocaleString()}
                    <Text className="text-zinc-500 text-lg ml-2 font-black"> {userProfile.weightUnit}</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  className="w-14 h-14 bg-white rounded-2xl items-center justify-center"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Icon name="query_stats" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Bar Chart */}
              <View className="flex-row justify-between items-end h-36">
                {chartData.map((item, idx) => (
                  <View key={idx} className="items-center flex-1 px-1">
                    <View
                      className={`w-9 rounded-xl ${item.isReal ? 'bg-[#FFEF0A]' : 'bg-zinc-800'}`}
                      style={{ height: Math.max(12, (item.volume / Math.max(...chartData.map(d => d.volume || 1))) * 100) }}
                    />
                    <Text className="text-zinc-500 text-[9px] font-black mt-3">{item.day}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      case 'wellness':
        return (
          <Animated.View
            key="wellness"
            entering={enteringAnimation}
            layout={layoutAnimation}
            className="px-6 mb-8"
          >
            <TouchableOpacity
              onPress={() => setShowFatigueDetail(true)}
              activeOpacity={0.9}
              className={`rounded-[56px] p-8 flex-row items-center justify-between border ${!todayWellness
                ? 'bg-zinc-900 border-[#FFEF0A]/40'
                : 'bg-zinc-900 border-white/5'
                }`}
              style={{
                shadowColor: !todayWellness ? '#FFEF0A' : '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: !todayWellness ? 0.2 : 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <View className="flex-row items-center gap-6">
                <View className={`w-20 h-20 rounded-[22px] items-center justify-center ${!todayWellness ? 'bg-[#FFEF0A]/20' : 'bg-green-500/10'
                  }`}>
                  <Icon
                    name={!todayWellness ? 'add_circle' : 'ecg_heart'}
                    size={36}
                    color={!todayWellness ? '#FFEF0A' : '#22c55e'}
                  />
                </View>
                <View>
                  <Text className="text-white text-2xl font-black tracking-tighter">
                    {!todayWellness ? 'Salud Pendiente' : 'Estado Óptimo'}
                  </Text>
                  <Text className={`text-xs font-black uppercase tracking-[0.15em] mt-1 ${!todayWellness ? 'text-[#FFEF0A]' : 'text-zinc-400'
                    }`}>
                    {!todayWellness ? '¡REGISTRAR HOY!' : `ACWR: ${stats.acwr.toFixed(2)}`}
                  </Text>
                </View>
              </View>
              {/* Arrow Icon */}
              <Icon name="chevron_right" size={24} color="#52525b" />
            </TouchableOpacity>
          </Animated.View>
        );
      default:
        return null;
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFEF0A" />
        }
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Header - Estilo Web */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-5">
              {/* Avatar con ring animado como en web */}
              <View
                className="w-16 h-16 rounded-full p-1 overflow-hidden"
                style={{
                  shadowColor: '#FFEF0A',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <LinearGradient
                  colors={['#FFEF0A', '#FFD700', '#FFEF0A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="absolute inset-0 rounded-full"
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 32 }}
                />
                <View className="flex-1 rounded-full bg-[#0f0f0f] overflow-hidden">
                  {userProfile.avatarUrl ? (
                    <Image source={{ uri: userProfile.avatarUrl }} className="w-full h-full" />
                  ) : (
                    <View className="w-full h-full items-center justify-center bg-zinc-800">
                      <Icon name="person" size={28} color="#71717a" />
                    </View>
                  )}
                </View>
              </View>
              <View>
                <Text className="text-white text-2xl font-black tracking-tighter">
                  {userProfile.alias || 'Atleta'}
                </Text>
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em] mt-0.5">
                  {timeGreeting}
                </Text>
              </View>
            </View>

            {/* Customize Button */}
            <TouchableOpacity
              onPress={() => setShowCustomize(true)}
              className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 items-center justify-center"
            >
              <Icon name="tune" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats Bar - Estilo Web rounded-[2.5rem] */}
        <View className="px-6 mb-8">
          <View
            className="bg-zinc-900 rounded-[40px] p-6 flex-row items-center justify-around border border-white/5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <TouchableOpacity className="items-center" onPress={() => setShowStreakInfo(true)}>
              <View className="flex-row items-center gap-2">
                <Icon name="local_fire_department" size={24} color="#f97316" />
                <Text className="text-white text-2xl font-black tracking-tighter">{stats.streak}</Text>
              </View>
              <Text className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Racha</Text>
            </TouchableOpacity>
            <View className="w-px h-10 bg-white/10" />
            <View className="items-center">
              <View className="flex-row items-center gap-2">
                <Icon name="stars" size={24} color="#FFEF0A" />
                <Text className="text-white text-2xl font-black tracking-tighter">{stats.monthlyPrCount}</Text>
              </View>
              <Text className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Logros</Text>
            </View>
            <View className="w-px h-10 bg-white/10" />
            <View className="items-center">
              <View className="flex-row items-center gap-2">
                <Icon name="target" size={24} color="#22c55e" />
                <Text className="text-white text-2xl font-black tracking-tighter">{globalProgress}%</Text>
              </View>
              <Text className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Meta</Text>
            </View>
          </View>
        </View>

        {/* Widgets configurables */}
        {widgetConfig
          .filter(w => w.isVisible)
          .sort((a, b) => a.order - b.order)
          .map((widget, index) => renderWidget(widget.id, index))
        }

        <View className="px-6 mb-8">
          <View
            className="bg-zinc-900 rounded-[56px] p-8 border border-white/5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.25em]">
                Últimos Hitos
              </Text>
              <Icon name="stars" size={24} color="#FFEF0A" />
            </View>

            {stats.recentPrs.length > 0 ? (
              <View className="gap-5">
                {stats.recentPrs.map((pr, i) => (
                  <View key={i} className="flex-row items-center gap-5">
                    <View className="w-14 h-14 rounded-2xl bg-[#FFEF0A]/10 items-center justify-center">
                      <Icon name="bolt" size={24} color="#FFEF0A" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-black text-lg tracking-tight">{pr.name}</Text>
                      <Text className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.15em] mt-1">
                        {pr.weight} {userProfile.weightUnit}
                      </Text>
                    </View>
                    <View className="bg-black px-3 py-1.5 rounded-lg">
                      <Text className="text-[#FFEF0A] text-[9px] font-black uppercase">
                        {pr.date}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="py-10 items-center">
                <Icon name="military_tech" size={48} color="#27272a" />
                <Text className="text-zinc-500 text-sm font-bold text-center mt-4 italic tracking-wide px-4">
                  ¡Sigue entrenando para ver tus récords aquí!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Muscle Distribution Widget - rounded-[4.5rem] */}
        {stats.muscleDist.length > 0 && (
          <View className="px-6 mb-8">
            <View
              className="bg-zinc-900 rounded-[56px] p-8 border border-white/5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.25em]">
                  Foco Muscular
                </Text>
                <TouchableOpacity className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/5">
                  <Icon name="open_in_full" size={18} color="#71717a" />
                </TouchableOpacity>
              </View>

              <View className="gap-5">
                {stats.muscleDist.slice(0, 4).map((item, i) => (
                  <View key={item.name}>
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.15em]">
                          {item.name}
                        </Text>
                        <Icon name="trending_up" size={12} color="#22c55e" />
                      </View>
                      <Text className="text-white font-black">{item.percent}%</Text>
                    </View>
                    <View className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-[#FFEF0A] rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* AI Suggestion box como en web */}
              <View className="mt-6 p-5 rounded-[32px] bg-[#0f0f0f]/50 border border-white/5 flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-xl bg-[#FFEF0A]/20 items-center justify-center">
                  <Icon name="psychology" size={24} color="#FFEF0A" />
                </View>
                <Text className="text-zinc-500 text-[10px] font-bold leading-tight flex-1">
                  Distribución equilibrada. Considera añadir más volumen en grupos rezagados.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Start Workout Button - Estilo Web */}
      <View className="absolute bottom-8 left-6 right-6">
        <TouchableOpacity
          className="bg-[#FFEF0A] h-20 rounded-full flex-row items-center justify-center gap-4"
          style={{
            shadowColor: '#FFEF0A',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.5,
            shadowRadius: 24,
            elevation: 16,
          }}
          activeOpacity={0.9}
          onPress={handleStartWorkout}
        >
          <View className="w-12 h-12 bg-black rounded-full items-center justify-center">
            <Icon name="play_arrow" size={28} color="#FFEF0A" />
          </View>
          <Text className="text-black text-2xl font-black uppercase tracking-wider">
            Entrenar
          </Text>
        </TouchableOpacity>
      </View>

      <StreakInfoModal
        streak={stats.streak}
        history={history}
        visible={showStreakInfo}
        onClose={() => setShowStreakInfo(false)}
        onViewCalendar={() => {
          setShowStreakInfo(false);
          navigation.navigate('Stats' as any);
        }}
        onStartWorkout={() => {
          setShowStreakInfo(false);
          handleStartWorkout();
        }}
      />
      {
        userProfile && (
          <VolumeDetailModal
            chartData={chartData}
            totalVolume={stats.totalVolume}
            prevVolume={stats.prevWeekVolume}
            userProfile={userProfile}
            visible={showVolumeDetail}
            onClose={() => setShowVolumeDetail(false)}
          />
        )
      }

      <FatigueDetailModal
        initialWellness={todayWellness}
        acwrScore={stats.acwr}
        visible={showFatigueDetail}
        onClose={() => setShowFatigueDetail(false)}
        onSave={loadData}
      />

      {/* 4. Render GoalPlannerModal */}
      {userProfile && (
        <GoalPlannerModal
          userProfile={userProfile}
          visible={showGoalPlanner}
          onClose={() => setShowGoalPlanner(false)}
          onSave={async (newProfile) => {
            // Save to storage
            await storage.set('gymProgress_user_profile', newProfile);
            // Update state
            setUserProfile(newProfile);
            setShowGoalPlanner(false);
          }}
        />
      )}

      {/* Customize Modal */}
      <CustomizeDashboardModal
        visible={showCustomize}
        onClose={() => setShowCustomize(false)}
        currentConfig={widgetConfig}
        onSave={setWidgetConfig}
      />
    </SafeAreaView >
  );
}

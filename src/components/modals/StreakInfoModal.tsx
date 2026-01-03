import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Icon } from '../ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';

interface StreakInfoModalProps {
    streak: number;
    history: any[];
    onClose: () => void;
    onViewCalendar: () => void;
    onStartWorkout: () => void;
    visible: boolean;
}

const MotivationBadge = ({ streak }: { streak: number }) => {
    const badge = useMemo(() => {
        if (streak === 0) return { text: '¡Empieza tu racha hoy!', emoji: '💪', colors: ['#64748b', '#475569'] };
        if (streak === 1) return { text: 'Buen inicio. ¡Sigue mañana!', emoji: '🔥', colors: ['#f97316', '#ef4444'] };
        if (streak <= 6) return { text: `¡Vas bien! ${streak} días seguidos`, emoji: '🚀', colors: ['#f97316', '#dc2626'] as const };
        if (streak < 30) return { text: `¡IMPARABLE! ${streak} días`, emoji: '🏆', colors: ['#f59e0b', '#ea580c'] as const };
        return { text: `¡LEYENDA! ${streak} días`, emoji: '👑', colors: ['#facc15', '#f59e0b'] as const };
    }, [streak]);

    return (
        <LinearGradient
            colors={badge.colors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-[40px] p-8 items-center justify-center w-full"
        >
            <Text className="text-6xl mb-4">{badge.emoji}</Text>
            <Text className="text-white text-4xl font-black tabular-nums mb-2">{streak}</Text>
            <Text className="text-white/90 text-sm font-bold uppercase tracking-widest mb-4">días consecutivos</Text>
            <Text className="text-white text-xl font-black text-center">{badge.text}</Text>
        </LinearGradient>
    );
}

export default function StreakInfoModal({ streak, history, onClose, onViewCalendar, onStartWorkout, visible }: StreakInfoModalProps) {
    if (!visible) return null;

    const last7Days = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();

            const hasWorkout = history.some(h => {
                const hDate = new Date(h.date);
                return hDate.toDateString() === dateStr;
            });
            days.push({ date, hasWorkout, isToday: i === 0 });
        }
        return days;
    }, [history]);

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View className="flex-1 justify-end">
                {/* Backdrop with Blur */}
                <View style={StyleSheet.absoluteFill}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)' }]} />
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    </TouchableOpacity>
                </View>

                {/* Modal Content */}
                <Animated.View
                    entering={SlideInDown.springify().damping(20)}
                    className="bg-white dark:bg-[#0f0f0f] rounded-t-[48px] overflow-hidden h-[90%] w-full"
                >
                    <View className="w-16 h-1.5 bg-zinc-700/40 rounded-full mx-auto mt-6 mb-2" />

                    <TouchableOpacity
                        onPress={onClose}
                        className="absolute top-6 right-8 w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-white/10 items-center justify-center z-10"
                    >
                        <Icon name="close" size={20} color="#94a3b8" />
                    </TouchableOpacity>

                    <ScrollView className="flex-1 px-8" contentContainerStyle={{ paddingBottom: 100 }}>
                        <View className="items-center mt-6 mb-10">
                            <View className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-orange-500 to-red-600 items-center justify-center shadow-lg shadow-orange-500/30 mb-6">
                                <Icon name="local_fire_department" size={40} color="#fff" />
                            </View>
                            <Text className="text-black dark:text-white text-4xl font-black tracking-tighter mb-2">Tu Racha</Text>
                            <Text className="text-zinc-500 text-sm font-medium text-center max-w-[280px]">
                                Consistencia medida en días consecutivos entrenando.
                            </Text>
                        </View>

                        <View className="gap-8">
                            <MotivationBadge streak={streak} />

                            {/* Info Card 1 */}
                            <View className="bg-zinc-50 dark:bg-zinc-900 rounded-[40px] p-8 border border-black/5 dark:border-white/5">
                                <View className="flex-row items-center gap-3 mb-6">
                                    <View className="w-12 h-12 rounded-xl bg-orange-500/10 items-center justify-center">
                                        <Icon name="info" size={24} color="#f97316" />
                                    </View>
                                    <Text className="text-black dark:text-white text-xl font-black tracking-tight">¿Qué es la racha?</Text>
                                </View>
                                <Text className="text-zinc-600 dark:text-zinc-400 text-sm font-medium leading-6">
                                    Es tu <Text className="font-black text-black dark:text-[#FFEF0A]">consistencia medida en días consecutivos</Text> entrenando. La racha se mantiene si entrenas al menos una vez cada 24-48 horas.
                                </Text>
                            </View>

                            {/* Last 7 Days */}
                            <View className="bg-zinc-50 dark:bg-zinc-900 rounded-[40px] p-8 border border-black/5 dark:border-white/5">
                                <View className="flex-row items-center gap-3 mb-6">
                                    <View className="w-12 h-12 rounded-xl bg-blue-500/10 items-center justify-center">
                                        <Icon name="date_range" size={24} color="#3b82f6" />
                                    </View>
                                    <Text className="text-black dark:text-white text-xl font-black tracking-tight">Últimos 7 días</Text>
                                </View>
                                <Text className="text-zinc-600 dark:text-zinc-400 text-sm font-medium leading-6 mb-6">
                                    Los días con racha activa tienen un icono de llama 🔥.
                                </Text>

                                <View className="flex-row justify-between">
                                    {last7Days.map((day, i) => (
                                        <View key={i} className="items-center gap-2">
                                            <View
                                                className={`w-10 h-10 rounded-xl items-center justify-center border ${day.isToday
                                                    ? 'bg-[#FFEF0A] border-[#FFEF0A]'
                                                    : day.hasWorkout
                                                        ? 'bg-orange-500/10 border-orange-500/30'
                                                        : 'bg-zinc-100 dark:bg-white/5 border-transparent'
                                                    }`}
                                            >
                                                {day.hasWorkout ? (
                                                    <Icon name="local_fire_department" size={20} color={day.isToday ? '#000' : '#f97316'} />
                                                ) : (
                                                    <Icon name="close" size={18} color="#94a3b8" />
                                                )}
                                            </View>
                                            <Text className="text-[9px] font-bold text-zinc-400 uppercase">
                                                {['D', 'L', 'M', 'X', 'J', 'V', 'S'][day.date.getDay()]}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer Actions */}
                    <View className="absolute bottom-0 left-0 right-0 p-8 pb-10 bg-white dark:bg-[#0f0f0f] border-t border-black/5 dark:border-white/5">
                        {streak === 0 ? (
                            <TouchableOpacity
                                onPress={onStartWorkout}
                                className="w-full h-16 bg-[#FFEF0A] rounded-full items-center justify-center shadow-lg shadow-yellow-500/20 active:scale-95"
                            >
                                <Text className="text-black font-black text-sm uppercase tracking-widest">EMPEZAR MI RACHA AHORA</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={onViewCalendar}
                                className="w-full h-16 bg-zinc-900 dark:bg-zinc-800 rounded-full items-center justify-center active:scale-95"
                            >
                                <Text className="text-white font-black text-sm uppercase tracking-widest">VER CALENDARIO COMPLETO</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

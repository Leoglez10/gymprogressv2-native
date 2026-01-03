import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Icon } from '../ui/Icon';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { UserProfile } from '../../types';
import { getVolumeInsight } from '../../services/aiCoach'; // Assuming this exists or I'll mock it

interface VolumeDetailModalProps {
    chartData: any[]; // { day: string, volume: number }
    totalVolume: number;
    prevVolume: number;
    userProfile: UserProfile;
    onClose: () => void;
    visible: boolean;
}

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 200;
const CHART_WIDTH = width - 64; // padding

export default function VolumeDetailModal({ chartData, totalVolume, prevVolume, userProfile, onClose, visible }: VolumeDetailModalProps) {
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    const trend = useMemo(() => {
        if (prevVolume === 0) return { percent: totalVolume > 0 ? 100 : 0, up: true };
        const diff = ((totalVolume - prevVolume) / prevVolume) * 100;
        return { percent: Math.round(diff), up: diff >= 0 };
    }, [totalVolume, prevVolume]);

    const insightMessage = useMemo(() => {
        const p = trend.percent;
        if (p > 15) return "¡Sobrecarga explosiva! Estás ganando fuerza rápido.";
        if (p >= 5) return "Progreso constante. Mantén este ritmo.";
        if (p > -5) return "Fase de consolidación. La base es sólida.";
        return "Descarga detectada. Escucha a tu cuerpo.";
    }, [trend]);

    const fetchAiInsight = async () => {
        setLoadingAi(true);
        try {
            // Mock AI call for now if service isn't ready
            await new Promise(r => setTimeout(r, 1500));
            setAiInsight("Tu volumen de entrenamiento muestra una progresión saludable. Considera aumentar la intensidad en ejercicios compuestos la próxima semana.");
        } catch (e) {
            setAiInsight("No pude conectar con el entrenador IA. Sigue priorizando la técnica.");
        }
        setLoadingAi(false);
    };

    // Chart Logic
    const chartPath = useMemo(() => {
        if (!chartData || chartData.length === 0) return "";
        const maxVol = Math.max(...chartData.map(d => d.volume), 100);
        const points = chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * CHART_WIDTH;
            const y = CHART_HEIGHT - (d.volume / maxVol) * CHART_HEIGHT;
            return `${x},${y}`;
        });

        return `M0,${CHART_HEIGHT} L${points.join(' L')} L${CHART_WIDTH},${CHART_HEIGHT} Z`;
    }, [chartData]);

    // Line path (without filling down)
    const linePath = useMemo(() => {
        if (!chartData || chartData.length === 0) return "";
        const maxVol = Math.max(...chartData.map(d => d.volume), 100);
        const points = chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * CHART_WIDTH;
            const y = CHART_HEIGHT - (d.volume / maxVol) * CHART_HEIGHT;
            return `${x},${y}`;
        });
        return `M${points.join(' L')}`;
    }, [chartData]);

    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View className="flex-1 justify-end">
                <View style={StyleSheet.absoluteFill}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)' }]} />
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    </TouchableOpacity>
                </View>

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
                        <View className="items-start mt-6 mb-10">
                            <Text className="text-black dark:text-white text-3xl font-black tracking-tighter">Análisis de Carga</Text>
                            <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Rendimiento Semanal</Text>
                        </View>

                        <View className="gap-8">
                            {/* Trend Circle */}
                            <View className="bg-zinc-50 dark:bg-zinc-900 rounded-[40px] p-8 border border-black/5 dark:border-white/5 items-center">
                                <View className={`w-48 h-48 rounded-full border-[12px] items-center justify-center bg-white dark:bg-[#0f0f0f] shadow-xl mb-6 ${trend.up ? 'border-[#FFEF0A]' : 'border-red-500'}`}>
                                    <Text className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Tendencia</Text>
                                    <Text className="text-black dark:text-white text-5xl font-black tabular-nums tracking-tighter">
                                        {trend.up ? '+' : ''}{trend.percent}%
                                    </Text>
                                    <Icon name={trend.up ? 'trending_up' : 'trending_down'} size={32} color={trend.up ? '#FFEF0A' : '#ef4444'} />
                                </View>
                                <Text className="text-center text-xl font-medium leading-relaxed italic text-zinc-700 dark:text-zinc-300 px-4">
                                    {insightMessage}
                                </Text>
                            </View>

                            {/* Chart */}
                            <View className="h-64 w-full bg-zinc-50 dark:bg-zinc-900 rounded-[40px] p-6 border border-black/5 dark:border-white/5 justify-center items-center overflow-hidden">
                                {chartData && chartData.length > 0 ? (
                                    <Svg height={CHART_HEIGHT} width={CHART_WIDTH}>
                                        <Defs>
                                            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                                <Stop offset="0" stopColor="#FFEF0A" stopOpacity="0.3" />
                                                <Stop offset="1" stopColor="#FFEF0A" stopOpacity="0" />
                                            </LinearGradient>
                                        </Defs>
                                        <Path d={chartPath} fill="url(#grad)" />
                                        <Path d={linePath} fill="none" stroke="#FFEF0A" strokeWidth="5" />
                                    </Svg>
                                ) : (
                                    <Text className="text-zinc-500">No data</Text>
                                )}
                            </View>

                            {/* Weekly Stats Grid */}
                            <View className="flex-row gap-4">
                                <View className="flex-1 p-6 rounded-[32px] bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5">
                                    <Text className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Esta Semana</Text>
                                    <Text className="text-black dark:text-white text-2xl font-black tabular-nums">
                                        {totalVolume.toLocaleString()} <Text className="text-xs opacity-40">kg</Text>
                                    </Text>
                                </View>
                                <View className="flex-1 p-6 rounded-[32px] bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5">
                                    <Text className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Anterior</Text>
                                    <Text className="text-black dark:text-white text-2xl font-black tabular-nums">
                                        {prevVolume.toLocaleString()} <Text className="text-xs opacity-40">kg</Text>
                                    </Text>
                                </View>
                            </View>

                            {/* AI Analysis Button */}
                            <View>
                                <TouchableOpacity
                                    onPress={fetchAiInsight}
                                    disabled={loadingAi}
                                    className="w-full flex-row items-center justify-center gap-3 py-6 rounded-full bg-black dark:bg-white active:scale-95 shadow-xl"
                                >
                                    {loadingAi ? (
                                        <Text className="text-white dark:text-black font-black text-sm uppercase tracking-widest">Analizando...</Text>
                                    ) : (
                                        <>
                                            <Icon name="psychology" size={24} color="#888" style={{ marginRight: -8, tintColor: 'white' }} />
                                            {/* Note: Icon color prop might not work if it's text based, nativewind handles text color */}
                                            <Text className="text-white dark:text-black font-black text-sm uppercase tracking-widest">Análisis IA</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {aiInsight && (
                                    <Animated.View entering={FadeIn.duration(500)} className="mt-4 p-8 rounded-[48px] bg-yellow-500/10 border-2 border-[#FFEF0A]/20">
                                        <Text className="font-bold leading-relaxed text-zinc-800 dark:text-zinc-200">
                                            {aiInsight}
                                        </Text>
                                    </Animated.View>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <View className="absolute bottom-0 left-0 right-0 p-8 pb-10 bg-white dark:bg-[#0f0f0f] border-t border-black/5 dark:border-white/5">
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-full h-16 bg-[#FFEF0A] rounded-full items-center justify-center shadow-lg shadow-yellow-500/20 active:scale-95"
                        >
                            <Text className="text-black font-black text-sm uppercase tracking-widest">CERRAR</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

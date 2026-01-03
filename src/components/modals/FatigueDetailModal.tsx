import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Icon } from '../ui/Icon';
import Svg, { Path, Circle } from 'react-native-svg';
import { WellnessEntry } from '../../types';
import { storage } from '../../services/storage';

interface FatigueDetailModalProps {
    initialWellness: WellnessEntry | null;
    acwrScore: number;
    onClose: () => void;
    visible: boolean;
    onSave: () => void;
}

const WellnessSelector = ({ label, icon, value, onChange, options, colors }: {
    label: string,
    icon: string,
    value: number,
    onChange: (v: number) => void,
    options?: string[],
    colors?: string[]
}) => (
    <View className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-black/5 dark:border-white/5 items-center flex-1 min-w-[140px]">
        <View className="flex-row items-center gap-2 mb-4">
            <Icon name={icon} size={20} color="#cbd5e1" />
            <Text className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">{label}</Text>
        </View>
        <View className="flex-col w-full gap-2">
            {[1, 2, 3].map((num, i) => (
                <TouchableOpacity
                    key={num}
                    onPress={() => onChange(num)}
                    className={`py-3.5 rounded-2xl border-2 items-center active:scale-95 ${value === num
                        ? `bg-black dark:bg-white border-transparent`
                        : 'bg-zinc-50 dark:bg-white/5 border-transparent'
                        }`}
                    style={value === num && colors ? { backgroundColor: colors[i] } : {}}
                >
                    <Text className={`text-[10px] font-black uppercase tracking-widest ${value === num ? 'text-white' : 'text-zinc-300'
                        }`}>
                        {options ? options[i] : (num === 1 ? 'Malo' : num === 2 ? 'Ok' : 'Pro')}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

export default function FatigueDetailModal({ initialWellness, acwrScore, onClose, visible, onSave }: FatigueDetailModalProps) {
    const [wellnessState, setWellnessState] = useState<WellnessEntry>(initialWellness || {
        date: new Date().toDateString(),
        sleep: 2,
        energy: 2,
        stress: 2,
        soreness: 3
    });
    const [showSorenessHelp, setShowSorenessHelp] = useState(false);

    const acwrValue = acwrScore;

    const sorenessColor = useMemo(() => {
        if (wellnessState.soreness <= 3) return '#10b981';
        if (wellnessState.soreness <= 7) return '#f59e0b';
        return '#ef4444';
    }, [wellnessState.soreness]);

    const sorenessColorClass = useMemo(() => {
        if (wellnessState.soreness <= 3) return 'text-emerald-500';
        if (wellnessState.soreness <= 7) return 'text-amber-500';
        return 'text-red-500';
    }, [wellnessState.soreness]);

    const readinessScore = useMemo(() => {
        const s = (wellnessState.sleep / 3) * 35;
        const e = (wellnessState.energy / 3) * 35;
        const st = ((4 - wellnessState.stress) / 3) * 15;
        const so = ((4 - wellnessState.soreness) / 3) * 15;
        return Math.round(s + e + st + so);
    }, [wellnessState]);

    const statusLabel = useMemo(() => {
        if (readinessScore > 85) return { label: 'ELITE', color: 'text-blue-500', bg: 'bg-blue-600', textColor: 'text-white' };
        if (readinessScore > 65) return { label: 'ÓPTIMO', color: 'text-emerald-500', bg: 'bg-emerald-500', textColor: 'text-white' };
        if (readinessScore > 40) return { label: 'MODERADO', color: 'text-amber-500', bg: 'bg-amber-400', textColor: 'text-black' };
        return { label: 'RIESGO', color: 'text-red-500', bg: 'bg-red-500', textColor: 'text-white' };
    }, [readinessScore]);

    const handleSaveWellness = async () => {
        const entry = {
            ...wellnessState,
            date: new Date().toDateString()
        };
        await storage.set('gymProgress_daily_wellness', entry);
        onSave();
        onClose();
    };

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
                    className="bg-white dark:bg-[#0f0f0f] rounded-t-[48px] overflow-hidden h-[94%] w-full"
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
                            <Text className="text-black dark:text-white text-3xl font-black tracking-tighter mb-2">Status Vital</Text>
                            <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Centro de Salud e IA</Text>
                        </View>

                        <View className="gap-8">
                            {/* ACWR Gauge */}
                            <View className="bg-zinc-50 dark:bg-zinc-900 rounded-[40px] p-8 border border-black/5 dark:border-white/5 items-center">
                                <View className="relative items-center">
                                    <Svg height="100" width="200" viewBox="0 0 100 50">
                                        <Path d="M 10 45 A 35 35 0 0 1 90 45" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                                        <Path
                                            d="M 10 45 A 35 35 0 0 1 90 45"
                                            fill="none"
                                            stroke={statusLabel.bg.includes('blue') ? '#2563eb' : statusLabel.bg.includes('emerald') ? '#10b981' : statusLabel.bg.includes('amber') ? '#fbbf24' : '#ef4444'}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray="125.6"
                                            strokeDashoffset={125.6 - (125.6 * (Math.min(2.0, acwrValue) / 2))}
                                        />
                                    </Svg>
                                    <View className="absolute bottom-0 items-center">
                                        <Text className="text-black dark:text-white text-6xl font-black tabular-nums tracking-tighter">{acwrValue.toFixed(2)}</Text>
                                        <Text className="text-zinc-400 text-[9px] font-black uppercase tracking-widest -mt-1">Fatiga ACWR</Text>
                                    </View>
                                </View>
                                <View className={`px-6 py-2.5 rounded-full border-2 ${statusLabel.color.replace('text-', 'border-')} mt-6`}>
                                    <Text className={`font-black text-[10px] uppercase tracking-widest ${statusLabel.color}`}>
                                        RECUPERACIÓN: {statusLabel.label}
                                    </Text>
                                </View>
                            </View>

                            {/* Biometrics Grid */}
                            <View>
                                <Text className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4 px-2">Factores Biométricos</Text>
                                <View className="flex-row flex-wrap gap-4">
                                    <WellnessSelector
                                        label="Sueño" icon="bedtime" value={wellnessState.sleep}
                                        onChange={(v) => setWellnessState({ ...wellnessState, sleep: v })}
                                    />
                                    <WellnessSelector
                                        label="Energía" icon="bolt" value={wellnessState.energy}
                                        onChange={(v) => setWellnessState({ ...wellnessState, energy: v })}
                                    />
                                </View>
                                <View className="flex-row flex-wrap gap-4 mt-4">
                                    <WellnessSelector
                                        label="Estrés" icon="psychology" value={wellnessState.stress}
                                        onChange={(v) => setWellnessState({ ...wellnessState, stress: v })}
                                    />
                                    <WellnessSelector
                                        label="Dolor" icon="personal_injury" value={wellnessState.soreness}
                                        onChange={(v) => setWellnessState({ ...wellnessState, soreness: v })}
                                    />
                                </View>
                            </View>

                            {/* Muscle Soreness Slider */}
                            <View className="bg-zinc-50 dark:bg-zinc-900 rounded-[40px] p-8 border border-black/5 dark:border-white/5 items-center">
                                <View className="flex-row items-center gap-2 mb-8">
                                    <Text className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Cansancio Muscular</Text>
                                    <TouchableOpacity onPress={() => setShowSorenessHelp(!showSorenessHelp)} className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-white/10 items-center justify-center">
                                        <Icon name="help" size={14} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>

                                {showSorenessHelp && (
                                    <Text className="text-zinc-500 text-xs text-center mb-6 italic">¿Cuánto te duelen los músculos hoy? 1 = Fresco, 10 = Extenuado.</Text>
                                )}

                                <Text className={`text-7xl font-black tabular-nums tracking-tighter ${sorenessColorClass}`}>
                                    {wellnessState.soreness}<Text className="text-2xl text-zinc-300">/10</Text>
                                </Text>

                                {/* Mock Slider - using multiple buttons for now or a simple bar */}
                                <View className="flex-row gap-1 w-full mt-8 h-12 items-end">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                                        <TouchableOpacity
                                            key={v}
                                            onPress={() => setWellnessState({ ...wellnessState, soreness: v })}
                                            className={`flex-1 rounded-full ${v <= wellnessState.soreness ? 'bg-zinc-800 dark:bg-white' : 'bg-zinc-200 dark:bg-white/10'}`}
                                            style={{ height: 10 + (v * 4) }}
                                        />
                                    ))}
                                </View>
                                <View className="w-full flex-row justify-between mt-2">
                                    <Text className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">LISTO</Text>
                                    <Text className="text-[9px] font-black text-red-500 uppercase tracking-widest">FATIGADO</Text>
                                </View>
                            </View>

                            {/* Readiness Score Card */}
                            <View className={`rounded-[40px] p-8 overflow-hidden relative min-h-[160px] justify-center shadow-2xl ${statusLabel.bg}`}>
                                <View className="absolute top-0 left-0 bottom-0 bg-white/30" style={{ width: `${readinessScore}%` }} />
                                <View className="relative z-10">
                                    <Text className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2 ${statusLabel.textColor}`}>Ready Score</Text>
                                    <Text className={`text-7xl font-black tabular-nums tracking-tighter leading-none ${statusLabel.textColor}`}>{readinessScore}%</Text>
                                </View>
                                <View className="absolute right-8 top-1/2 -translate-y-1/2">
                                    <Text className={`text-lg font-black uppercase italic max-w-[120px] text-right ${statusLabel.textColor}`}>
                                        {readinessScore > 70 ? 'CUERPO DE ÉLITE' : 'CONTROL TÉCNICO'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <View className="absolute bottom-0 left-0 right-0 p-8 pb-10 bg-white dark:bg-[#0f0f0f] border-t border-black/5 dark:border-white/5">
                        <TouchableOpacity
                            onPress={handleSaveWellness}
                            className={`w-full h-20 rounded-full items-center justify-center shadow-lg active:scale-95 flex-row gap-4 border-4 border-white/20 ${statusLabel.bg}`}
                        >
                            <Icon name="check_circle" size={32} color={statusLabel.textColor.includes('white') ? '#fff' : '#000'} />
                            <Text className={`font-black text-xl uppercase tracking-widest ${statusLabel.textColor}`}>GUARDAR REGISTRO</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Dimensions, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Icon } from '../ui/Icon';
import { UserProfile, GoalType } from '../../types';
import { getTargetVolumeRecommendation } from '../../services/aiCoach';

interface GoalPlannerModalProps {
    userProfile: UserProfile;
    onClose: () => void;
    onSave: (p: UserProfile) => void;
    visible: boolean;
}

export default function GoalPlannerModal({ userProfile, onClose, onSave, visible }: GoalPlannerModalProps) {
    const [localProfile, setLocalProfile] = useState<UserProfile>(JSON.parse(JSON.stringify(userProfile)));
    const [activeTab, setActiveTab] = useState<GoalType>('sessions');
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Safety check for goalSettings
    if (!localProfile.goalSettings) {
        localProfile.goalSettings = {
            activeGoals: ['sessions'],
            targetSessionsPerMonth: 12,
            targetPRsPerMonth: 2,
            targetVolumePerWeek: 15000
        };
    }

    const tabConfigs = {
        sessions: { label: 'Entrenos', icon: 'calendar_today', unit: 'Sesiones/mes', step: 1 },
        prs: { label: 'Récords', icon: 'stars', unit: 'Logros/mes', step: 1 },
        volume: { label: 'Volumen', icon: 'fitness_center', unit: `${localProfile.weightUnit}/sem`, step: 500 }
    };

    const currentValue = useMemo(() => {
        if (activeTab === 'sessions') return localProfile.goalSettings.targetSessionsPerMonth || 12;
        if (activeTab === 'prs') return localProfile.goalSettings.targetPRsPerMonth || 2;
        return localProfile.goalSettings.targetVolumePerWeek || 10000;
    }, [activeTab, localProfile]);

    const updateTargetValue = (newValue: number) => {
        const settings = { ...localProfile.goalSettings };
        const val = Math.max(0, newValue);
        if (activeTab === 'sessions') settings.targetSessionsPerMonth = Math.round(val);
        if (activeTab === 'prs') settings.targetPRsPerMonth = Math.round(val);
        if (activeTab === 'volume') settings.targetVolumePerWeek = val;
        setLocalProfile({ ...localProfile, goalSettings: settings });
    };

    const toggleGoalVisibility = (type: GoalType) => {
        const current = localProfile.goalSettings.activeGoals || [];
        const next = current.includes(type) ? current.filter(g => g !== type) : [...current, type];
        setLocalProfile({ ...localProfile, goalSettings: { ...localProfile.goalSettings, activeGoals: next } });
    };

    const fetchAiAdvice = async () => {
        setAiLoading(true);
        setAiAdvice(null);
        try {
            const advice = await getTargetVolumeRecommendation(localProfile);
            setAiAdvice(advice);
        } catch (e) {
            setAiAdvice("Define metas realistas basadas en tu historial.");
        }
        setAiLoading(false);
    };

    const handleSave = () => {
        onSave(localProfile);
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
                    className="bg-white dark:bg-[#0f0f0f] rounded-t-[48px] overflow-hidden h-[92%] w-full"
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
                            <Text className="text-black dark:text-white text-3xl font-black tracking-tighter mb-2">Mis Objetivos</Text>
                        </View>

                        <View className="gap-8">
                            {/* Tabs */}
                            <View className="bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-[32px] flex-row gap-1">
                                {(['sessions', 'prs', 'volume'] as GoalType[]).map(type => {
                                    const config = tabConfigs[type as keyof typeof tabConfigs]; // Type casting for safer access
                                    return (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => { setActiveTab(type); setAiAdvice(null); }}
                                            className={`flex-1 items-center gap-1.5 py-4 rounded-[28px] ${activeTab === type ? 'bg-white dark:bg-[#0f0f0f] shadow-sm' : ''}`}
                                        >
                                            <Icon name={config.icon} size={24} color={activeTab === type ? (type === 'sessions' ? '#FFEF0A' : type === 'prs' ? '#60a5fa' : '#c084fc') : '#94a3b8'} />
                                            <Text className={`text-[9px] font-black uppercase tracking-widest ${activeTab === type ? 'text-black dark:text-white' : 'text-zinc-400'}`}>
                                                {config.label}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>

                            {/* Value Editor */}
                            <View className="items-center py-8">
                                <View className="flex-row items-center gap-6">
                                    <TouchableOpacity
                                        onPress={() => updateTargetValue(currentValue - tabConfigs[activeTab as keyof typeof tabConfigs].step)}
                                        className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 items-center justify-center active:scale-90"
                                    >
                                        <Icon name="remove" size={32} color="#94a3b8" />
                                    </TouchableOpacity>

                                    <View className="items-center min-w-[140px]">
                                        <Text className="text-6xl font-black tabular-nums tracking-tighter text-black dark:text-white mb-2">
                                            {currentValue.toLocaleString()}
                                        </Text>
                                        <Text className="text-zinc-400 text-xs font-black uppercase tracking-widest">
                                            {tabConfigs[activeTab as keyof typeof tabConfigs].unit}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => updateTargetValue(currentValue + tabConfigs[activeTab as keyof typeof tabConfigs].step)}
                                        className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 items-center justify-center active:scale-90"
                                    >
                                        <Icon name="add" size={32} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Toggle Visibility */}
                            <TouchableOpacity
                                onPress={() => toggleGoalVisibility(activeTab)}
                                className={`p-6 rounded-[32px] border flex-row items-center gap-4 ${(localProfile.goalSettings.activeGoals || []).includes(activeTab)
                                    ? 'bg-zinc-900 dark:bg-white border-transparent'
                                    : 'bg-transparent border-zinc-200 dark:border-zinc-800'
                                    }`}
                            >
                                <View className={`w-12 h-12 rounded-full items-center justify-center ${(localProfile.goalSettings.activeGoals || []).includes(activeTab) ? 'bg-[#FFEF0A]' : 'bg-zinc-200 dark:bg-zinc-800'
                                    }`}>
                                    <Icon name={(localProfile.goalSettings.activeGoals || []).includes(activeTab) ? "visibility" : "visibility_off"} size={24} color="#000" />
                                </View>
                                <View className="flex-1">
                                    <Text className={`text-sm font-black uppercase tracking-widest ${(localProfile.goalSettings.activeGoals || []).includes(activeTab) ? 'text-white dark:text-black' : 'text-zinc-500'
                                        }`}>
                                        {(localProfile.goalSettings.activeGoals || []).includes(activeTab) ? 'Visible en Inicio' : 'Oculto en Inicio'}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* AI Assistance */}
                            <View>
                                <TouchableOpacity
                                    onPress={fetchAiAdvice}
                                    disabled={aiLoading}
                                    className="w-full h-16 bg-blue-500/10 rounded-full flex-row items-center justify-center gap-2 active:scale-95 border border-blue-500/20"
                                >
                                    {aiLoading ? (
                                        <Text className="text-blue-500 font-black text-xs uppercase tracking-widest">Calculando...</Text>
                                    ) : (
                                        <>
                                            <Icon name="psychology" size={20} color="#3b82f6" />
                                            <Text className="text-blue-500 font-black text-xs uppercase tracking-widest">Sugerencia IA</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {aiAdvice && (
                                    <Animated.View entering={FadeIn.duration(400)} className="mt-4 p-6 bg-blue-500/5 rounded-3xl border border-blue-500/20">
                                        <Text className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm font-medium">{aiAdvice}</Text>
                                    </Animated.View>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <View className="absolute bottom-0 left-0 right-0 p-8 pb-10 bg-white dark:bg-[#0f0f0f] border-t border-black/5 dark:border-white/5">
                        <TouchableOpacity
                            onPress={handleSave}
                            className="w-full h-20 bg-[#FFEF0A] rounded-full items-center justify-center shadow-lg shadow-yellow-500/20 active:scale-95 flex-row gap-3"
                        >
                            <Icon name="save" size={24} color="#000" />
                            <Text className="text-black font-black text-sm uppercase tracking-widest">GUARDAR CAMBIOS</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

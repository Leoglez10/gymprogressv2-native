import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { Icon } from '../ui/Icon';
import { WidgetConfig, WidgetId } from '../../types';
import { storage } from '../../services/storage';

interface CustomizeDashboardModalProps {
    visible: boolean;
    onClose: () => void;
    currentConfig: WidgetConfig[];
    onSave: (newConfig: WidgetConfig[]) => void;
}

const WIDGET_LABELS: Record<WidgetId, { label: string, icon: string, description: string }> = {
    goals: { label: 'Mis Objetivos', icon: 'flag', description: 'Progreso de metas activas' },
    weekly_progress: { label: 'Resumen Semanal', icon: 'date_range', description: 'Sesiones y calendario' },
    volume: { label: 'Volumen', icon: 'fitness_center', description: 'Carga total levantada' },
    wellness: { label: 'Bienestar', icon: 'favorite', description: 'Fatiga y recuperación' },
    muscle_dist: { label: 'Foco Muscular', icon: 'fitness_center', description: 'Distribución de músculo trabajado' },
    recent_prs: { label: 'Últimos Hitos', icon: 'stars', description: 'Records personales recientes' }
};

export default function CustomizeDashboardModal({ visible, onClose, currentConfig, onSave }: CustomizeDashboardModalProps) {
    const [localConfig, setLocalConfig] = useState<WidgetConfig[]>([]);

    useEffect(() => {
        if (visible) {
            setLocalConfig(JSON.parse(JSON.stringify(currentConfig)));
        }
    }, [visible, currentConfig]);

    const toggleVisibility = (id: WidgetId) => {
        setLocalConfig(prev => prev.map(w => w.id === id ? { ...w, isVisible: !w.isVisible } : w));
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newConfig = [...localConfig];
        [newConfig[index - 1], newConfig[index]] = [newConfig[index], newConfig[index - 1]];
        // Update order property
        newConfig.forEach((w, i) => w.order = i);
        setLocalConfig(newConfig);
    };

    const moveDown = (index: number) => {
        if (index === localConfig.length - 1) return;
        const newConfig = [...localConfig];
        [newConfig[index + 1], newConfig[index]] = [newConfig[index], newConfig[index + 1]];
        // Update order property
        newConfig.forEach((w, i) => w.order = i);
        setLocalConfig(newConfig);
    };

    const handleSave = async () => {
        await storage.set('gymProgress_widget_config', localConfig);
        onSave(localConfig);
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
                    className="bg-white dark:bg-[#0f0f0f] rounded-t-[48px] overflow-hidden h-[85%] w-full"
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
                            <Text className="text-black dark:text-white text-3xl font-black tracking-tighter mb-2">Personalizar</Text>
                            <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Organiza tu Dashboard</Text>
                        </View>

                        <View className="gap-4">
                            {localConfig.map((widget, index) => {
                                const info = WIDGET_LABELS[widget.id];
                                return (
                                    <View key={widget.id} className={`p-4 rounded-[28px] border flex-row items-center gap-4 ${widget.isVisible ? 'bg-zinc-50 dark:bg-zinc-900 border-black/5 dark:border-white/5' : 'bg-transparent border-zinc-200 dark:border-zinc-800 opacity-60'
                                        }`}>

                                        {/* Reorder Controls */}
                                        <View className="gap-1">
                                            <TouchableOpacity
                                                onPress={() => moveUp(index)}
                                                disabled={index === 0}
                                                className={`w-8 h-8 rounded-full items-center justify-center ${index === 0 ? 'bg-transparent' : 'bg-zinc-200 dark:bg-white/10'}`}
                                            >
                                                <Icon name="keyboard_arrow_up" size={20} color={index === 0 ? 'transparent' : '#94a3b8'} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => moveDown(index)}
                                                disabled={index === localConfig.length - 1}
                                                className={`w-8 h-8 rounded-full items-center justify-center ${index === localConfig.length - 1 ? 'bg-transparent' : 'bg-zinc-200 dark:bg-white/10'}`}
                                            >
                                                <Icon name="keyboard_arrow_down" size={20} color={index === localConfig.length - 1 ? 'transparent' : '#94a3b8'} />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Icon */}
                                        <View className={`w-14 h-14 rounded-2xl items-center justify-center ${widget.isVisible ? 'bg-white dark:bg-black' : 'bg-zinc-200 dark:bg-zinc-800'
                                            }`}>
                                            <Icon name={info.icon} size={24} color={widget.isVisible ? '#000' : '#94a3b8'} style={{ tintColor: widget.isVisible && info.icon === 'favorite' ? undefined : undefined }} />
                                            {/* Note: tintColor handling is tricky with props, nativewind mostly handles it via color prop on icon if strictly svg */}
                                        </View>

                                        {/* Info */}
                                        <View className="flex-1">
                                            <Text className="text-black dark:text-white font-bold text-lg">{info.label}</Text>
                                            <Text className="text-zinc-500 text-xs">{info.description}</Text>
                                        </View>

                                        {/* Toggle */}
                                        <TouchableOpacity
                                            onPress={() => toggleVisibility(widget.id)}
                                            className={`w-14 h-8 rounded-full items-start justify-center px-1 ${widget.isVisible ? 'bg-[#FFEF0A]' : 'bg-zinc-300 dark:bg-zinc-800'
                                                }`}
                                        >
                                            <View className={`w-6 h-6 rounded-full bg-black shadow-sm transform ${widget.isVisible ? 'translate-x-6' : 'translate-x-0'
                                                }`} />
                                        </TouchableOpacity>
                                    </View>
                                )
                            })}
                        </View>
                    </ScrollView>

                    <View className="absolute bottom-0 left-0 right-0 p-8 pb-10 bg-white dark:bg-[#0f0f0f] border-t border-black/5 dark:border-white/5">
                        <TouchableOpacity
                            onPress={handleSave}
                            className="w-full h-20 bg-black dark:bg-white rounded-full items-center justify-center shadow-lg active:scale-95"
                        >
                            <Text className="text-white dark:text-black font-black text-sm uppercase tracking-widest">GUARDAR ORDEN</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

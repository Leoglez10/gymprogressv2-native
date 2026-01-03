import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProfile, WellnessEntry } from '../../types';
import { storage } from '../../services/storage';
import { Icon } from '../ui';

// Mock function for Gemini service in Native for now
const getTrainingSuggestions = async (acwr: number, profile: any, wellness: any) => {
    return new Promise<string>((resolve) => {
        setTimeout(() => {
            if (acwr > 1.3) resolve("Tu carga es alta. Reduce el volumen un 20% hoy.");
            else if (acwr < 0.8) resolve("Estás fresco. Puedes aumentar la intensidad.");
            else resolve("Estás en el punto dulce. Mantén el plan.");
        }, 1500);
    });
};

const INFO_TEXTS = {
    acwr: {
        title: "¿Qué es el ACWR?",
        body: "Es la relación entre tu carga de trabajo de los últimos 7 días (Aguda) y los últimos 28 días (Crónica). Mantener este ratio entre 0.8 y 1.3 es el 'Punto Dulce' para progresar minimizando el riesgo de lesión."
    },
    readyScore: {
        title: "¿Cómo se calcula?",
        body: "Tu Ready Score evalúa tu estado sistémico hoy. Combina la calidad del sueño, tus niveles de energía percibida, el estrés acumulado y las agujetas de sesiones previas."
    }
};

const WellnessCard: React.FC<{
    label: string;
    icon: string;
    value: number;
    options: string[];
    colors: string[];
    onChange: (v: number) => void;
}> = ({ label, icon, value, options, colors, onChange }) => (
    <View className="bg-zinc-900 rounded-[32px] p-5 border border-white/5 flex-col items-center flex-1 min-w-[45%] mb-4">
        <View className="flex-row items-center gap-2 mb-4">
            <Icon name={icon} size={20} color="#cbd5e1" />
            <Text className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">{label}</Text>
        </View>

        <View className="flex-col w-full gap-2">
            {[1, 2, 3].map((num, i) => {
                const isSelected = value === num;
                // Map web colors to hex for native (simplified)
                const getColor = (c: string) => {
                    if (c.includes('emerald')) return '#34d399';
                    if (c.includes('amber')) return '#fbbf24';
                    if (c.includes('rose')) return '#fb7185';
                    if (c.includes('sky')) return '#38bdf8';
                    if (c.includes('primary')) return '#FFEF0A';
                    return '#94a3b8';
                };
                const activeColor = getColor(colors[i]);

                return (
                    <TouchableOpacity
                        key={num}
                        onPress={() => onChange(num)}
                        className={`py-3 rounded-2xl items-center justify-center border-2 ${isSelected
                                ? 'bg-black border-transparent shadow-sm'
                                : 'bg-zinc-800/50 border-transparent'
                            }`}
                        style={isSelected ? { shadowColor: activeColor, shadowOpacity: 0.3, shadowRadius: 6 } : {}}
                    >
                        <Text
                            className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? '' : 'text-zinc-500'}`}
                            style={isSelected ? { color: activeColor === '#FFEF0A' ? '#000' : activeColor } : {}}
                        >
                            {options[i]}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    </View>
);

export default function RiskAnalysisScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [activeHelp, setActiveHelp] = useState<keyof typeof INFO_TEXTS | null>(null);
    const [wellness, setWellness] = useState<WellnessEntry>({
        date: new Date().toDateString(),
        sleep: 2,
        energy: 2,
        stress: 2,
        soreness: 1
    });
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const [prof, hist, savedWellness] = await Promise.all([
                storage.get('gymProgress_user_profile'),
                storage.get('gymProgress_workout_history'),
                storage.get('gymProgress_daily_wellness')
            ]);
            if (prof) setUserProfile(prof);
            if (hist) setHistory(hist);
            if (savedWellness && savedWellness.date === new Date().toDateString()) {
                setWellness(savedWellness);
            }
        };
        loadData();
    }, []);

    const saveWellness = async (newWellness: WellnessEntry) => {
        setWellness(newWellness);
        await storage.set('gymProgress_daily_wellness', newWellness);
    };

    const workloadStats = useMemo(() => {
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const acuteDays = 7;
        const chronicDays = 28;
        const acuteLimit = new Date(now.getTime() - acuteDays * oneDayMs);
        const chronicLimit = new Date(now.getTime() - chronicDays * oneDayMs);

        let acuteVolume = 0;
        let chronicVolume = 0;

        history.forEach(session => {
            const sessionDate = new Date(session.date);
            const vol = Number(session.volume) || 0;
            if (sessionDate >= acuteLimit) acuteVolume += vol;
            if (sessionDate >= chronicLimit) chronicVolume += vol;
        });

        const acwr = (chronicVolume / 4) > 0
            ? parseFloat((acuteVolume / (chronicVolume / 4)).toFixed(2))
            : 1.0;

        return { acwr, acuteVolume, chronicVolume };
    }, [history]);

    const readinessScore = useMemo(() => {
        const s = (wellness.sleep / 3) * 35;
        const e = (wellness.energy / 3) * 35;
        const st = ((4 - wellness.stress) / 3) * 15;
        const so = ((4 - wellness.soreness) / 3) * 15;
        return Math.round(s + e + st + so);
    }, [wellness]);

    const statusInfo = useMemo(() => {
        const val = workloadStats.acwr;
        if (history.length === 0) return { label: 'Sin Datos', color: '#94a3b8', desc: 'Entrena unos días para ver tu riesgo.' };
        if (val > 1.5) return { label: 'Peligro', color: '#f43f5e', desc: 'Carga excesiva. El riesgo de lesión es alto.' };
        if (val > 1.3) return { label: 'Sobrecarga', color: '#f59e0b', desc: 'Estás al límite. Considera descargar.' };
        if (val < 0.8) return { label: 'Infraentreno', color: '#38bdf8', desc: 'Recuperado. ¡Hora de apretar!' };
        return { label: 'Óptimo', color: '#10b981', desc: 'Estás en el "Sweet Spot".' };
    }, [workloadStats.acwr, history.length]);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const result = await getTrainingSuggestions(workloadStats.acwr, userProfile, wellness);
            setSuggestion(result);
        } catch (error) {
            setSuggestion("No pude conectar con el Coach.");
        }
        setLoading(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center justify-between bg-[#0f0f0f]">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/5">
                    <Icon name="arrow_back" size={20} color="#fff" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white text-lg font-black tracking-tight">Mi Salud</Text>
                    <Text className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em]">Biometría</Text>
                </View>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* ACWR CARD */}
                <View className="bg-zinc-900 rounded-[48px] p-8 mb-8 border border-white/5 overflow-hidden relative">
                    <View className="flex-row justify-between mb-8">
                        <View>
                            <Text className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">Carga (ACWR)</Text>
                            <View className="flex-row items-baseline gap-3">
                                <Text className="text-white text-6xl font-black tracking-tighter">{workloadStats.acwr.toFixed(2)}</Text>
                                <Text style={{ color: statusInfo.color }} className="text-xs font-black uppercase tracking-widest">{statusInfo.label}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setActiveHelp('acwr')} className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center">
                            <Icon name="help" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-3 w-full bg-zinc-800 rounded-full mb-6 overflow-hidden">
                        <View className="h-full rounded-full" style={{ width: `${Math.min(100, (workloadStats.acwr / 2) * 100)}%`, backgroundColor: statusInfo.color }} />
                    </View>

                    <Text className="text-zinc-500 text-sm font-bold italic mb-8">"{statusInfo.desc}"</Text>

                    <View className="flex-row justify-between pt-6 border-t border-white/5">
                        <View>
                            <Text className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Aguda (7d)</Text>
                            <Text className="text-white text-xl font-black">{workloadStats.acuteVolume.toLocaleString()}</Text>
                        </View>
                        <View>
                            <Text className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Crónica (28d)</Text>
                            <Text className="text-white text-xl font-black">{workloadStats.chronicVolume.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* READY SCORE & WELLNESS */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-6">
                        <View>
                            <Text className="text-white text-2xl font-black tracking-tight">Ready Score</Text>
                            <Text className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em]">Estado Sistémico</Text>
                        </View>
                        <View className="w-20 h-20 items-center justify-center relative">
                            {/* Simplified circle for now */}
                            <View className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                            <View className="absolute inset-0 rounded-full border-4 border-[#FFEF0A]" style={{ borderLeftColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: '45deg' }] }} />
                            <Text className="text-white text-xl font-black">{readinessScore}%</Text>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap justify-between">
                        <WellnessCard
                            label="Sueño" icon="bedtime" value={wellness.sleep}
                            options={['Pobre', 'OK', 'Élite']} colors={['rose', 'amber', 'emerald']} onChange={(v) => saveWellness({ ...wellness, sleep: v })}
                        />
                        <WellnessCard
                            label="Energía" icon="bolt" value={wellness.energy}
                            options={['Baja', 'Zen', 'Fuego']} colors={['rose', 'sky', 'primary']} onChange={(v) => saveWellness({ ...wellness, energy: v })}
                        />
                        <WellnessCard
                            label="Estrés" icon="psychology" value={wellness.stress}
                            options={['Relax', 'Normal', 'Caos']} colors={['emerald', 'amber', 'rose']} onChange={(v) => saveWellness({ ...wellness, stress: v })}
                        />
                        <WellnessCard
                            label="Agujetas" icon="personal_injury" value={wellness.soreness}
                            options={['Cero', 'Light', 'Duras']} colors={['emerald', 'amber', 'rose']} onChange={(v) => saveWellness({ ...wellness, soreness: v })}
                        />
                    </View>
                </View>

                {/* AI COACH */}
                <View className="bg-zinc-900 rounded-[48px] p-8 border border-white/5 relative overflow-hidden">
                    <LinearGradient colors={['rgba(255,239,10,0.05)', 'transparent']} className="absolute inset-0" />
                    <View className="flex-row items-center gap-4 mb-6 relative">
                        <View className="w-14 h-14 rounded-2xl bg-[#FFEF0A] items-center justify-center">
                            <Icon name="neurology" size={28} color="#000" />
                        </View>
                        <View>
                            <Text className="text-white text-xl font-black tracking-tight">Veredicto IA</Text>
                            <Text className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em]">Coach Virtual</Text>
                        </View>
                    </View>

                    {suggestion && (
                        <View className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-6">
                            <Text className="text-zinc-200 font-bold italic text-base">"{suggestion}"</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={fetchSuggestions}
                        disabled={loading}
                        className="w-full h-16 bg-[#FFEF0A] rounded-full flex-row items-center justify-center gap-3 shadow-lg shadow-yellow-500/20"
                    >
                        {loading ? (
                            <Text className="text-black font-black uppercase tracking-widest">Calculando...</Text>
                        ) : (
                            <>
                                <Icon name="offline_bolt" size={24} color="#000" />
                                <Text className="text-black font-black uppercase tracking-widest">{suggestion ? 'Reajustar Plan' : 'Obtener Estrategia'}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal de Ayuda (Overlay simple) */}
            {activeHelp && (
                <View className="absolute inset-0 z-50 items-center justify-center p-6 bg-black/80">
                    <TouchableOpacity onPress={() => setActiveHelp(null)} className="absolute inset-0" />
                    <View className="bg-zinc-900 rounded-[40px] p-8 w-full max-w-sm items-center border border-white/10">
                        <View className="w-16 h-16 rounded-full bg-[#FFEF0A]/10 items-center justify-center mb-6">
                            <Icon name="info" size={32} color="#FFEF0A" />
                        </View>
                        <Text className="text-white text-xl font-black mb-4">{INFO_TEXTS[activeHelp].title}</Text>
                        <Text className="text-zinc-400 text-center text-sm font-medium leading-6 mb-8">{INFO_TEXTS[activeHelp].body}</Text>
                        <TouchableOpacity onPress={() => setActiveHelp(null)} className="w-full py-4 bg-white rounded-full items-center">
                            <Text className="text-black font-black text-xs uppercase tracking-widest">Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

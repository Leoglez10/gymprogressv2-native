import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserProfile, WellnessEntry } from '../types';
import Constants from 'expo-constants';

// En Expo, las variables de entorno se acceden via Constants
const API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const getAI = () => new GoogleGenerativeAI(API_KEY);

export const getTrainingSuggestions = async (
  acwrScore: number,
  profile: UserProfile,
  wellness?: WellnessEntry
): Promise<string> => {
  const ai = getAI();
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const wellnessContext = wellness
    ? 'Bienestar: Sueno(' + wellness.sleep + '/3), Energia(' + wellness.energy + '/3), Estres(' + wellness.stress + '/3), Agujetas(' + wellness.soreness + '/3)'
    : 'Bienestar: No registrado hoy.';

  const prompt = 'Eres un coach deportivo profesional con 15 anos de experiencia. DATOS DEL ATLETA HOY: ACWR: ' + acwrScore + ' (Ratio de fatiga: <0.8=bajo entrenamiento, 0.8-1.3=optimo, >1.5=riesgo lesion). ' + wellnessContext + '. Objetivo: ' + profile.goal + '. Como experto, da UNA recomendacion especifica y profesional para el entrenamiento de HOY. Explicala de forma clara que cualquiera entienda, pero basada en ciencia deportiva. Maximo 2 frases. Se directo y autorizado.';

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text() || 'Consulta a un profesional para sugerencias detalladas.';
};

export const getVolumeInsight = async (currentVolume: number, prevVolume: number, profile: UserProfile): Promise<string> => {
  const ai = getAI();
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const ratioToBodyweight = (currentVolume / profile.weight).toFixed(1);
  const trend = currentVolume > prevVolume ? 'en aumento' : 'en descenso o estable';

  const prompt = 'Eres un coach de fuerza profesional certificado. ANALISIS DE VOLUMEN DEL ATLETA: Volumen semanal actual: ' + currentVolume + ' kg. Peso corporal: ' + profile.weight + ' kg (ratio: ' + ratioToBodyweight + 'x el peso). Volumen semana anterior: ' + prevVolume + ' kg (tendencia: ' + trend + '). Objetivo: ' + profile.goal + '. Como experto, evalua si este volumen es adecuado para su objetivo. Explica tu diagnostico profesional en 2 frases claras y concretas. Usa tu conocimiento pero hazlo entendible para cualquier persona.';

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text() || 'Tu volumen indica un trabajo constante. Sigue asi para ver resultados.';
};

export const getTargetVolumeRecommendation = async (profile: UserProfile): Promise<string> => {
  const ai = getAI();
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = 'Eres un especialista en periodizacion del entrenamiento. PERFIL DEL ATLETA: Peso corporal: ' + profile.weight + ' kg. Objetivo: ' + profile.goal + '. Edad: ' + profile.age + ' anos. Genero: ' + profile.gender + '. Como experto, calcula la meta de volumen semanal IDEAL para este atleta. Usa principios cientificos (Hipertrofia: 150-250x peso, Fuerza: 100-150x, Perdida grasa: ~180x). FORMATO OBLIGATORIO: Para ' + profile.weight + 'kg y objetivo ' + profile.goal + ', tu meta ideal son [NUMERO EXACTO] kg semanales. [Una frase profesional explicando por que]. Explica con autoridad pero que se entienda facil.';

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text() || 'Basado en tu peso de ' + profile.weight + profile.weightUnit + ', un punto de partida optimo son ' + (profile.weight * 200).toLocaleString() + ' ' + profile.weightUnit + ' semanales.';
};

export const getWeeklyVolumeSummary = async (totalVolume: number, muscleDist: any[]): Promise<string> => {
  const ai = getAI();
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const topMuscles = muscleDist.slice(0, 2).map(m => m.name).join(' y ');
  const prompt = 'Eres un coach profesional analizando el progreso semanal. RESUMEN DEL ATLETA: Volumen total movido: ' + totalVolume + ' kg esta semana. Grupos musculares prioritarios: ' + topMuscles + '. Como experto, da un feedback profesional sobre esta semana de entrenamiento. Tu analisis debe ser motivador, especifico y basado en datos. UNA frase contundente y clara. Sin tecnicismos innecesarios.';

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text() || 'Has mantenido un volumen solido esta semana. El enfoque en ' + topMuscles + ' ayudara a tu progresion.';
};

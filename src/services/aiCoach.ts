import { UserProfile } from '../types';

export const getVolumeInsight = async (totalVolume: number, prevVolume: number, userProfile: UserProfile): Promise<string> => {
    // Mock implementation
    return new Promise((resolve) => {
        setTimeout(() => {
            if (totalVolume > prevVolume * 1.1) {
                resolve("¡Gran trabajo! Has aumentado tu volumen significativamente. Asegúrate de descansar bien para recuperarte.");
            } else if (totalVolume < prevVolume * 0.9) {
                resolve("Tu volumen ha disminuido. Si estás en descarga, es perfecto. Si no, revisa tu consistencia.");
            } else {
                resolve("Volumen estable. La consistencia es clave para la hipertrofia a largo plazo.");
            }
        }, 1000);
    });
};

export const getTargetVolumeRecommendation = async (userProfile: UserProfile): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Basado en tu meta de ${userProfile.goal}, recomendamos priorizar la intensidad sobre el volumen puro.`);
        }, 1000);
    });
}

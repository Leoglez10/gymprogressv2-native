import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    title: "Vence a tu versión de ayer",
    description: "Visualiza tus récords anteriores mientras entrenas. La clave es la sobrecarga progresiva inteligente.",
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
    icon: "📈",
    color: '#FFEF0A',
  },
  {
    title: "Control de Fatiga ACWR",
    description: "Analizamos tu carga de trabajo para decirte cuándo apretar y cuándo es mejor descansar.",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    icon: "📊",
    color: '#60a5fa',
  },
  {
    title: "Entrena sin Conexión",
    description: "Tus rutinas y progresos siempre contigo, incluso en el sótano del gimnasio más remoto.",
    img: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    icon: "☁️",
    color: '#4ade80',
  }
];

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ONBOARDING_SLIDES.length);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentSlide]);

  const handleStart = () => {
    stopAutoPlay();
    navigation.navigate('Signup');
  };

  const currentData = ONBOARDING_SLIDES[currentSlide];

  const words = currentData.title.split(' ');
  const lastWord = words.pop();
  const titleStart = words.join(' ');

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: currentData.img }}
        style={styles.backgroundImage}
      />
      
      <LinearGradient
        colors={['rgba(15,15,15,0.3)', 'rgba(15,15,15,0.6)', '#0f0f0f']}
        style={styles.gradientOverlay}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>💪</Text>
            </View>
            <Text style={styles.logoText}>GYMPROGRESS</Text>
          </View>
          <TouchableOpacity onPress={handleStart} style={styles.skipButton}>
            <Text style={styles.skipText}>SALTAR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.indicators}>
            {ONBOARDING_SLIDES.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setCurrentSlide(i)}
                style={[
                  styles.indicator,
                  currentSlide === i && styles.indicatorActive,
                ]}
              />
            ))}
          </View>

          <Animated.View
            style={[
              styles.slideContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.iconRow}>
              <View style={[styles.iconBox, { borderColor: currentData.color + '30' }]}>
                <Text style={styles.iconText}>{currentData.icon}</Text>
              </View>
              <Text style={styles.subtitle}>RENDIMIENTO REAL</Text>
            </View>

            <Text style={styles.title}>
              {titleStart}{' '}
              <Text style={[styles.titleHighlight, { color: currentData.color }]}>
                {lastWord}
              </Text>
            </Text>

            <Text style={styles.description}>{currentData.description}</Text>
          </Animated.View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleStart}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#FFEF0A', '#FFD700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>COMENZAR MI CAMBIO</Text>
              <Text style={styles.ctaArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.swipeHint}>
            <View style={styles.swipeHintLine} />
            <Text style={styles.swipeHintText}>DESLIZA PARA EXPLORAR</Text>
            <View style={styles.swipeHintLine} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.5,
  },
  gradientOverlay: {
    position: 'absolute',
    width: width,
    height: height,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#FFEF0A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoIconText: {
    fontSize: 18,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -0.5,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  skipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  indicators: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  indicator: {
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
  },
  indicatorActive: {
    width: 48,
    backgroundColor: '#FFEF0A',
  },
  slideContent: {
    marginBottom: 40,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 4,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 44,
    letterSpacing: -1,
    marginBottom: 16,
  },
  titleHighlight: {},
  description: {
    fontSize: 17,
    color: '#aaa',
    lineHeight: 26,
    maxWidth: 320,
  },
  ctaButton: {
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 24,
  },
  ctaGradient: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: -0.5,
    marginRight: 12,
  },
  ctaArrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  swipeHintLine: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 6,
  },
  swipeHintText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 3,
  },
});

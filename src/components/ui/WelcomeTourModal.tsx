import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  withSequence,
  FadeIn,
  FadeInUp,
  ZoomIn,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WelcomeTourModalProps {
  visible: boolean;
  userName?: string;
  onStartTour: () => void;
  onSkip: () => void;
}

// Partículas de estrellas
const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * SCREEN_WIDTH,
  y: Math.random() * SCREEN_HEIGHT * 0.6,
  delay: Math.random() * 2000,
  duration: Math.random() * 2000 + 2000,
}));

// Features del preview
const FEATURES = [
  {
    icon: 'trending_up',
    title: 'Progreso',
    desc: 'Visualiza tu evolución',
    color: '#FFEF0A',
  },
  {
    icon: 'fitness_center',
    title: 'Entrenos',
    desc: 'Registra cada sesión',
    color: '#60a5fa',
  },
  {
    icon: 'psychology',
    title: 'Coach IA',
    desc: 'Consejos inteligentes',
    color: '#c084fc',
  },
];

const StarParticle: React.FC<{ particle: typeof PARTICLES[0] }> = ({ particle }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  
  useEffect(() => {
    opacity.value = withDelay(
      particle.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: particle.duration / 2 }),
          withTiming(0.3, { duration: particle.duration / 2 })
        ),
        -1,
        true
      )
    );
    scale.value = withDelay(
      particle.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: particle.duration / 2 }),
          withTiming(0.7, { duration: particle.duration / 2 })
        ),
        -1,
        true
      )
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
        },
      ]}
    />
  );
};

export const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({
  visible,
  userName,
  onStartTour,
  onSkip,
}) => {
  const insets = useSafeAreaInsets();
  
  // Animación del orbe central
  const orbPulse = useSharedValue(1);
  
  useEffect(() => {
    if (visible) {
      orbPulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 2000 }),
          withTiming(1, { duration: 2000 })
        ),
        -1,
        true
      );
    }
  }, [visible]);
  
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbPulse.value }],
  }));
  
  if (!visible) return null;
  
  const greeting = userName ? `¡Hola, ${userName}!` : '¡Bienvenido!';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Background gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.95)', 'rgba(88,28,135,0.4)', 'rgba(0,0,0,0.95)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Star particles */}
        {PARTICLES.map((particle) => (
          <StarParticle key={particle.id} particle={particle} />
        ))}
        
        {/* Orbe brillante */}
        <Animated.View style={[styles.orb, orbStyle]}>
          <LinearGradient
            colors={['rgba(255,239,10,0.3)', 'rgba(255,239,10,0.05)']}
            style={styles.orbGradient}
          />
        </Animated.View>
        
        {/* Content */}
        <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
          {/* Icon grande */}
          <Animated.View
            entering={ZoomIn.delay(200).duration(500)}
            style={styles.iconContainer}
          >
            <LinearGradient
              colors={['rgba(255,239,10,0.2)', 'rgba(255,239,10,0.05)']}
              style={styles.iconGradient}
            >
              <Icon name="waving_hand" size={48} color="#FFEF0A" />
            </LinearGradient>
          </Animated.View>
          
          {/* Greeting */}
          <Animated.Text
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.greeting}
          >
            {greeting}
          </Animated.Text>
          
          {/* Subtitle */}
          <Animated.Text
            entering={FadeInUp.delay(500).duration(600)}
            style={styles.subtitle}
          >
            Te mostramos cómo sacarle el máximo{'\n'}provecho a tu entrenamiento
          </Animated.Text>
          
          {/* Features preview */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            style={styles.featuresRow}
          >
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                  <Icon name={feature.icon} size={24} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            ))}
          </Animated.View>
          
          {/* Spacer */}
          <View style={{ flex: 1 }} />
          
          {/* CTA Button */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(600)}
            style={styles.ctaContainer}
          >
            <TouchableOpacity
              onPress={onStartTour}
              activeOpacity={0.9}
              style={styles.ctaButton}
            >
              <LinearGradient
                colors={['#FFEF0A', '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}
              >
                <Icon name="rocket_launch" size={24} color="#000" />
                <Text style={styles.ctaText}>¡Empezar Tour!</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Ya conozco la app</Text>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Bottom padding */}
          <View style={{ height: insets.bottom + 20 }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  orb: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    left: SCREEN_WIDTH / 2 - 100,
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  orbGradient: {
    flex: 1,
    borderRadius: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 28,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,239,10,0.3)',
  },
  greeting: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  featureItem: {
    alignItems: 'center',
    width: 95,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 11,
    color: '#71717a',
    textAlign: 'center',
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FFEF0A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.3,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 14,
    color: '#71717a',
    fontWeight: '600',
  },
});

export default WelcomeTourModal;

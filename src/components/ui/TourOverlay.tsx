import React, { useEffect } from 'react';
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
  withSequence,
  FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { TourStep } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TourOverlayProps {
  visible: boolean;
  step: TourStep | null;
  stepIndex: number;
  totalSteps: number;
  progress: number;
  onNext: () => void;
  onPrev: () => void;
  onDismiss: () => void;
  targetLayout?: { x: number; y: number; width: number; height: number } | null;
}

// Iconos para cada paso (como en web)
const STEP_ICONS = [
  'waving_hand', 'dashboard_customize', 'fitness_center', 'directions',
  'psychology', 'person', 'rocket_launch', 'search', 'add_circle',
  'ecg_heart', 'emoji_events', 'self_improvement', 'trending_up',
  'lock_open', 'rocket_launch'
];

const getSectionInfo = (index: number) => {
  if (index <= 2) return { section: 'Dashboard', step: index + 1, total: 3 };
  if (index === 3) return { section: 'Análisis', step: 1, total: 1 };
  if (index <= 5) return { section: 'Ejercicios', step: index - 3, total: 3 };
  if (index <= 8) return { section: 'Salud', step: index - 5, total: 4 };
  if (index <= 10) return { section: 'Funciones PRO', step: index - 8, total: 3 };
  return { section: 'Perfil', step: index - 10, total: 2 };
};

export const TourOverlay: React.FC<TourOverlayProps> = ({
  visible,
  step,
  stepIndex,
  totalSteps,
  progress,
  onNext,
  onPrev,
  onDismiss,
  targetLayout,
}) => {
  const insets = useSafeAreaInsets();

  // Animación de bounce para la flecha
  const bounceAnim = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      bounceAnim.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 500 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [visible]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceAnim.value }],
  }));

  if (!visible || !step) return null;

  const sectionInfo = getSectionInfo(stepIndex);
  const icon = STEP_ICONS[stepIndex] || 'help';
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  // Determinar posición del tooltip (arriba o abajo del target)
  const tooltipPosition = step.position || 'bottom';
  const hasTarget = targetLayout && targetLayout.width > 0;

  // Calcular posición del spotlight
  const spotlightStyle = hasTarget ? {
    top: targetLayout.y - 8,
    left: targetLayout.x - 8,
    width: targetLayout.width + 16,
    height: targetLayout.height + 16,
    borderRadius: 20,
  } : null;

  // Calcular posición del tooltip
  const tooltipTop = hasTarget
    ? tooltipPosition === 'bottom'
      ? targetLayout.y + targetLayout.height + 40
      : targetLayout.y - 220
    : SCREEN_HEIGHT / 2 - 120;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop oscuro */}
        <View style={styles.backdrop} />

        {/* Spotlight (agujero iluminado) */}
        {hasTarget && (
          <View style={[styles.spotlight, spotlightStyle]}>
            <View style={styles.spotlightGlow} />
          </View>
        )}

        {/* Flecha animada apuntando al elemento */}
        {hasTarget && (
          <Animated.View
            style={[
              styles.arrow,
              arrowStyle,
              {
                top: tooltipPosition === 'bottom'
                  ? targetLayout.y + targetLayout.height + 8
                  : targetLayout.y - 36,
                left: targetLayout.x + targetLayout.width / 2 - 12,
              },
            ]}
          >
            <Icon
              name={tooltipPosition === 'bottom' ? 'arrow_upward' : 'arrow_downward'}
              size={24}
              color="#FFEF0A"
            />
          </Animated.View>
        )}

        {/* Tooltip Card */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[
            styles.tooltip,
            {
              top: tooltipTop,
              marginHorizontal: 20,
            },
          ]}
        >
          {/* Header con sección */}
          <View style={styles.tooltipHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionText}>
                {sectionInfo.section} • Paso {sectionInfo.step}/{sectionInfo.total}
              </Text>
            </View>

            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <Icon name="close" size={20} color="#71717a" />
            </TouchableOpacity>
          </View>

          {/* Icon + Title */}
          <View style={styles.titleRow}>
            <View style={styles.iconCircle}>
              <Icon name={icon} size={28} color="#FFEF0A" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{step.title}</Text>
              {step.badge && (
                <View style={[
                  styles.badge,
                  step.badge === 'PRO' && styles.badgePro,
                  step.badge === 'NUEVO' && styles.badgeNew,
                ]}>
                  <Text style={[
                    styles.badgeText,
                    step.badge === 'PRO' && { color: '#c084fc' },
                    step.badge === 'NUEVO' && { color: '#22c55e' },
                  ]}>{step.badge}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <Text style={styles.content}>{step.content}</Text>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          {/* Navigation dots */}
          <View style={styles.dotsContainer}>
            {Array.from({ length: Math.min(totalSteps, 8) }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === stepIndex && styles.dotActive,
                  i < stepIndex && styles.dotCompleted,
                ]}
              />
            ))}
            {totalSteps > 8 && (
              <Text style={styles.dotsMore}>+{totalSteps - 8}</Text>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            {!isFirst ? (
              <TouchableOpacity onPress={onPrev} style={styles.prevBtn}>
                <Icon name="chevron_left" size={20} color="#a1a1aa" />
                <Text style={styles.prevText}>Anterior</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            <TouchableOpacity
              onPress={onNext}
              style={styles.nextBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.nextText}>
                {isLast ? 'Finalizar' : 'Siguiente'}
              </Text>
              <Icon
                name={isLast ? 'check' : 'chevron_right'}
                size={20}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  spotlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#FFEF0A',
    shadowColor: '#FFEF0A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 20,
  },
  spotlightGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 239, 10, 0.08)',
    borderRadius: 16,
  },
  arrow: {
    position: 'absolute',
    zIndex: 100,
  },
  tooltip: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#18181b',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 24,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionBadge: {
    backgroundColor: 'rgba(255, 239, 10, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  sectionText: {
    color: '#FFEF0A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 239, 10, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  title: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#3f3f46',
  },
  badgePro: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  badgeNew: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a1a1aa',
    letterSpacing: 0.5,
  },
  content: {
    color: '#a1a1aa',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: '#27272a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFEF0A',
    borderRadius: 3,
  },
  progressText: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3f3f46',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#FFEF0A',
  },
  dotCompleted: {
    backgroundColor: 'rgba(255, 239, 10, 0.4)',
  },
  dotsMore: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  prevText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEF0A',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 18,
    gap: 6,
    shadowColor: '#FFEF0A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  nextText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default TourOverlay;

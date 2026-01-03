import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';

const { width } = Dimensions.get('window');

interface GoalInfo {
  key: string;
  title: string;
  desc: string;
  icon: string;
  tags: string[];
}

const GOAL_DETAILS: Record<string, GoalInfo> = {
  Strength: {
    key: 'Strength',
    title: "Fuerza Máxima",
    desc: "Enfoque en mover el máximo peso posible. Ideal para Powerlifting y ganar densidad ósea.",
    icon: "🏋️",
    tags: ["1-5 Reps", "Descansos largos", "Cargas >85%"]
  },
  Hypertrophy: {
    key: 'Hypertrophy',
    title: "Hipertrofia",
    desc: "Enfoque en el crecimiento muscular estético a través de un mayor volumen de trabajo.",
    icon: "💪",
    tags: ["8-12 Reps", "Descansos 60-90s", "Fallo muscular"]
  },
  WeightLoss: {
    key: 'WeightLoss',
    title: "Quema de Grasa",
    desc: "Mantener masa muscular mientras se prioriza el gasto calórico y la densidad del entrenamiento.",
    icon: "🔥",
    tags: ["12-15 Reps", "Descansos cortos", "Alta densidad"]
  }
};

interface GoalCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ title, description, icon, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    style={styles.card}
  >
    <View style={styles.cardIconContainer}>
      <Text style={styles.cardIcon}>{icon}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{description}</Text>
    </View>
    <View style={styles.cardArrow}>
      <Text style={styles.arrowText}>→</Text>
    </View>
  </TouchableOpacity>
);

type GoalSelectionScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'GoalSelection'>;
};

export const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({ navigation }) => {
  const [showGuide, setShowGuide] = useState(false);

  const handleSelect = (goal: string) => {
    navigation.navigate('BodyData', { goal } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header con Botón de Ayuda */}
      <View style={styles.header}>
        <View style={styles.headerTexts}>
          <Text style={styles.superTitle}>COMIENZA AQUÍ</Text>
          <Text style={styles.title}>¿Cuál es tu meta principal?</Text>
          <Text style={styles.subtitle}>Personalizaremos tu experiencia según tu elección.</Text>
        </View>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setShowGuide(true)}
        >
          <Text style={styles.helpIcon}>❓</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Tarjetas */}
      <ScrollView
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {Object.values(GOAL_DETAILS).map((goal) => (
          <GoalCard
            key={goal.key}
            title={goal.title}
            description={goal.desc}
            icon={goal.icon}
            onPress={() => handleSelect(goal.key)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerIcon}>ℹ️</Text>
          <Text style={styles.footerText}>PUEDES CAMBIAR TU OBJETIVO DESPUÉS</Text>
        </View>
      </View>

      {/* Modal de Guía */}
      <Modal
        visible={showGuide}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGuide(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowGuide(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Guía de Entrenamiento</Text>
                <Text style={styles.modalSubtitle}>DIFERENCIAS CLAVE</Text>
              </View>
              <TouchableOpacity onPress={() => setShowGuide(false)} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {Object.values(GOAL_DETAILS).map((info) => (
                <View key={info.key} style={styles.guideItem}>
                  <View style={styles.guideHeader}>
                    <View style={styles.guideIcon}>
                      <Text style={styles.guideIconText}>{info.icon}</Text>
                    </View>
                    <Text style={styles.guideTitle}>{info.title}</Text>
                  </View>
                  <Text style={styles.guideDesc}>{info.desc}</Text>
                  <View style={styles.tagsContainer}>
                    {info.tags.map(tag => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowGuide(false)}
            >
              <Text style={styles.modalButtonText}>ENTENDIDO, VOLVER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTexts: {
    flex: 1,
    paddingRight: 16,
  },
  superTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 36,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    fontWeight: '500',
  },
  helpButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFEF0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpIcon: {
    fontSize: 24,
  },
  cardsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFEF0A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  cardArrow: {
    width: 30,
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: '#666',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  footerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 1,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  modalHandle: {
    width: 60,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -1,
  },
  modalSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 2,
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#666',
  },
  guideItem: {
    marginBottom: 30,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFEF0A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  guideIconText: {
    fontSize: 24,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  guideDesc: {
    fontSize: 14,
    color: '#888',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 0.5,
  },
  modalButton: {
    backgroundColor: '#FFEF0A',
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 2,
  },
});

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Exercise, WorkoutStackParamList } from '../../types';
import { exerciseService, DEFAULT_EXERCISES } from '../../services/exercises';
import { MaterialIcons } from '@expo/vector-icons';

// ============ CONSTANTES ============

const ALL_MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Otros'];
const CATEGORIES = ['Push', 'Pull', 'Legs', 'Core'] as const;
const DIFFICULTY_LEVELS = ['Principiante', 'Intermedio', 'Avanzado'] as const;
const EQUIPMENT_TYPES = ['Barra', 'Mancuernas', 'Polea', 'Máquina', 'Peso Corporal', 'Otro'] as const;
const EXERCISE_TYPES = ['Compuesto', 'Aislamiento', 'Cardio'] as const;

// Ejercicios predefinidos ahora vienen del servicio
const _DEFAULT_EXERCISES_REF: Exercise[] = [
  // PUSH - Pecho
  { id: 'default-1', name: 'Press de Banca', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-2', name: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-3', name: 'Aperturas con Mancuernas', muscleGroup: 'Pecho', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-4', name: 'Fondos en Paralelas', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Peso Corporal', custom: false },
  { id: 'default-5', name: 'Press de Banca Declinado', muscleGroup: 'Pecho', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-6', name: 'Cruces en Polea', muscleGroup: 'Pecho', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Polea', custom: false },

  // PUSH - Hombros
  { id: 'default-7', name: 'Press Militar', muscleGroup: 'Hombros', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-8', name: 'Press Arnold', muscleGroup: 'Hombros', category: 'Push', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-9', name: 'Elevaciones Laterales', muscleGroup: 'Hombros', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-10', name: 'Elevaciones Frontales', muscleGroup: 'Hombros', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-11', name: 'Pájaros (Rear Delt)', muscleGroup: 'Hombros', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },

  // PUSH - Tríceps
  { id: 'default-12', name: 'Extensiones de Tríceps en Polea', muscleGroup: 'Brazos', category: 'Push', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-13', name: 'Press Francés', muscleGroup: 'Brazos', category: 'Push', type: 'Aislamiento', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-14', name: 'Fondos en Banco', muscleGroup: 'Brazos', category: 'Push', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Peso Corporal', custom: false },

  // PULL - Espalda
  { id: 'default-15', name: 'Peso Muerto', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Avanzado', equipment: 'Barra', custom: false },
  { id: 'default-16', name: 'Dominadas', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Peso Corporal', custom: false },
  { id: 'default-17', name: 'Remo con Barra', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-18', name: 'Remo con Mancuerna', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-19', name: 'Jalón al Pecho', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-20', name: 'Remo en Polea Baja', muscleGroup: 'Espalda', category: 'Pull', type: 'Compuesto', difficulty: 'Principiante', equipment: 'Polea', custom: false },
  { id: 'default-21', name: 'Face Pulls', muscleGroup: 'Espalda', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Polea', custom: false },

  // PULL - Bíceps
  { id: 'default-22', name: 'Curl con Barra', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Barra', custom: false },
  { id: 'default-23', name: 'Curl Martillo', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-24', name: 'Curl Concentrado', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Mancuernas', custom: false },
  { id: 'default-25', name: 'Curl en Predicador', muscleGroup: 'Brazos', category: 'Pull', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Barra', custom: false },

  // LEGS - Piernas
  { id: 'default-26', name: 'Sentadilla con Barra', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Avanzado', equipment: 'Barra', custom: false },
  { id: 'default-27', name: 'Prensa de Piernas', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Máquina', custom: false },
  { id: 'default-28', name: 'Peso Muerto Rumano', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-29', name: 'Extensiones de Cuádriceps', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-30', name: 'Curl de Femoral', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-31', name: 'Zancadas', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Mancuernas', custom: false },
  { id: 'default-32', name: 'Hip Thrust', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Intermedio', equipment: 'Barra', custom: false },
  { id: 'default-33', name: 'Elevación de Pantorrillas', muscleGroup: 'Piernas', category: 'Legs', type: 'Aislamiento', difficulty: 'Principiante', equipment: 'Máquina', custom: false },
  { id: 'default-34', name: 'Sentadilla Búlgara', muscleGroup: 'Piernas', category: 'Legs', type: 'Compuesto', difficulty: 'Avanzado', equipment: 'Mancuernas', custom: false },

  // El array viejo ya no se usa - los ejercicios vienen del servicio
];

// ============ HELPERS ============

const getMuscleIcon = (muscle: string): string => {
  const map: Record<string, string> = {
    'Pecho': 'fitness-center',
    'Espalda': 'accessibility-new',
    'Piernas': 'directions-walk',
    'Hombros': 'sports-handball',
    'Brazos': 'sports-mma',
    'Core': 'self-improvement',
    'Otros': 'sports-gymnastics',
  };
  return map[muscle] || 'sports-gymnastics';
};

const getCategoryColor = (category?: string): string => {
  const map: Record<string, string> = {
    'Push': '#ef4444',
    'Pull': '#3b82f6',
    'Legs': '#22c55e',
    'Core': '#eab308',
  };
  return map[category || ''] || '#FFEF0A';
};

const getDifficultyColor = (difficulty?: string): string => {
  const map: Record<string, string> = {
    'Principiante': '#22c55e',
    'Intermedio': '#f97316',
    'Avanzado': '#ef4444',
  };
  return map[difficulty || ''] || '#71717a';
};

// ============ COMPONENTE PRINCIPAL ============

export default function ExerciseLibraryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();

  // Estados principales
  const [userExercises, setUserExercises] = useState<Exercise[]>([]);
  const [favoritedSystemIds, setFavoritedSystemIds] = useState<string[]>([]);
  const [systemWeights, setSystemWeights] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyCustom, setShowOnlyCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formMuscle, setFormMuscle] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Push');
  const [formDifficulty, setFormDifficulty] = useState<string>('Intermedio');
  const [formType, setFormType] = useState<string>('Compuesto');
  const [formEquipment, setFormEquipment] = useState<string>('Barra');
  const [formDescription, setFormDescription] = useState('');

  // ============ CARGAR DATOS (usando nuevo servicio) ============

  const loadData = useCallback(async () => {
    // Only show loading indicator on first load or if empty
    if (userExercises.length === 0 && favoritedSystemIds.length === 0) {
      setIsLoading(true);
    }

    try {
      // Usar el nuevo servicio que combina todo
      const allExercises = await exerciseService.getAllExercises();

      // Separar ejercicios personalizados para edición
      const customExercises = allExercises.filter(ex => ex.custom === true);
      setUserExercises(customExercises);

      // Extraer IDs de favoritos del sistema
      const systemFavorites = allExercises
        .filter(ex => ex.id?.startsWith('default-') && ex.isFavorite)
        .map(ex => ex.id);
      setFavoritedSystemIds(systemFavorites);

      // Extraer pesos del sistema
      const weights: Record<string, number> = {};
      allExercises.forEach(ex => {
        if (ex.id?.startsWith('default-') && ex.lastWeight) {
          weights[ex.id] = ex.lastWeight;
        }
      });
      setSystemWeights(weights);

      // Sincronizar con la nube si hay conexión
      await exerciseService.syncFromCloud();
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // ============ COMBINAR EJERCICIOS (SISTEMA + USUARIO) ============

  const allExercises = useMemo(() => {
    // Combinar ejercicios del sistema con estado de favoritos y pesos
    const systemWithState = DEFAULT_EXERCISES.map(ex => ({
      ...ex,
      isFavorite: favoritedSystemIds.includes(ex.id),
      lastWeight: systemWeights[ex.id] || 0,
    }));

    return [...systemWithState, ...userExercises];
  }, [userExercises, favoritedSystemIds, systemWeights]);

  // ============ FILTRADO MEJORADO CON BÚSQUEDA FUZZY ============

  const filteredExercises = useMemo(() => {
    // Primero aplicar búsqueda fuzzy
    let results = searchTerm.trim()
      ? exerciseService.fuzzySearch(allExercises, searchTerm)
      : allExercises;

    // Luego aplicar filtros adicionales
    return results.filter(ex => {
      const matchMuscle = !selectedMuscle || ex.muscleGroup === selectedMuscle;
      const matchCategory = !selectedCategory || ex.category === selectedCategory;
      const matchEquipment = !selectedEquipment || ex.equipment === selectedEquipment;
      const matchFavorite = !showOnlyFavorites || ex.isFavorite;
      const matchCustom = !showOnlyCustom || ex.custom === true;

      return matchMuscle && matchCategory && matchEquipment && matchFavorite && matchCustom;
    });
  }, [allExercises, searchTerm, selectedMuscle, selectedCategory, selectedEquipment, showOnlyFavorites, showOnlyCustom]);

  const favoriteExercises = filteredExercises.filter(ex => ex.isFavorite);
  const regularExercises = filteredExercises.filter(ex => !ex.isFavorite);

  // ============ HELPERS DE FORMULARIO ============

  const resetForm = () => {
    setFormName('');
    setFormMuscle('');
    setFormCategory('Push');
    setFormDifficulty('Intermedio');
    setFormType('Compuesto');
    setFormEquipment('Barra');
    setFormDescription('');
  };

  const clearFilters = () => {
    setSelectedMuscle(null);
    setSelectedCategory(null);
    setSelectedEquipment(null);
    setShowOnlyFavorites(false);
    setShowOnlyCustom(false);
  };

  const hasActiveFilters = selectedMuscle || selectedCategory || selectedEquipment || showOnlyFavorites || showOnlyCustom;

  // ============ GUARDAR DATOS (usando nuevo servicio) ============

  const saveAllData = async (
    customExercises: Exercise[],
    systemFavorites: string[],
    weights: Record<string, number>
  ) => {
    // Ya no se usa - el servicio maneja la persistencia
    console.log('saveAllData deprecated - using exerciseService');
  };

  // ============ CRUD OPERATIONS (usando nuevo servicio) ============

  const handleCreate = async () => {
    if (!formName.trim()) {
      Alert.alert('Error', 'El nombre del ejercicio es requerido');
      return;
    }
    if (!formMuscle) {
      Alert.alert('Error', 'Selecciona un grupo muscular');
      return;
    }

    // Verificar duplicados
    const isDuplicate = await exerciseService.checkDuplicate(formName.trim());
    if (isDuplicate) {
      Alert.alert(
        'Ejercicio Similar',
        `Ya existe un ejercicio con el nombre "${formName.trim()}". ¿Deseas crearlo de todas formas?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Crear', onPress: () => createExerciseConfirmed() },
        ]
      );
      return;
    }

    await createExerciseConfirmed();
  };

  const createExerciseConfirmed = async () => {
    try {
      const newExercise = await exerciseService.createExercise({
        name: formName.trim(),
        muscleGroup: formMuscle,
        category: formCategory,
        difficulty: formDifficulty,
        type: formType,
        equipment: formEquipment,
        description: formDescription.trim(),
      });

      // Actualizar estado local
      setUserExercises(prev => [...prev, newExercise]);

      setShowCreateModal(false);
      resetForm();
      Alert.alert('Ejercicio Creado', `"${newExercise.name}" se ha añadido y sincronizado`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el ejercicio');
    }
  };

  const handleEdit = async () => {
    if (!editingExercise) return;

    if (!formName.trim()) {
      Alert.alert('Error', 'El nombre del ejercicio es requerido');
      return;
    }
    if (!formMuscle) {
      Alert.alert('Error', 'Selecciona un grupo muscular');
      return;
    }

    if (!editingExercise.custom) {
      Alert.alert('Error', 'Solo puedes editar ejercicios personalizados');
      return;
    }

    try {
      await exerciseService.updateExercise(editingExercise.id, {
        name: formName.trim(),
        muscleGroup: formMuscle,
        category: formCategory,
        difficulty: formDifficulty,
        type: formType,
        equipment: formEquipment,
        description: formDescription.trim(),
      });

      // Actualizar estado local
      const updated = userExercises.map(ex =>
        ex.id === editingExercise.id
          ? {
            ...ex,
            name: formName.trim(),
            muscleGroup: formMuscle,
            category: formCategory,
            difficulty: formDifficulty,
            type: formType,
            equipment: formEquipment,
            description: formDescription.trim(),
          }
          : ex
      );

      setUserExercises(updated);

      setShowEditModal(false);
      setEditingExercise(null);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el ejercicio');
    }
  };

  const handleDelete = (exercise: Exercise) => {
    if (!exercise.custom) {
      Alert.alert('No permitido', 'Solo puedes eliminar ejercicios que hayas creado tú');
      return;
    }

    Alert.alert(
      'Eliminar Ejercicio',
      `¿Estás seguro de eliminar "${exercise.name}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await exerciseService.deleteExercise(exercise.id);
              setUserExercises(prev => prev.filter(ex => ex.id !== exercise.id));
              setShowDetailModal(false);
              setSelectedExercise(null);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el ejercicio');
            }
          },
        },
      ]
    );
  };

  const toggleFavorite = async (exercise: Exercise) => {
    try {
      const newFavState = await exerciseService.toggleFavorite(exercise.id);

      if (exercise.custom) {
        setUserExercises(prev => prev.map(ex =>
          ex.id === exercise.id ? { ...ex, isFavorite: newFavState } : ex
        ));
      } else {
        if (newFavState) {
          setFavoritedSystemIds(prev => [...prev, exercise.id]);
        } else {
          setFavoritedSystemIds(prev => prev.filter(id => id !== exercise.id));
        }
      }

      // Actualizar el ejercicio seleccionado si está abierto el modal
      if (selectedExercise?.id === exercise.id) {
        setSelectedExercise({ ...selectedExercise, isFavorite: newFavState });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const openEditModal = (exercise: Exercise) => {
    if (!exercise.custom) {
      setSelectedExercise(exercise);
      setShowDetailModal(true);
      return;
    }

    setEditingExercise(exercise);
    setFormName(exercise.name);
    setFormMuscle(exercise.muscleGroup || '');
    setFormCategory(exercise.category || 'Push');
    setFormDifficulty(exercise.difficulty || 'Intermedio');
    setFormType(exercise.type || 'Compuesto');
    setFormEquipment(exercise.equipment || 'Barra');
    setFormDescription(exercise.description || '');
    setShowEditModal(true);
  };

  const openCreateFromSearch = () => {
    setFormName(searchTerm);
    setShowCreateModal(true);
  };

  // ============ COMPONENTES UI ============

  const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
    const categoryColor = getCategoryColor(exercise.category);
    const isCustom = exercise.custom === true;

    return (
      <TouchableOpacity
        className="bg-zinc-900 rounded-2xl p-4 mb-3 border border-zinc-800"
        activeOpacity={0.8}
        onPress={() => {
          setSelectedExercise(exercise);
          setShowDetailModal(true);
        }}
        onLongPress={() => isCustom && handleDelete(exercise)}
      >
        <View className="flex-row items-center gap-4">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: categoryColor + '15' }}
          >
            <MaterialIcons name={getMuscleIcon(exercise.muscleGroup || '') as any} size={24} color={categoryColor} />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-bold text-base flex-1" numberOfLines={1}>
                {exercise.name}
              </Text>
              {exercise.isFavorite && <MaterialIcons name="star" size={16} color="#FFEF0A" />}
              {isCustom && (
                <View className="bg-purple-500/20 px-2 py-0.5 rounded">
                  <Text className="text-purple-400 text-[10px] font-bold">PERSONAL</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center gap-2 mt-1 flex-wrap">
              <View
                className="px-2 py-0.5 rounded"
                style={{ backgroundColor: categoryColor + '20' }}
              >
                <Text style={{ color: categoryColor }} className="text-[10px] font-bold">
                  {exercise.category}
                </Text>
              </View>
              <Text className="text-zinc-500 text-xs">{exercise.muscleGroup}</Text>
              {exercise.equipment && (
                <>
                  <Text className="text-zinc-700">•</Text>
                  <Text className="text-zinc-500 text-xs">{exercise.equipment}</Text>
                </>
              )}
              {(exercise.lastWeight ?? 0) > 0 && (
                <>
                  <Text className="text-zinc-700">•</Text>
                  <Text className="text-[#FFEF0A] text-xs font-bold">{exercise.lastWeight} kg</Text>
                </>
              )}
            </View>
          </View>

          <TouchableOpacity
            className="w-10 h-10 items-center justify-center"
            onPress={() => toggleFavorite(exercise)}
          >
            <MaterialIcons name={exercise.isFavorite ? 'star' : 'star-outline'} size={24} color={exercise.isFavorite ? '#FFEF0A' : '#71717a'} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Modal de formulario (crear/editar)
  const ExerciseFormModal = ({
    visible,
    onClose,
    onSubmit,
    title,
    isEdit = false,
  }: {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title: string;
    isEdit?: boolean;
  }) => (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/80">
        <View className="flex-1 mt-16 bg-zinc-900 rounded-t-[32px]">
          <View className="p-6 border-b border-zinc-800">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-2xl font-black">{title}</Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Text className="text-zinc-500 text-2xl">✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            className="flex-1 px-6 py-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Nombre */}
            <View className="mb-5">
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Nombre del Ejercicio *
              </Text>
              <TextInput
                className="bg-zinc-800 text-white font-bold text-base px-4 h-14 rounded-xl"
                placeholder="Ej: Press de Banca Inclinado"
                placeholderTextColor="#52525b"
                value={formName}
                onChangeText={setFormName}
                autoFocus={!isEdit}
              />
            </View>

            {/* Grupo Muscular */}
            <View className="mb-5">
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Grupo Muscular *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ALL_MUSCLE_GROUPS.map(muscle => (
                  <TouchableOpacity
                    key={muscle}
                    className={`px-4 py-3 rounded-xl flex-row items-center gap-2 ${formMuscle === muscle ? 'bg-[#FFEF0A]' : 'bg-zinc-800'
                      }`}
                    onPress={() => setFormMuscle(muscle)}
                  >
                    <MaterialIcons name={getMuscleIcon(muscle) as any} size={18} color={formMuscle === muscle ? '#000' : '#fff'} />
                    <Text className={`font-bold ${formMuscle === muscle ? 'text-black' : 'text-white'}`}>
                      {muscle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Categoría */}
            <View className="mb-5">
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Categoría
              </Text>
              <View className="flex-row gap-2">
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    className={`flex-1 py-3 rounded-xl items-center ${formCategory === cat ? '' : 'bg-zinc-800'
                      }`}
                    style={formCategory === cat ? { backgroundColor: getCategoryColor(cat) } : {}}
                    onPress={() => setFormCategory(cat)}
                  >
                    <Text className={`font-bold text-sm ${formCategory === cat ? 'text-white' : 'text-white'}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Equipamiento */}
            <View className="mb-5">
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Equipamiento
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {EQUIPMENT_TYPES.map(eq => (
                    <TouchableOpacity
                      key={eq}
                      className={`px-4 py-3 rounded-xl ${formEquipment === eq ? 'bg-[#FFEF0A]' : 'bg-zinc-800'
                        }`}
                      onPress={() => setFormEquipment(eq)}
                    >
                      <Text className={`font-bold text-sm ${formEquipment === eq ? 'text-black' : 'text-white'}`}>
                        {eq}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Dificultad */}
            <View className="mb-5">
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Dificultad
              </Text>
              <View className="flex-row gap-2">
                {DIFFICULTY_LEVELS.map(level => (
                  <TouchableOpacity
                    key={level}
                    className={`flex-1 py-3 rounded-xl items-center`}
                    style={{
                      backgroundColor: formDifficulty === level
                        ? getDifficultyColor(level)
                        : '#27272a'
                    }}
                    onPress={() => setFormDifficulty(level)}
                  >
                    <Text className={`font-bold text-sm ${formDifficulty === level ? 'text-white' : 'text-white'}`}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tipo */}
            <View className="mb-5">
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Tipo de Ejercicio
              </Text>
              <View className="flex-row gap-2">
                {EXERCISE_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    className={`flex-1 py-3 rounded-xl items-center ${formType === type ? 'bg-[#FFEF0A]' : 'bg-zinc-800'
                      }`}
                    onPress={() => setFormType(type)}
                  >
                    <Text className={`font-bold text-sm ${formType === type ? 'text-black' : 'text-white'}`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Descripción */}
            <View className="mb-6">
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
                Notas / Instrucciones (opcional)
              </Text>
              <TextInput
                className="bg-zinc-800 text-white font-bold text-base px-4 py-4 rounded-xl min-h-[100px]"
                placeholder="Tips de ejecución, variaciones, etc..."
                placeholderTextColor="#52525b"
                value={formDescription}
                onChangeText={setFormDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Botón Submit */}
            <TouchableOpacity
              className="bg-[#FFEF0A] py-4 rounded-xl items-center mb-8"
              onPress={onSubmit}
            >
              <Text className="text-black font-black text-lg">
                {isEdit ? 'Guardar Cambios' : '✓ Crear Ejercicio'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Modal de detalle del ejercicio
  const ExerciseDetailModal = () => {
    if (!selectedExercise) return null;

    const isCustom = selectedExercise.custom === true;
    const categoryColor = getCategoryColor(selectedExercise.category);

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View className="flex-1 bg-black/80">
          <View className="flex-1 mt-24 bg-zinc-900 rounded-t-[32px]">
            {/* Header */}
            <View className="p-6 border-b border-zinc-800">
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center gap-4 flex-1">
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: categoryColor + '20' }}
                  >
                    <MaterialIcons name={getMuscleIcon(selectedExercise.muscleGroup || '') as any} size={32} color={categoryColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-xl font-black">{selectedExercise.name}</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      {isCustom && (
                        <View className="bg-purple-500/20 px-2 py-0.5 rounded">
                          <Text className="text-purple-400 text-[10px] font-bold">PERSONAL</Text>
                        </View>
                      )}
                      <View
                        className="px-2 py-0.5 rounded"
                        style={{ backgroundColor: categoryColor + '20' }}
                      >
                        <Text style={{ color: categoryColor }} className="text-xs font-bold">
                          {selectedExercise.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowDetailModal(false)} className="p-2">
                  <Text className="text-zinc-500 text-2xl">✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="flex-1 px-6 py-4">
              {/* Info Grid */}
              <View className="flex-row flex-wrap gap-3 mb-6">
                <View className="bg-zinc-800 rounded-xl p-4 flex-1 min-w-[45%]">
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Músculo</Text>
                  <Text className="text-white font-bold text-base mt-1">{selectedExercise.muscleGroup}</Text>
                </View>
                <View className="bg-zinc-800 rounded-xl p-4 flex-1 min-w-[45%]">
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Equipamiento</Text>
                  <Text className="text-white font-bold text-base mt-1">{selectedExercise.equipment || 'N/A'}</Text>
                </View>
                <View className="bg-zinc-800 rounded-xl p-4 flex-1 min-w-[45%]">
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Dificultad</Text>
                  <Text
                    className="font-bold text-base mt-1"
                    style={{ color: getDifficultyColor(selectedExercise.difficulty) }}
                  >
                    {selectedExercise.difficulty || 'N/A'}
                  </Text>
                </View>
                <View className="bg-zinc-800 rounded-xl p-4 flex-1 min-w-[45%]">
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Tipo</Text>
                  <Text className="text-white font-bold text-base mt-1">{selectedExercise.type || 'N/A'}</Text>
                </View>
              </View>

              {/* Último peso usado */}
              {(selectedExercise.lastWeight ?? 0) > 0 && (
                <View className="bg-[#FFEF0A]/10 border border-[#FFEF0A]/30 rounded-2xl p-4 mb-6">
                  <Text className="text-[#FFEF0A] text-[10px] font-bold uppercase tracking-widest">
                    Último Peso Usado
                  </Text>
                  <Text className="text-[#FFEF0A] font-black text-3xl mt-1">
                    {selectedExercise.lastWeight} kg
                  </Text>
                </View>
              )}

              {/* Descripción */}
              {selectedExercise.description && (
                <View className="bg-zinc-800 rounded-2xl p-4 mb-6">
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                    Notas
                  </Text>
                  <Text className="text-white text-base">{selectedExercise.description}</Text>
                </View>
              )}

              {/* Acciones */}
              <View className="gap-3 mb-8">
                <TouchableOpacity
                  className="flex-row items-center justify-center gap-2 bg-[#FFEF0A] py-4 rounded-xl"
                  onPress={() => toggleFavorite(selectedExercise)}
                >
                  <Text className="text-xl">{selectedExercise.isFavorite ? '⭐' : '☆'}</Text>
                  <Text className="text-black font-black text-base">
                    {selectedExercise.isFavorite ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
                  </Text>
                </TouchableOpacity>

                {isCustom && (
                  <>
                    <TouchableOpacity
                      className="flex-row items-center justify-center gap-2 bg-zinc-800 py-4 rounded-xl"
                      onPress={() => {
                        setShowDetailModal(false);
                        setTimeout(() => openEditModal(selectedExercise), 300);
                      }}
                    >
                      <Text className="text-xl">✏️</Text>
                      <Text className="text-white font-bold text-base">Editar Ejercicio</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center justify-center gap-2 bg-red-500/10 py-4 rounded-xl"
                      onPress={() => handleDelete(selectedExercise)}
                    >
                      <Text className="text-xl">🗑️</Text>
                      <Text className="text-red-500 font-bold text-base">Eliminar Ejercicio</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ============ RENDER PRINCIPAL ============

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View>
            <Text className="text-white text-3xl font-black">Ejercicios</Text>
            <Text className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">
              {filteredExercises.length} de {allExercises.length} ejercicios
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#FFEF0A] w-12 h-12 rounded-xl items-center justify-center"
            onPress={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            <Text className="text-black text-2xl font-black">+</Text>
          </TouchableOpacity>
        </View>

        {/* Barra de búsqueda */}
        <View className="px-6 mb-4">
          <View className="bg-zinc-900 rounded-2xl flex-row items-center px-4 border border-zinc-800">
            <Text className="text-zinc-500 text-lg mr-2">🔍</Text>
            <TextInput
              className="flex-1 h-14 text-white font-bold"
              placeholder="Buscar ejercicios..."
              placeholderTextColor="#52525b"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Text className="text-zinc-500 text-lg">✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sugerencia para crear ejercicio */}
          {searchTerm.length > 2 && filteredExercises.length === 0 && (
            <TouchableOpacity
              className="mt-3 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex-row items-center gap-3"
              onPress={openCreateFromSearch}
            >
              <Text className="text-2xl">✨</Text>
              <View className="flex-1">
                <Text className="text-purple-400 font-bold">¿No encuentras "{searchTerm}"?</Text>
                <Text className="text-purple-300/70 text-sm">Toca aquí para crear este ejercicio</Text>
              </View>
              <Text className="text-purple-400 text-xl">→</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros rápidos */}
        <View className="px-6 mb-2">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity
              className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${showFilters ? 'bg-[#FFEF0A]' : 'bg-zinc-800'
                }`}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Text className={showFilters ? 'text-black' : 'text-white'}>🎛️</Text>
              <Text className={`font-bold text-sm ${showFilters ? 'text-black' : 'text-white'}`}>
                Filtros
              </Text>
              {hasActiveFilters && !showFilters && (
                <View className="w-2 h-2 bg-[#FFEF0A] rounded-full" />
              )}
            </TouchableOpacity>

            {hasActiveFilters && (
              <TouchableOpacity onPress={clearFilters}>
                <Text className="text-red-500 font-bold text-sm">Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <View className="px-6 mb-4 bg-zinc-900/50 py-4 mx-4 rounded-2xl">
            {/* Categoría */}
            <View className="mb-4">
              <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                Categoría
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-full ${!selectedCategory ? 'bg-[#FFEF0A]' : 'bg-zinc-800'}`}
                    onPress={() => setSelectedCategory(null)}
                  >
                    <Text className={`font-bold text-sm ${!selectedCategory ? 'text-black' : 'text-white'}`}>
                      Todas
                    </Text>
                  </TouchableOpacity>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      className={`px-4 py-2 rounded-full`}
                      style={{ backgroundColor: selectedCategory === cat ? getCategoryColor(cat) : '#27272a' }}
                      onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    >
                      <Text className="text-white font-bold text-sm">{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Equipamiento */}
            <View className="mb-4">
              <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                Equipamiento
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-full ${!selectedEquipment ? 'bg-[#FFEF0A]' : 'bg-zinc-800'}`}
                    onPress={() => setSelectedEquipment(null)}
                  >
                    <Text className={`font-bold text-sm ${!selectedEquipment ? 'text-black' : 'text-white'}`}>
                      Todos
                    </Text>
                  </TouchableOpacity>
                  {EQUIPMENT_TYPES.map(eq => (
                    <TouchableOpacity
                      key={eq}
                      className={`px-4 py-2 rounded-full ${selectedEquipment === eq ? 'bg-[#FFEF0A]' : 'bg-zinc-800'}`}
                      onPress={() => setSelectedEquipment(selectedEquipment === eq ? null : eq)}
                    >
                      <Text className={`font-bold text-sm ${selectedEquipment === eq ? 'text-black' : 'text-white'}`}>
                        {eq}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Toggles */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${showOnlyFavorites ? 'bg-[#FFEF0A]' : 'bg-zinc-800'}`}
                onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
              >
                <Text className={`font-bold ${showOnlyFavorites ? 'text-black' : 'text-white'}`}>
                  ⭐ Solo Favoritos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${showOnlyCustom ? 'bg-purple-500' : 'bg-zinc-800'}`}
                onPress={() => setShowOnlyCustom(!showOnlyCustom)}
              >
                <Text className={`font-bold text-white`}>
                  ✨ Solo Personales
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Filtro de músculos (siempre visible) */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          >
            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${!selectedMuscle ? 'bg-[#FFEF0A]' : 'bg-zinc-800'}`}
              onPress={() => setSelectedMuscle(null)}
            >
              <Text className={`font-bold text-sm ${!selectedMuscle ? 'text-black' : 'text-white'}`}>
                Todos
              </Text>
            </TouchableOpacity>
            {ALL_MUSCLE_GROUPS.filter(m => m !== 'Otros').map(muscle => (
              <TouchableOpacity
                key={muscle}
                className={`px-4 py-2 rounded-full flex-row items-center gap-1 ${selectedMuscle === muscle ? 'bg-[#FFEF0A]' : 'bg-zinc-800'}`}
                onPress={() => setSelectedMuscle(selectedMuscle === muscle ? null : muscle)}
              >
                <MaterialIcons name={getMuscleIcon(muscle) as any} size={16} color={selectedMuscle === muscle ? '#000' : '#fff'} />
                <Text className={`font-bold text-sm ${selectedMuscle === muscle ? 'text-black' : 'text-white'}`}>
                  {muscle}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sección de Favoritos */}
        {favoriteExercises.length > 0 && !searchTerm && (
          <View className="px-6 mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <MaterialIcons name="star" size={20} color="#FFEF0A" />
              <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                Favoritos ({favoriteExercises.length})
              </Text>
            </View>
            {favoriteExercises.map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </View>
        )}

        {/* Lista de ejercicios */}
        <View className="px-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-xl">📋</Text>
            <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
              {searchTerm || hasActiveFilters ? `Resultados (${regularExercises.length})` : `Todos (${regularExercises.length})`}
            </Text>
          </View>

          {regularExercises.length > 0 ? (
            regularExercises.map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))
          ) : filteredExercises.length === 0 && searchTerm ? (
            <View className="py-12 items-center">
              <Text className="text-zinc-500 text-4xl mb-4">🔍</Text>
              <Text className="text-white font-bold text-lg mb-2 text-center">
                No se encontró "{searchTerm}"
              </Text>
              <Text className="text-zinc-500 text-sm text-center mb-6">
                ¿Por qué no lo creas tú mismo?
              </Text>
              <TouchableOpacity
                className="bg-purple-500 px-8 py-4 rounded-2xl"
                onPress={openCreateFromSearch}
              >
                <Text className="text-white font-bold text-base">✨ Crear "{searchTerm}"</Text>
              </TouchableOpacity>
            </View>
          ) : filteredExercises.length === 0 ? (
            <View className="py-12 items-center">
              <Text className="text-zinc-500 text-4xl mb-4">🎛️</Text>
              <Text className="text-zinc-500 text-base text-center">
                No hay ejercicios con estos filtros
              </Text>
              <TouchableOpacity
                className="mt-4"
                onPress={clearFilters}
              >
                <Text className="text-[#FFEF0A] font-bold">Limpiar filtros</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Modales */}
      <ExerciseFormModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        onSubmit={handleCreate}
        title="Nuevo Ejercicio"
      />

      <ExerciseFormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingExercise(null);
          resetForm();
        }}
        onSubmit={handleEdit}
        title="Editar Ejercicio"
        isEdit
      />

      <ExerciseDetailModal />
    </SafeAreaView>
  );
}

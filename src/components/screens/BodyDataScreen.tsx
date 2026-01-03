import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types';

const VALID_LIMITS = {
  age: { min: 12, max: 100 },
  weight: { min: 30, max: 350 },
  height: { min: 100, max: 250 }
};

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, min, max, step = 1 }) => {
  const isAtMin = value <= min;
  const isAtMax = value >= max;
  const isInvalid = value < min || value > max;

  const handleTextChange = (text: string) => {
    const num = parseFloat(text);
    if (!isNaN(num)) onChange(num);
    else if (text === '') onChange(0);
  };

  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        <Text style={[styles.inputLabel, isInvalid && styles.inputLabelError]}>{label}</Text>
        {isInvalid && <Text style={styles.errorLabel}>FUERA DE RANGO</Text>}
      </View>
      
      <View style={[styles.inputWrapper, isInvalid && styles.inputWrapperError]}>
        <TouchableOpacity 
          onPress={() => onChange(Math.max(min, value - step))}
          disabled={isAtMin}
          style={[styles.stepperButton, isAtMin && styles.stepperDisabled]}
        >
          <Text style={[styles.stepperText, isAtMin && styles.stepperTextDisabled]}>−</Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.textInput, isInvalid && styles.textInputError]}
          value={value.toString()}
          keyboardType="numeric"
          onChangeText={handleTextChange}
          onBlur={() => {
            if (value < min) onChange(min);
            if (value > max) onChange(max);
          }}
        />

        <TouchableOpacity 
          onPress={() => onChange(Math.min(max, value + step))}
          disabled={isAtMax}
          style={[styles.stepperButton, isAtMax && styles.stepperDisabled]}
        >
          <Text style={[styles.stepperText, isAtMax && styles.stepperTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

type BodyDataScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'BodyData'>;
  route: RouteProp<AuthStackParamList, 'BodyData'>;
};

export const BodyDataScreen: React.FC<BodyDataScreenProps> = ({ navigation, route }) => {
  const goal = (route.params as any)?.goal || 'Hypertrophy';

  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);

  const isDataValid = 
    age >= VALID_LIMITS.age.min && age <= VALID_LIMITS.age.max &&
    weight >= VALID_LIMITS.weight.min && weight <= VALID_LIMITS.weight.max &&
    height >= VALID_LIMITS.height.min && height <= VALID_LIMITS.height.max;

  const handleNext = () => {
    if (isDataValid) {
      navigation.navigate('AliasSetting', { goal, gender, age, weight, height } as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DATOS CORPORALES</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleSection}>
            <Text style={styles.title}>Tus Datos Corporales</Text>
            <Text style={styles.subtitle}>Necesitamos esto para calcular tus cargas de forma segura.</Text>
          </View>

          <View style={styles.form}>
            {/* Género */}
            <View>
              <Text style={styles.inputLabel}>GÉNERO</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  onPress={() => setGender('Male')}
                  style={[
                    styles.genderButton,
                    gender === 'Male' ? styles.genderActive : styles.genderInactive
                  ]}
                >
                  <Text style={[
                    styles.genderText,
                    gender === 'Male' ? styles.genderTextActive : styles.genderTextInactive
                  ]}>
                    Hombre
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setGender('Female')}
                  style={[
                    styles.genderButton,
                    gender === 'Female' ? styles.genderActive : styles.genderInactive
                  ]}
                >
                  <Text style={[
                    styles.genderText,
                    gender === 'Female' ? styles.genderTextActive : styles.genderTextInactive
                  ]}>
                    Mujer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <NumberInput 
              label="EDAD (AÑOS)" 
              value={age} 
              onChange={setAge} 
              min={VALID_LIMITS.age.min} 
              max={VALID_LIMITS.age.max} 
            />
            <NumberInput 
              label="PESO (KG)" 
              value={weight} 
              onChange={setWeight} 
              min={VALID_LIMITS.weight.min} 
              max={VALID_LIMITS.weight.max} 
              step={0.5} 
            />
            <NumberInput 
              label="ALTURA (CM)" 
              value={height} 
              onChange={setHeight} 
              min={VALID_LIMITS.height.min} 
              max={VALID_LIMITS.height.max} 
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={handleNext}
              disabled={!isDataValid}
              style={[styles.nextButton, !isDataValid && styles.nextButtonDisabled]}
            >
              <Text style={styles.nextButtonText}>
                {isDataValid ? 'CONTINUAR' : 'DATOS NO VÁLIDOS'}
              </Text>
            </TouchableOpacity>
            
            {!isDataValid && (
              <Text style={styles.errorText}>REVISA QUE TUS MEDIDAS SEAN REALISTAS</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 48,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  form: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 2,
    marginBottom: 12,
  },
  inputLabelError: {
    color: '#ef4444',
  },
  genderRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 12,
  },
  genderActive: {
    backgroundColor: '#FFEF0A',
    borderColor: '#FFEF0A',
  },
  genderInactive: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  genderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  genderTextActive: {
    color: '#000',
  },
  genderTextInactive: {
    color: '#666',
  },
  
  // NumberInput Styles
  inputContainer: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ef4444',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 40,
    padding: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
    height: 80,
  },
  inputWrapperError: {
    borderColor: '#ef4444',
  },
  stepperButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperDisabled: {
    opacity: 0.3,
  },
  stepperText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepperTextDisabled: {
    color: '#666',
  },
  textInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  textInputError: {
    color: '#ef4444',
  },
  
  footer: {
    marginTop: 20,
  },
  nextButton: {
    backgroundColor: '#FFEF0A',
    paddingVertical: 22,
    borderRadius: 40,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.3,
    backgroundColor: '#666',
  },
  nextButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 16,
    letterSpacing: 1,
  },
});

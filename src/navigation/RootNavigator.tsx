import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { RootStackParamList, AuthStackParamList, MainTabParamList, OnboardingStackParamList, WorkoutStackParamList } from '../types';
import {
  LoginScreen,
  SignupScreen,
  ForgotPasswordScreen,
  OnboardingScreen,
  GoalSelectionScreen,
  BodyDataScreen,
  AliasSettingScreen,
  ProfileScreen,
  DashboardScreen,
  StartWorkoutScreen,
  StatsScreen,
  ActiveSessionScreen,
  CreateWorkoutScreen,
  ExerciseLibraryScreen,
  SummaryScreen,
  ManualLogScreen,
} from '../components/screens';

// Pantallas importadas desde ../components/screens

// Stacks
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const WorkoutStack = createNativeStackNavigator<WorkoutStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
      initialRouteName="Onboarding"
    >
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// Onboarding Navigator - para usuarios autenticados que no completaron onboarding
function OnboardingNavigator({ setOnboardingComplete }: { setOnboardingComplete: (v: boolean) => void }) {
  // Wrapper component to avoid inline function
  const AliasSettingWrapper = (props: any) => (
    <AliasSettingScreen {...props} setOnboardingComplete={setOnboardingComplete} />
  );

  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
      initialRouteName="GoalSelection"
    >
      <OnboardingStack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <OnboardingStack.Screen name="BodyData" component={BodyDataScreen} />
      <OnboardingStack.Screen
        name="AliasSetting"
        component={AliasSettingWrapper}
      />
    </OnboardingStack.Navigator>
  );
}

const TabIcon = ({ name, focused }: { name: keyof typeof MaterialIcons.glyphMap; focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <MaterialIcons name={name} size={24} color={focused ? '#FFEF0A' : '#666'} />
  </View>
);

// Workout Stack Navigator - para flujo de entrenamiento
function WorkoutNavigator() {
  return (
    <WorkoutStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
      initialRouteName="WorkoutHome"
    >
      <WorkoutStack.Screen name="WorkoutHome" component={StartWorkoutScreen} />
      <WorkoutStack.Screen name="ActiveSession" component={ActiveSessionScreen} />
      <WorkoutStack.Screen name="CreateWorkout" component={CreateWorkoutScreen} />
      <WorkoutStack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
      <WorkoutStack.Screen name="Summary" component={SummaryScreen} />
      <WorkoutStack.Screen name="ManualLog" component={ManualLogScreen} />
    </WorkoutStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FFEF0A',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <MainTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <MainTab.Screen
        name="StartWorkout"
        component={WorkoutNavigator}
        options={{
          tabBarLabel: 'Entrenar',
          tabBarIcon: ({ focused }) => <TabIcon name="fitness-center" focused={focused} />,
        }}
      />
      <MainTab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ focused }) => <TabIcon name="bar-chart" focused={focused} />,
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
    </MainTab.Navigator>
  );
}

interface RootNavigatorProps {
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
}

export function RootNavigator({ isAuthenticated, onboardingComplete, setOnboardingComplete }: RootNavigatorProps) {
  // Determinar que navegador mostrar
  const getNavigator = () => {
    if (!isAuthenticated) {
      return <RootStack.Screen name="Auth" component={AuthNavigator} />;
    }

    if (!onboardingComplete) {
      return (
        <RootStack.Screen name="Onboarding">
          {() => <OnboardingNavigator setOnboardingComplete={setOnboardingComplete} />}
        </RootStack.Screen>
      );
    }

    return <RootStack.Screen name="Main" component={MainNavigator} />;
  };

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {getNavigator()}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholderSubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  tabBar: {
    backgroundColor: '#0f0f0f',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
    height: 80,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  tabIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabIconFocused: {
    backgroundColor: 'rgba(255, 239, 10, 0.1)',
  },
  tabIconText: {
    fontSize: 18,
  },
});

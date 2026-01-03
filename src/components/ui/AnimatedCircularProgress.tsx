import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
    interpolateColor,
    useDerivedValue
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedCircularProgressProps {
    size: number;
    strokeWidth: number;
    progress: number; // 0 to 100
    color: string;
    trackColor?: string;
    showText?: boolean;
    textSize?: number;
    textColor?: string;
    suffix?: string;
    // Optional icon or content to render inside
    children?: React.ReactNode;
}

export default function AnimatedCircularProgress({
    size,
    strokeWidth,
    progress,
    color,
    trackColor = '#27272a', // zinc-800
    showText = false,
    textSize = 18,
    textColor = 'white',
    suffix = '%',
    children
}: AnimatedCircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(progress, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        });
    }, [progress]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - (circumference * animatedProgress.value) / 100;
        return {
            strokeDashoffset,
        };
    });

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ position: 'absolute' }}>
                {/* Track Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Circle */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={`${circumference} ${circumference}`}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            {/* Content */}
            <View className="absolute inset-0 items-center justify-center">
                {children ? children : showText && (
                    <Text
                        style={{
                            color: textColor,
                            fontSize: textSize,
                            fontWeight: '900',
                            textAlign: 'center'
                        }}
                    >
                        {Math.round(progress)}{suffix}
                    </Text>
                )}
            </View>
        </View>
    );
}

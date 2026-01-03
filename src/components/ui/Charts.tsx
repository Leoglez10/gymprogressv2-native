import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { PieChart, BarChart, LineChart, ProgressChart } from 'react-native-chart-kit';
import Svg, { Defs, Stop, Rect, Path, G, Text as SvgText, Circle, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Colores consistentes con el diseño web
const COLORS = {
  primary: '#FFEF0A',
  chart: ['#FFEF0A', '#60a5fa', '#c084fc', '#22c55e', '#f97316', '#ef4444'],
  background: '#0f0f0f',
  surface: '#18181b',
  surfaceLight: '#27272a',
  text: '#ffffff',
  textMuted: '#a1a1aa',
};

// Configuración base del chart
const chartConfig = {
  backgroundGradientFrom: COLORS.surface,
  backgroundGradientTo: COLORS.surface,
  color: (opacity = 1) => `rgba(255, 239, 10, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
  propsForLabels: {
    fontSize: 10,
    fontWeight: '600',
  },
};

// ============== PIE CHART ==============
interface PieChartData {
  name: string;
  value: number;
  percent: number;
  color?: string;
}

interface CustomPieChartProps {
  data: PieChartData[];
  size?: number;
  innerRadius?: number;
  showLegend?: boolean;
}

export const CustomPieChart: React.FC<CustomPieChartProps> = ({
  data,
  size = 160,
  innerRadius = 45,
  showLegend = true,
}) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) {
    return (
      <View style={[styles.pieContainer, { width: size, height: size }]}>
        <View style={styles.emptyPie}>
          <Text style={styles.emptyText}>Sin datos</Text>
        </View>
      </View>
    );
  }

  // Calcular segmentos
  let currentAngle = -90; // Empezar desde arriba
  const segments = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      color: item.color || COLORS.chart[index % COLORS.chart.length],
      startAngle,
      endAngle,
      percentage,
    };
  });

  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 10;

  // Función para crear path de arco
  const createArcPath = (startAngle: number, endAngle: number, r: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <View style={styles.pieWrapper}>
      <Svg width={size} height={size}>
        <G>
          {segments.map((segment, index) => (
            <Path
              key={index}
              d={createArcPath(segment.startAngle, segment.endAngle, radius)}
              fill={segment.color}
              strokeWidth={1}
              stroke={COLORS.surface}
            />
          ))}
          {/* Centro vacío (donut) */}
          <Circle
            cx={cx}
            cy={cy}
            r={innerRadius}
            fill={COLORS.surface}
          />
        </G>
      </Svg>

      {showLegend && (
        <View style={styles.legend}>
          {segments.slice(0, 4).map((segment, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <Text style={styles.legendText} numberOfLines={1}>
                {segment.name}
              </Text>
              <Text style={styles.legendPercent}>
                {Math.round(segment.percentage * 100)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// ============== BAR CHART ==============
interface BarChartData {
  day: string;
  volume: number;
  isReal: boolean;
}

interface CustomBarChartProps {
  data: BarChartData[];
  width?: number;
  height?: number;
  showLabels?: boolean;
}

export const CustomBarChart: React.FC<CustomBarChartProps> = ({
  data,
  width = SCREEN_WIDTH - 80,
  height = 160,
  showLabels = true,
}) => {
  const maxVolume = Math.max(...data.map(d => d.volume), 1);
  const barWidth = (width - 40) / data.length - 8;

  return (
    <View style={[styles.barContainer, { width, height: height + 30 }]}>
      <View style={[styles.barChart, { height }]}>
        {data.map((item, index) => {
          const barHeight = (item.volume / maxVolume) * (height - 30);
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={[styles.barBackground, { height: height - 30 }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 4),
                      backgroundColor: item.isReal ? COLORS.primary : COLORS.surfaceLight,
                      width: barWidth,
                    },
                  ]}
                />
              </View>
              {showLabels && (
                <Text style={styles.barLabel}>{item.day}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ============== AREA CHART (para PRs) ==============
interface AreaChartData {
  label: string;
  value: number;
}

interface CustomAreaChartProps {
  data: AreaChartData[];
  width?: number;
  height?: number;
  color?: string;
}

export const CustomAreaChart: React.FC<CustomAreaChartProps> = ({
  data,
  width = SCREEN_WIDTH - 80,
  height = 120,
  color = COLORS.primary,
}) => {
  if (data.length < 2) {
    return (
      <View style={[styles.areaContainer, { width, height }]}>
        <Text style={styles.emptyText}>Necesitas más datos</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - 40;

  // Crear puntos
  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * chartWidth,
    y: padding + (1 - (d.value - minValue) / range) * chartHeight,
  }));

  // Crear path de línea
  const linePath = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  // Crear path del área
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - 20} L ${padding} ${height - 20} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgLinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <Stop offset="100%" stopColor={color} stopOpacity={0.05} />
        </SvgLinearGradient>
      </Defs>

      {/* Área con gradiente */}
      <Path
        d={areaPath}
        fill="url(#areaGradient)"
      />

      {/* Línea */}
      <Path
        d={linePath}
        stroke={color}
        strokeWidth={2}
        fill="none"
      />

      {/* Puntos */}
      {points.map((point, i) => (
        <Circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={4}
          fill={COLORS.surface}
          stroke={color}
          strokeWidth={2}
        />
      ))}

      {/* Labels */}
      {data.map((d, i) => (
        <SvgText
          key={i}
          x={points[i].x}
          y={height - 5}
          fill={COLORS.textMuted}
          fontSize={9}
          textAnchor="middle"
        >
          {d.label}
        </SvgText>
      ))}
    </Svg>
  );
};

// ============== PROGRESS GAUGE (para ACWR) ==============
interface ProgressGaugeProps {
  value: number; // 0-2 para ACWR
  size?: number;
  label?: string;
}

export const ProgressGauge: React.FC<ProgressGaugeProps> = ({
  value,
  size = 120,
  label,
}) => {
  // Normalizar valor para el gauge (0-100)
  const normalizedValue = Math.min(Math.max((value / 2) * 100, 0), 100);

  // Determinar color según zona ACWR
  let gaugeColor = COLORS.chart[3]; // Verde por defecto
  if (value < 0.8 || value > 1.5) {
    gaugeColor = COLORS.chart[5]; // Rojo - Zona de riesgo
  } else if (value < 1.0 || value > 1.3) {
    gaugeColor = '#f59e0b'; // Amarillo - Precaución
  }

  const radius = (size - 20) / 2;
  const circumference = radius * Math.PI; // Solo medio círculo
  const progress = (normalizedValue / 100) * circumference;

  return (
    <View style={[styles.gaugeContainer, { width: size, height: size / 2 + 30 }]}>
      <Svg width={size} height={size / 2 + 10}>
        {/* Track */}
        <Path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          stroke={COLORS.surfaceLight}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
        {/* Progress */}
        <Path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          stroke={gaugeColor}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
      </Svg>

      <View style={styles.gaugeValue}>
        <Text style={[styles.gaugeNumber, { color: gaugeColor }]}>
          {value.toFixed(2)}
        </Text>
        {label && (
          <Text style={styles.gaugeLabel}>{label}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Pie Chart
  pieWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPie: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 100,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 80,
  },
  legendPercent: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },

  // Bar Chart
  barContainer: {
    alignItems: 'center',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: 'center',
  },
  barBackground: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    borderRadius: 12,
  },
  barLabel: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },

  // Area Chart
  areaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Gauge
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValue: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  gaugeNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  gaugeLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default {
  CustomPieChart,
  CustomBarChart,
  CustomAreaChart,
  ProgressGauge,
};

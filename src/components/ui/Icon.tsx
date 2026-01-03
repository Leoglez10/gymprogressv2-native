import React from 'react';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// Mapeo de nombres de material-symbols-outlined a MaterialIcons/MaterialCommunityIcons
const ICON_MAP: Record<string, { lib: 'mi' | 'mci'; name: string }> = {
  // Navigation & Actions
  'home': { lib: 'mi', name: 'home' },
  'monitoring': { lib: 'mci', name: 'chart-line-variant' },
  'tune': { lib: 'mi', name: 'tune' },
  'date_range': { lib: 'mi', name: 'date-range' },
  'keyboard_arrow_up': { lib: 'mi', name: 'keyboard-arrow-up' },
  'keyboard_arrow_down': { lib: 'mi', name: 'keyboard-arrow-down' },
  'replay': { lib: 'mi', name: 'replay' },
  'waving_hand': { lib: 'mci', name: 'hand-wave' },
  'dashboard_customize': { lib: 'mci', name: 'view-dashboard-edit' },
  'personal_injury': { lib: 'mci', name: 'human' },
  'neurology': { lib: 'mci', name: 'brain' },
  'offline_bolt': { lib: 'mci', name: 'lightning-bolt' },
  'arrow_back': { lib: 'mi', name: 'arrow-back' },
  'close': { lib: 'mi', name: 'close' },
  'chevron_right': { lib: 'mi', name: 'chevron-right' },
  'chevron_left': { lib: 'mi', name: 'chevron-left' },
  'add': { lib: 'mi', name: 'add' },
  'add_circle': { lib: 'mi', name: 'add-circle' },
  'check': { lib: 'mi', name: 'check' },
  'check_circle': { lib: 'mi', name: 'check-circle' },
  'edit': { lib: 'mi', name: 'edit' },
  'delete': { lib: 'mi', name: 'delete' },
  'settings': { lib: 'mi', name: 'settings' },
  'more_vert': { lib: 'mi', name: 'more-vert' },
  'more_horiz': { lib: 'mi', name: 'more-horiz' },

  // Fitness & Health
  'fitness_center': { lib: 'mi', name: 'fitness-center' },
  'local_fire_department': { lib: 'mi', name: 'local-fire-department' },
  'bolt': { lib: 'mi', name: 'bolt' },
  'ecg_heart': { lib: 'mci', name: 'heart-pulse' },
  'favorite': { lib: 'mi', name: 'favorite' },
  'monitor_heart': { lib: 'mci', name: 'heart-pulse' },
  'bedtime': { lib: 'mci', name: 'bed' },
  'nights_stay': { lib: 'mci', name: 'weather-night' },
  'directions_run': { lib: 'mi', name: 'directions-run' },
  'self_improvement': { lib: 'mci', name: 'meditation' },

  // Stats & Charts
  'trending_up': { lib: 'mi', name: 'trending-up' },
  'trending_down': { lib: 'mi', name: 'trending-down' },
  'query_stats': { lib: 'mci', name: 'chart-line' },
  'bar_chart': { lib: 'mi', name: 'bar-chart' },
  'show_chart': { lib: 'mi', name: 'show-chart' },
  'analytics': { lib: 'mci', name: 'google-analytics' },
  'leaderboard': { lib: 'mi', name: 'leaderboard' },

  // Achievements & Goals
  'stars': { lib: 'mi', name: 'stars' },
  'star': { lib: 'mi', name: 'star' },
  'military_tech': { lib: 'mi', name: 'military-tech' },
  'emoji_events': { lib: 'mi', name: 'emoji-events' },
  'workspace_premium': { lib: 'mci', name: 'crown' },
  'trophy': { lib: 'mci', name: 'trophy' },
  'target': { lib: 'mci', name: 'target' },
  'flag': { lib: 'mi', name: 'flag' },

  // Time & Calendar
  'schedule': { lib: 'mi', name: 'schedule' },
  'calendar_today': { lib: 'mi', name: 'calendar-today' },
  'event': { lib: 'mi', name: 'event' },
  'history': { lib: 'mi', name: 'history' },
  'timer': { lib: 'mi', name: 'timer' },
  'access_time': { lib: 'mi', name: 'access-time' },

  // User & Profile
  'person': { lib: 'mi', name: 'person' },
  'person_outline': { lib: 'mi', name: 'person-outline' },
  'account_circle': { lib: 'mi', name: 'account-circle' },
  'face': { lib: 'mi', name: 'face' },
  'badge': { lib: 'mci', name: 'badge-account' },

  // Communication
  'mail': { lib: 'mi', name: 'mail' },
  'notifications': { lib: 'mi', name: 'notifications' },
  'notifications_active': { lib: 'mi', name: 'notifications-active' },
  'chat': { lib: 'mi', name: 'chat' },

  // AI & Brain
  'psychology': { lib: 'mi', name: 'psychology' },
  'auto_awesome': { lib: 'mi', name: 'auto-awesome' },
  'smart_toy': { lib: 'mci', name: 'robot' },

  // Data & Storage
  'cloud': { lib: 'mi', name: 'cloud' },
  'cloud_upload': { lib: 'mi', name: 'cloud-upload' },
  'cloud_download': { lib: 'mi', name: 'cloud-download' },
  'sync': { lib: 'mi', name: 'sync' },
  'backup': { lib: 'mi', name: 'backup' },

  // Security
  'visibility': { lib: 'mi', name: 'visibility' },
  'visibility_off': { lib: 'mi', name: 'visibility-off' },
  'lock': { lib: 'mi', name: 'lock' },
  'lock_open': { lib: 'mi', name: 'lock-open' },

  // Misc
  'info': { lib: 'mi', name: 'info' },
  'help': { lib: 'mi', name: 'help' },
  'warning': { lib: 'mi', name: 'warning' },
  'error': { lib: 'mi', name: 'error' },
  'priority_high': { lib: 'mi', name: 'priority-high' },
  'remove': { lib: 'mi', name: 'remove' },
  'play_arrow': { lib: 'mi', name: 'play-arrow' },
  'pause': { lib: 'mi', name: 'pause' },
  'stop': { lib: 'mi', name: 'stop' },
  'refresh': { lib: 'mi', name: 'refresh' },
  'expand_more': { lib: 'mi', name: 'expand-more' },
  'expand_less': { lib: 'mi', name: 'expand-less' },
  'open_in_full': { lib: 'mci', name: 'arrow-expand-all' },
  'close_fullscreen': { lib: 'mci', name: 'arrow-collapse-all' },
  'ios': { lib: 'mci', name: 'apple' },
  'rocket_launch': { lib: 'mci', name: 'rocket-launch' },
  'celebration': { lib: 'mci', name: 'party-popper' },
  'sports_score': { lib: 'mci', name: 'scoreboard' },
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#FFFFFF',
  style
}) => {
  const mapping = ICON_MAP[name];

  if (!mapping) {
    // Fallback: intentar usar MaterialIcons directamente
    return (
      <MaterialIcons
        name={name as any}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  if (mapping.lib === 'mci') {
    return (
      <MaterialCommunityIcons
        name={mapping.name as any}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  return (
    <MaterialIcons
      name={mapping.name as any}
      size={size}
      color={color}
      style={style}
    />
  );
};

// Componente para iconos con fondo circular (como en la web)
interface IconButtonProps extends IconProps {
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  onPress?: () => void;
}

export const IconBadge: React.FC<IconButtonProps> = ({
  name,
  size = 24,
  color = '#FFFFFF',
  backgroundColor = 'rgba(255, 239, 10, 0.1)',
  padding = 12,
  borderRadius = 16,
  style,
}) => {
  return (
    <View
      style={[
        {
          backgroundColor,
          padding,
          borderRadius,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style
      ]}
    >
      <Icon name={name} size={size} color={color} />
    </View>
  );
};

export default Icon;

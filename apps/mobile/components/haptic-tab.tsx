import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const { onPressIn, ...rest } = props;

  return (
    <Pressable
      {...rest}
      onPressIn={(ev) => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    />
  );
}

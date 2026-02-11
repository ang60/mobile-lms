import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#ffffff",
        },  
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarActiveTintColor: "#4F46E5",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarActiveTintColor: "#4F46E5",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="books.vertical.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          title: 'Subscription',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="creditcard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarActiveTintColor: "#4F46E5",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

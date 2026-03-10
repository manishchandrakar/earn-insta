import { Tabs, usePathname, router } from 'expo-router';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { wp, hp } from '@/utils/resposive';

const ICON_SIZE = wp(6);
const CONTENT_H = hp(7);

// ─── Custom tab bar ────────────────────────────────────────────────
const CustomTabBar = () => {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const isActive = (route: string) =>
    route === '/' ? pathname === '/' : pathname.startsWith(route);

  const color = (route: string) => (isActive(route) ? '#E91E8C' : '#888');

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom, height: CONTENT_H + insets.bottom }]}>
      {/* Home */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.replace('/')}
        activeOpacity={0.7}
      >
        <Ionicons name={isActive('/') ? 'home' : 'home-outline'} size={ICON_SIZE} color={color('/')} />
      </TouchableOpacity>

      {/* Upload — pink pill center */}
      <TouchableOpacity
        style={styles.tabItemCenter}
        onPress={() => router.navigate('/(tabs)/upload')}
        activeOpacity={0.8}
      >
        <View style={styles.uploadPill}>
          <Ionicons name="add" size={wp(7)} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.replace('/(tabs)/profile')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isActive('/profile') ? 'person' : 'person-outline'}
          size={ICON_SIZE}
          color={color('/profile')}
        />
      </TouchableOpacity>
    </View>
  );
};

// ─── Layout ────────────────────────────────────────────────────────
const TabLayout = () => (
  <Tabs
    tabBar={() => <CustomTabBar />}
    screenOptions={{ headerShown: false }}
  >
    <Tabs.Screen name="index" />
    <Tabs.Screen name="upload" />
    <Tabs.Screen name="profile" />
    <Tabs.Screen name="search" options={{ href: null }} />
    <Tabs.Screen name="notifications" options={{ href: null }} />
  </Tabs>
);

export default TabLayout;

// ─── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderTopWidth: 0.5,
    borderTopColor: '#222',
    alignItems: 'center',
    ...Platform.select({
      android: { elevation: 8 },
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: -2 } },
    }),
  },
  tabItem: {
    flex: 1,
    height: CONTENT_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemCenter: {
    flex: 1,
    height: CONTENT_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPill: {
    width: wp(14),
    height: hp(4.5),
    borderRadius: wp(3),
    backgroundColor: '#E91E8C',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const AppRoutes = {
  LOGIN:          '/(auth)/login',
  SIGNUP:         '/(auth)/signup',
  TABS:           '/(tabs)',
  SEARCH:         '/(tabs)/search',
  NOTIFICATIONS:  '/(tabs)/notifications',
  UPLOAD:         '/(tabs)/upload',
  PROFILE:        '/(tabs)/profile',
  EDIT_PROFILE:   '/edit-profile',
  REEL_VIEWER:    '/reel-viewer',
  FOLLOWERS:      '/followers',
  PRIVACY_POLICY: '/privacy-policy',
  DISCLAIMER:     '/disclaimer',
  CONTACT:        '/contact',
} as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];

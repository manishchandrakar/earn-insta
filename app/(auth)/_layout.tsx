import { Stack } from 'expo-router';

const AuthLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="login" />
    <Stack.Screen name="signup" />
  </Stack>
);

export default AuthLayout;

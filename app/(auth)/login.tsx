import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { AppRoutes } from '@/constants/routes';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, ILoginForm } from '@/utils/validationUtils';
import { toast } from '@/utils/toast';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

const LoginScreen = () => {
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ILoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: ILoginForm) => {
    try {
      await login(data.email, data.password);
      router.replace(AppRoutes.TABS);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Invalid credentials', { title: 'Login Failed' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Logo / Title */}
        <View style={styles.header}>
          <Text style={styles.logo}>🎬</Text>
          <Text style={styles.appName}>EarnInsta</Text>
          <Text style={styles.tagline}>Watch, Create & Earn</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Email"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Signup link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&rsquo;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push(AppRoutes.SIGNUP)}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(7.5),
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(6.25),
  },
  logo: {
    fontSize: responsiveFontSize(60),
    marginBottom: hp(1.25),
  },
  appName: {
    fontSize: responsiveFontSize(32),
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: responsiveFontSize(14),
    color: '#999',
    marginTop: hp(0.75),
  },
  form: {
    gap: hp(2),
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: wp(3),
    padding: wp(4),
    color: '#fff',
    fontSize: responsiveFontSize(15),
    borderWidth: 1,
    borderColor: '#333',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: responsiveFontSize(12),
    marginTop: hp(0.5),
    marginLeft: wp(1),
  },
  loginBtn: {
    backgroundColor: '#E91E8C',
    borderRadius: wp(3),
    padding: wp(4),
    alignItems: 'center',
    marginTop: hp(1),
  },
  loginBtnText: {
    color: '#fff',
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(3.75),
  },
  footerText: {
    color: '#999',
    fontSize: responsiveFontSize(14),
  },
  signupLink: {
    color: '#E91E8C',
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
  },
});

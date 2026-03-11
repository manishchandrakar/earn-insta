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
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { AppRoutes } from '@/constants/routes';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { signupSchema, ISignupForm } from '@/utils/validationUtils';
import toast from '@/utils/toast';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

const SignupScreen = () => {
  const { signup } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ISignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ISignupForm) => {
    try {
      await signup(data.email, data.username, data.password);
      router.replace(AppRoutes.TABS);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong', { title: 'Signup Failed' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🎬</Text>
          <Text style={styles.appName}>EarnInsta</Text>
          <Text style={styles.tagline}>Create your account</Text>
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
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholder="Username"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                />
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username.message}</Text>
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder="Confirm Password"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                )}
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.signupBtn}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(7.5),
    paddingVertical: hp(6.25),
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(5),
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
  signupBtn: {
    backgroundColor: '#E91E8C',
    borderRadius: wp(3),
    padding: wp(4),
    alignItems: 'center',
    marginTop: hp(1),
  },
  signupBtnText: {
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
  loginLink: {
    color: '#E91E8C',
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
  },
});

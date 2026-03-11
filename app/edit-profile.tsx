import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import AppButton from '@/components/ui/AppButton';
import Avatar from '@/components/ui/Avatar';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

export default function EditProfileScreen() {
  const { user, userProfile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedBio = bio.trim();

    if (!trimmedName) {
      Alert.alert('Error', 'Display name cannot be empty.');
      return;
    }
    if (!trimmedUsername) {
      Alert.alert('Error', 'Username cannot be empty.');
      return;
    }
    if (trimmedUsername.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters.');
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmedName });
      }

      await updateDoc(doc(db, 'users', user!.uid), {
        displayName: trimmedName,
        username: trimmedUsername,
        bio: trimmedBio,
      });

      await refreshProfile();
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerShown: true,
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: wp(1) }}>
              <Ionicons name="close" size={wp(6)} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Avatar
              size={wp(22)}
              name={displayName || userProfile?.displayName}
              borderColor="#E91E8C"
              borderWidth={2}
            />
          </View>

          {/* Fields */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your display name"
                placeholderTextColor="#555"
                maxLength={40}
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.usernameRow}>
                <Text style={styles.atSign}>@</Text>
                <TextInput
                  style={[styles.input, styles.usernameInput]}
                  value={username}
                  onChangeText={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder="username"
                  placeholderTextColor="#555"
                  maxLength={30}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Write something about yourself..."
                placeholderTextColor="#555"
                multiline
                maxLength={150}
                textAlignVertical="top"
                autoCorrect={false}
              />
              <Text style={styles.charCount}>{bio.length}/150</Text>
            </View>
          </View>

          <View style={styles.saveBtn}>
            <AppButton label="Save Changes" onPress={handleSave} loading={loading} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { paddingBottom: hp(4) },
  avatarSection: { alignItems: 'center', paddingVertical: hp(3) },
  form: { paddingHorizontal: wp(5), gap: hp(2) },
  fieldGroup: { gap: hp(0.75) },
  label: { color: '#888', fontSize: responsiveFontSize(13), fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    color: '#fff',
    fontSize: responsiveFontSize(15),
  },
  usernameRow: { flexDirection: 'row', alignItems: 'center' },
  atSign: { color: '#888', fontSize: responsiveFontSize(16), marginRight: wp(1), paddingBottom: 1 },
  usernameInput: { flex: 1 },
  bioInput: { height: hp(12), paddingTop: hp(1.5) },
  charCount: { color: '#444', fontSize: responsiveFontSize(12), textAlign: 'right', marginTop: hp(0.25) },
  saveBtn: { marginHorizontal: wp(5), marginTop: hp(3.5) },
});

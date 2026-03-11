import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  FlatList, Alert, ActivityIndicator, Modal, TextInput, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useUserReels } from '@/hooks/useUserReels';
import { useNotifications } from '@/hooks/useNotifications';
import Avatar from '@/components/ui/Avatar';
import AppButton from '@/components/ui/AppButton';
import { formatCount } from '@/utils/formatters';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

const GRID_SIZE = wp(33) - 2;

const StatItem = ({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.statItem} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
    <Text style={styles.statValue}>{formatCount(value)}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const { user, userProfile, logout, deleteAccount } = useAuth();
  const { data: reels = [], isLoading } = useUserReels(user?.uid);
  const { unreadCount } = useNotifications(user?.uid);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsAnim = useRef(new Animated.Value(0)).current;
  const [legalOpen, setLegalOpen] = useState(false);
  const legalAnim = useRef(new Animated.Value(0)).current;

  const toggleSettings = () => {
    const toValue = settingsOpen ? 0 : 1;
    setSettingsOpen(!settingsOpen);
    Animated.timing(settingsAnim, { toValue, duration: 220, useNativeDriver: false }).start();
  };

  const toggleLegal = () => {
    const toValue = legalOpen ? 0 : 1;
    setLegalOpen(!legalOpen);
    Animated.timing(legalAnim, { toValue, duration: 220, useNativeDriver: false }).start();
  };

  const settingsHeight = settingsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, hp(7)] });
  const legalHeight = legalAnim.interpolate({ inputRange: [0, 1], outputRange: [0, hp(21)] });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: () => void (async () => {
          setLoggingOut(true);
          await logout();
          router.replace('/(auth)/login' as any);
        })(),
      },
    ]);
  };

  const openDeleteModal = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and ALL your reels. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: () => setDeleteModalVisible(true) },
      ],
    );
  };

  const confirmDelete = async () => {
    if (!deletePassword.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }
    setDeletingAccount(true);
    try {
      await deleteAccount(deletePassword.trim());
      setDeleteModalVisible(false);
      router.replace('/(auth)/login' as any);
    } catch (err: any) {
      setDeletingAccount(false);
      const msg = err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential'
        ? 'Incorrect password. Please try again.'
        : err?.message || 'Failed to delete account.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/(tabs)/search' as any)}>
              <Ionicons name="search" size={wp(5.5)} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/(tabs)/notifications' as any)}>
              <Ionicons name="notifications-outline" size={wp(5.5)} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerBtn} onPress={handleLogout} disabled={loggingOut}>
              <Ionicons name="log-out-outline" size={wp(5.5)} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar + Info */}
        <View style={styles.avatarSection}>
          <Avatar
            size={wp(22.5)}
            name={userProfile?.displayName || user?.displayName}
            borderColor="#E91E8C"
            borderWidth={2}
          />
          <Text style={styles.displayName}>{userProfile?.displayName || user?.displayName || 'User'}</Text>
          <Text style={styles.username}>@{userProfile?.username || 'username'}</Text>
          {userProfile?.bio ? <Text style={styles.bio}>{userProfile.bio}</Text> : null}
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <StatItem value={reels.length} label="Reels" />
          <View style={styles.statDivider} />
          <StatItem
            value={userProfile?.followersCount || 0}
            label="Followers"
            onPress={() => router.push({ pathname: '/followers' as any, params: { userId: user?.uid, type: 'followers' } })}
          />
          <View style={styles.statDivider} />
          <StatItem
            value={userProfile?.followingCount || 0}
            label="Following"
            onPress={() => router.push({ pathname: '/followers' as any, params: { userId: user?.uid, type: 'following' } })}
          />
        </View>

        {/* Edit Profile */}
        <View style={{ marginHorizontal: wp(10), marginBottom: hp(2.5) }}>
          <AppButton label="Edit Profile" onPress={() => router.push('/edit-profile' as any)} variant="outline" />
        </View>

        {/* Reels Grid */}
        <View style={styles.gridSection}>
          {isLoading ? (
            <ActivityIndicator color="#E91E8C" style={{ marginTop: hp(5) }} />
          ) : reels.length === 0 ? (
            <View style={styles.emptyReels}>
              <Ionicons name="videocam-outline" size={wp(12.5)} color="#333" />
              <Text style={styles.emptyText}>No reels yet</Text>
              <AppButton
                label="Upload your first reel"
                onPress={() => router.push('/(tabs)/upload' as any)}
                style={{ marginTop: hp(1), paddingHorizontal: wp(5) }}
              />
            </View>
          ) : (
            <FlatList
              data={reels}
              numColumns={3}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={() => router.push({
                    pathname: '/reel-viewer' as any,
                    params: { userId: user?.uid, startIndex: index },
                  })}
                >
                  <View style={styles.gridItemPlaceholder}>
                    <Ionicons name="play" size={wp(6)} color="#fff" />
                    <Text style={styles.gridLikes}>♥ {formatCount(item.likesCount)}</Text>
                  </View>
                </TouchableOpacity>
              )}
              columnWrapperStyle={{ gap: 2 }}
              ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
            />
          )}
        </View>

        {/* Legal & About */}
        <View style={styles.legalSection}>
          <TouchableOpacity style={styles.settingsHeader} onPress={toggleLegal} activeOpacity={0.7}>
            <View style={styles.settingsHeaderLeft}>
              <Ionicons name="information-circle-outline" size={wp(4.5)} color="#555" />
              <Text style={styles.settingsHeaderText}>Legal & About</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: legalAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
              <Ionicons name="chevron-down" size={wp(4)} color="#555" />
            </Animated.View>
          </TouchableOpacity>

          <Animated.View style={{ height: legalHeight, overflow: 'hidden' }}>
            {([
              { icon: 'document-text-outline', label: 'Privacy Policy', route: '/privacy-policy' },
              { icon: 'alert-circle-outline', label: 'Disclaimer', route: '/disclaimer' },
              { icon: 'mail-outline', label: 'Contact Us', route: '/contact' },
            ] as const).map(({ icon, label, route }, i, arr) => (
              <TouchableOpacity
                key={route}
                style={[styles.legalRow, i < arr.length - 1 && styles.legalRowBorder]}
                onPress={() => router.push(route as any)}
                activeOpacity={0.7}
              >
                <Ionicons name={icon} size={wp(4.5)} color="#888" />
                <Text style={styles.legalRowText}>{label}</Text>
                <Ionicons name="chevron-forward" size={wp(4)} color="#333" />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>

        {/* Account Settings (collapsed) */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.settingsHeader} onPress={toggleSettings} activeOpacity={0.7}>
            <View style={styles.settingsHeaderLeft}>
              <Ionicons name="settings-outline" size={wp(4.5)} color="#555" />
              <Text style={styles.settingsHeaderText}>Account Settings</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: settingsAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
              <Ionicons name="chevron-down" size={wp(4)} color="#555" />
            </Animated.View>
          </TouchableOpacity>

          <Animated.View style={[styles.settingsBody, { height: settingsHeight, overflow: 'hidden' }]}>
            <TouchableOpacity style={styles.deleteRow} onPress={openDeleteModal}>
              <Ionicons name="person-remove-outline" size={wp(4.5)} color="#ff4444" />
              <View style={styles.deleteRowText}>
                <Text style={styles.deleteRowTitle}>Delete Account</Text>
                <Text style={styles.deleteRowSub}>Permanently remove your account & data</Text>
              </View>
              <Ionicons name="chevron-forward" size={wp(4)} color="#ff4444" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="warning-outline" size={wp(10)} color="#ff4444" style={{ alignSelf: 'center', marginBottom: hp(1.5) }} />
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalBody}>Enter your password to permanently delete your account and all data.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Your password"
              placeholderTextColor="#555"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setDeleteModalVisible(false); setDeletePassword(''); }}
                disabled={deletingAccount}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteBtn, deletingAccount && { opacity: 0.5 }]}
                onPress={confirmDelete}
                disabled={deletingAccount}
              >
                {deletingAccount
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalDeleteText}>Delete Forever</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingTop: hp(6.875), paddingHorizontal: wp(4), paddingBottom: hp(1) },
  headerActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: wp(2) },
  headerBtn: {
    width: wp(10), height: wp(10), borderRadius: wp(5),
    backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: -hp(0.5), right: -wp(1),
    backgroundColor: '#E91E8C', borderRadius: wp(3),
    minWidth: wp(4.5), height: wp(4.5),
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(1),
  },
  badgeText: { color: '#fff', fontSize: responsiveFontSize(9), fontWeight: 'bold' },
  avatarSection: { alignItems: 'center', paddingBottom: hp(2.5) },
  displayName: { color: '#fff', fontSize: responsiveFontSize(20), fontWeight: 'bold', marginTop: hp(1.5) },
  username: { color: '#888', fontSize: responsiveFontSize(14), marginTop: hp(0.375) },
  bio: { color: '#ccc', fontSize: responsiveFontSize(14), marginTop: hp(1), textAlign: 'center', paddingHorizontal: wp(7.5) },
  stats: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: hp(2),
    borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#222',
    marginHorizontal: wp(5), marginBottom: hp(2),
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: responsiveFontSize(20), fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: responsiveFontSize(13), marginTop: hp(0.375) },
  statDivider: { width: 0.5, height: hp(3.75), backgroundColor: '#333' },
  gridSection: { minHeight: hp(25) },
  gridItem: { width: GRID_SIZE, height: GRID_SIZE },
  gridItemPlaceholder: {
    flex: 1, backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center', gap: hp(0.5),
  },
  gridLikes: { color: '#fff', fontSize: responsiveFontSize(11) },
  emptyReels: { alignItems: 'center', paddingVertical: hp(6.25), gap: hp(1.5) },
  emptyText: { color: '#888', fontSize: responsiveFontSize(16) },
  legalSection: {
    marginHorizontal: wp(5), marginTop: hp(3),
    borderWidth: 1, borderColor: '#1e1e1e', borderRadius: wp(3), overflow: 'hidden',
  },
  legalSectionTitle: {
    color: '#555', fontSize: responsiveFontSize(11), fontWeight: '700',
    letterSpacing: 1.2, paddingHorizontal: wp(4), paddingTop: hp(1.75), paddingBottom: hp(1),
    backgroundColor: '#0d0d0d',
  },
  legalRow: {
    flexDirection: 'row', alignItems: 'center', gap: wp(3),
    paddingHorizontal: wp(4), paddingVertical: hp(1.75),
    backgroundColor: '#0a0a0a',
  },
  legalRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  legalRowText: { flex: 1, color: '#ccc', fontSize: responsiveFontSize(14) },
  settingsSection: {
    marginHorizontal: wp(5), marginTop: hp(3), marginBottom: hp(4),
    borderWidth: 1, borderColor: '#1e1e1e', borderRadius: wp(3), overflow: 'hidden',
  },
  settingsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: wp(4), paddingVertical: hp(1.75), backgroundColor: '#0d0d0d',
  },
  settingsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: wp(2.5) },
  settingsHeaderText: { color: '#555', fontSize: responsiveFontSize(13), fontWeight: '600', letterSpacing: 0.3 },
  settingsBody: { backgroundColor: '#0a0a0a' },
  deleteRow: {
    flexDirection: 'row', alignItems: 'center', gap: wp(3),
    paddingHorizontal: wp(4), paddingVertical: hp(1.75),
    borderTopWidth: 1, borderTopColor: '#1a1a1a',
  },
  deleteRowText: { flex: 1 },
  deleteRowTitle: { color: '#ff4444', fontSize: responsiveFontSize(14), fontWeight: '600' },
  deleteRowSub: { color: '#4a2020', fontSize: responsiveFontSize(11), marginTop: hp(0.25) },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: wp(6) },
  modalBox: { backgroundColor: '#111', borderRadius: wp(4), padding: wp(6), width: '100%', borderWidth: 1, borderColor: '#2a2a2a' },
  modalTitle: { color: '#fff', fontSize: responsiveFontSize(18), fontWeight: 'bold', textAlign: 'center', marginBottom: hp(1) },
  modalBody: { color: '#888', fontSize: responsiveFontSize(13), textAlign: 'center', marginBottom: hp(2), lineHeight: 20 },
  modalInput: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
    borderRadius: wp(2.5), paddingHorizontal: wp(4), paddingVertical: hp(1.5),
    color: '#fff', fontSize: responsiveFontSize(15), marginBottom: hp(2),
  },
  modalActions: { flexDirection: 'row', gap: wp(3) },
  modalCancelBtn: { flex: 1, paddingVertical: hp(1.5), borderRadius: wp(2.5), borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  modalCancelText: { color: '#fff', fontSize: responsiveFontSize(14), fontWeight: '600' },
  modalDeleteBtn: { flex: 1, paddingVertical: hp(1.5), borderRadius: wp(2.5), backgroundColor: '#ff4444', alignItems: 'center' },
  modalDeleteText: { color: '#fff', fontSize: responsiveFontSize(14), fontWeight: '600' },
});

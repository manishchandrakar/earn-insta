import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  FlatList, Alert, ActivityIndicator,
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

const StatItem = ({ value, label }: { value: number; label: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{formatCount(value)}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProfileScreen = () => {
  const { user, userProfile, logout } = useAuth();
  const { data: reels = [], isLoading } = useUserReels(user?.uid);
  const { unreadCount } = useNotifications(user?.uid);
  const [loggingOut, setLoggingOut] = useState(false);

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

  return (
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
        <StatItem value={userProfile?.reelsCount || 0} label="Reels" />
        <View style={styles.statDivider} />
        <StatItem value={userProfile?.followersCount || 0} label="Followers" />
        <View style={styles.statDivider} />
        <StatItem value={userProfile?.followingCount || 0} label="Following" />
      </View>

      {/* Edit Profile */}
      <View style={{ marginHorizontal: wp(10), marginBottom: hp(2.5) }}>
        <AppButton label="Edit Profile" onPress={() => {}} variant="outline" />
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
    </ScrollView>
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
});

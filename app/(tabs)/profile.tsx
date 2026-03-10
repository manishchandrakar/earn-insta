import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection, query, where, getDocs, orderBy, onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { formatCount } from '@/utils/formatters';
import { IReel } from '@/constants/dummyData';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

const GRID_SIZE = wp(33) - 2;

const ProfileScreen = () => {
  const { user, userProfile, logout } = useAuth();
  const [reels, setReels] = useState<IReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) loadUserReels();
  }, [user]);

  // Real-time unread notification badge
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('read', '==', false),
    );
    const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size), () => {});
    return () => unsub();
  }, [user]);

  const loadUserReels = async () => {
    try {
      const q = query(
        collection(db, 'reels'),
        where('userId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as IReel[];
      setReels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => void (async () => {
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
          {/* Search button */}
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/(tabs)/search' as any)}
          >
            <Ionicons name="search" size={wp(5.5)} color="#fff" />
          </TouchableOpacity>

          {/* Notifications button with badge */}
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/(tabs)/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={wp(5.5)} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Logout button */}
          <TouchableOpacity style={styles.headerBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={wp(5.5)} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={wp(11)} color="#fff" />
        </View>
        <Text style={styles.displayName}>
          {userProfile?.displayName || user?.displayName || 'User'}
        </Text>
        <Text style={styles.username}>@{userProfile?.username || 'username'}</Text>
        {userProfile?.bio ? <Text style={styles.bio}>{userProfile.bio}</Text> : null}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCount(userProfile?.reelsCount || 0)}</Text>
          <Text style={styles.statLabel}>Reels</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCount(userProfile?.followersCount || 0)}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCount(userProfile?.followingCount || 0)}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Edit Profile button */}
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.editBtnText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Reels grid */}
      <View style={styles.gridSection}>
        {loading ? (
          <ActivityIndicator color="#E91E8C" style={{ marginTop: hp(5) }} />
        ) : reels.length === 0 ? (
          <View style={styles.emptyReels}>
            <Ionicons name="videocam-outline" size={wp(12.5)} color="#333" />
            <Text style={styles.emptyText}>No reels yet</Text>
            <TouchableOpacity
              style={styles.uploadPromptBtn}
              onPress={() => router.push('/(tabs)/upload' as any)}
            >
              <Text style={styles.uploadPromptText}>Upload your first reel</Text>
            </TouchableOpacity>
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

const avatarSize = wp(22.5);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingTop: hp(6.875), paddingHorizontal: wp(4), paddingBottom: hp(1),
  },
  headerActions: {
    flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: wp(2),
  },
  headerBtn: {
    width: wp(10), height: wp(10), borderRadius: wp(5),
    backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: -hp(0.5), right: -wp(1),
    backgroundColor: '#E91E8C', borderRadius: wp(3),
    minWidth: wp(4.5), height: wp(4.5),
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: wp(1),
  },
  badgeText: { color: '#fff', fontSize: responsiveFontSize(9), fontWeight: 'bold' },
  avatarSection: { alignItems: 'center', paddingBottom: hp(2.5) },
  avatar: {
    width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2,
    backgroundColor: '#333', borderWidth: 2, borderColor: '#E91E8C',
    justifyContent: 'center', alignItems: 'center', marginBottom: hp(1.5),
  },
  displayName: { color: '#fff', fontSize: responsiveFontSize(20), fontWeight: 'bold' },
  username: { color: '#888', fontSize: responsiveFontSize(14), marginTop: hp(0.375) },
  bio: { color: '#ccc', fontSize: responsiveFontSize(14), marginTop: hp(1), textAlign: 'center', paddingHorizontal: wp(7.5) },
  stats: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingVertical: hp(2),
    borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#222',
    marginHorizontal: wp(5), marginBottom: hp(2),
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: responsiveFontSize(20), fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: responsiveFontSize(13), marginTop: hp(0.375) },
  statDivider: { width: 0.5, height: hp(3.75), backgroundColor: '#333' },
  editBtn: {
    borderWidth: 1, borderColor: '#444', borderRadius: wp(2.5),
    paddingVertical: hp(1.25), marginHorizontal: wp(10), alignItems: 'center', marginBottom: hp(2.5),
  },
  editBtnText: { color: '#fff', fontSize: responsiveFontSize(14), fontWeight: '600' },
  gridSection: { minHeight: hp(25) },
  gridItem: { width: GRID_SIZE, height: GRID_SIZE },
  gridItemPlaceholder: {
    flex: 1, backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center', gap: hp(0.5),
  },
  gridLikes: { color: '#fff', fontSize: responsiveFontSize(11) },
  emptyReels: { alignItems: 'center', paddingVertical: hp(6.25), gap: hp(1.5) },
  emptyText: { color: '#888', fontSize: responsiveFontSize(16) },
  uploadPromptBtn: {
    backgroundColor: '#E91E8C', borderRadius: wp(2.5),
    paddingHorizontal: wp(5), paddingVertical: hp(1.25), marginTop: hp(1),
  },
  uploadPromptText: { color: '#fff', fontSize: responsiveFontSize(14), fontWeight: '600' },
});

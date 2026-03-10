import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  FlatList, Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = SCREEN_WIDTH / 3 - 2;

interface Reel {
  id: string;
  videoUrl: string;
  caption: string;
  likesCount: number;
  viewsCount: number;
}

const ProfileScreen = () => {
  const { user, userProfile, logout } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadUserReels();
  }, [user]);

  const loadUserReels = async () => {
    try {
      const q = query(
        collection(db, 'reels'),
        where('userId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Reel[];
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
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n?.toString() || '0';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={44} color="#fff" />
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
          <ActivityIndicator color="#E91E8C" style={{ marginTop: 40 }} />
        ) : reels.length === 0 ? (
          <View style={styles.emptyReels}>
            <Ionicons name="videocam-outline" size={50} color="#333" />
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
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.gridItem}>
                <View style={styles.gridItemPlaceholder}>
                  <Ionicons name="play" size={24} color="#fff" />
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
  header: {
    paddingTop: 55, paddingHorizontal: 16, paddingBottom: 8,
    flexDirection: 'row', justifyContent: 'flex-end',
  },
  logoutBtn: { padding: 4 },
  avatarSection: { alignItems: 'center', paddingBottom: 20 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#333', borderWidth: 2, borderColor: '#E91E8C',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  displayName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  username: { color: '#888', fontSize: 14, marginTop: 3 },
  bio: { color: '#ccc', fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 30 },
  stats: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingVertical: 16,
    borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#222',
    marginHorizontal: 20, marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 13, marginTop: 3 },
  statDivider: { width: 0.5, height: 30, backgroundColor: '#333' },
  editBtn: {
    borderWidth: 1, borderColor: '#444', borderRadius: 10,
    paddingVertical: 10, marginHorizontal: 40, alignItems: 'center', marginBottom: 20,
  },
  editBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  gridSection: { minHeight: 200 },
  gridItem: { width: GRID_SIZE, height: GRID_SIZE },
  gridItemPlaceholder: {
    flex: 1, backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  gridLikes: { color: '#fff', fontSize: 11 },
  emptyReels: { alignItems: 'center', paddingVertical: 50, gap: 12 },
  emptyText: { color: '#888', fontSize: 16 },
  uploadPromptBtn: {
    backgroundColor: '#E91E8C', borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 10, marginTop: 8,
  },
  uploadPromptText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

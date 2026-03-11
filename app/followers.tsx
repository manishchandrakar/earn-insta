import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Avatar from '@/components/ui/Avatar';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

interface IUserItem {
  uid: string;
  displayName: string;
  username: string;
}

const fetchFollowList = async (userId: string, type: 'followers' | 'following'): Promise<IUserItem[]> => {
  // followers collection: { followerId, followingId }
  const field = type === 'followers' ? 'followingId' : 'followerId';
  const returnField = type === 'followers' ? 'followerId' : 'followingId';

  const snap = await getDocs(query(collection(db, 'follows'), where(field, '==', userId)));
  if (snap.empty) return [];

  const uids = snap.docs.map((d) => d.data()[returnField] as string);

  const users = await Promise.all(
    uids.map(async (uid) => {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      return { uid, displayName: data.displayName || '', username: data.username || '' } as IUserItem;
    })
  );

  return users.filter(Boolean) as IUserItem[];
};

export default function FollowersScreen() {
  const { userId, type } = useLocalSearchParams<{ userId: string; type: 'followers' | 'following' }>();
  const title = type === 'followers' ? 'Followers' : 'Following';

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['followList', userId, type],
    queryFn: () => fetchFollowList(userId, type),
    enabled: !!userId,
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{
        title,
        headerShown: true,
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }} />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#E91E8C" size="large" />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>{type === 'followers' ? '👥' : '🔍'}</Text>
          <Text style={styles.emptyTitle}>No {title} Yet</Text>
          <Text style={styles.emptyBody}>
            {type === 'followers'
              ? 'When someone follows you, they\'ll appear here.'
              : 'Users you follow will appear here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <Avatar size={wp(12)} name={item.displayName} borderColor="#222" borderWidth={1} />
              <View style={styles.userInfo}>
                <Text style={styles.displayName}>{item.displayName}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: hp(1.5), paddingHorizontal: wp(8) },
  emptyIcon: { fontSize: responsiveFontSize(40), marginBottom: hp(1) },
  emptyTitle: { color: '#fff', fontSize: responsiveFontSize(18), fontWeight: 'bold' },
  emptyBody: { color: '#555', fontSize: responsiveFontSize(14), textAlign: 'center', lineHeight: 22 },
  list: { paddingVertical: hp(1) },
  separator: { height: 1, backgroundColor: '#111', marginLeft: wp(18) },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(5), paddingVertical: hp(1.5), gap: wp(3.5) },
  userInfo: { flex: 1 },
  displayName: { color: '#fff', fontSize: responsiveFontSize(15), fontWeight: '600' },
  username: { color: '#555', fontSize: responsiveFontSize(13), marginTop: hp(0.25) },
});

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection, query, where, orderBy,
  onSnapshot, doc, writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { NOTIFICATION_ICON_MAP, ENotificationType } from '@/constants/dummyData';
import { timeAgo } from '@/utils/dateUtils';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

interface IFirebaseNotification {
  id: string;
  type: ENotificationType;
  text: string;
  senderUsername: string;
  recipientId: string;
  read: boolean;
  createdAt: any;
}

const NotificationsScreen = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<IFirebaseNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as IFirebaseNotification[];
      setNotifications(data);
      setLoading(false);

      // Mark all unread as read
      const unread = snapshot.docs.filter((d) => !d.data().read);
      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach((d) => batch.update(doc(db, 'notifications', d.id), { read: true }));
        batch.commit();
      }
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [user]);

  const renderItem = ({ item }: { item: IFirebaseNotification }) => {
    const icon = NOTIFICATION_ICON_MAP[item.type] ?? NOTIFICATION_ICON_MAP[ENotificationType.Like];
    return (
      <View style={[styles.notifRow, !item.read && styles.notifUnread]}>
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '22' }]}>
          <Ionicons name={icon.name} size={wp(5)} color={icon.color} />
        </View>
        <View style={styles.notifInfo}>
          <Text style={styles.notifText}>{item.text}</Text>
          <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.some((n) => !n.read) && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications.filter((n) => !n.read).length}</Text>
          </View>
        )}
      </View>

      {loading && <ActivityIndicator color="#E91E8C" style={{ marginTop: hp(5) }} />}
      {!loading && notifications.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={wp(15)} color="#333" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySub}>Likes and follows will appear here</Text>
        </View>
      )}
      {!loading && notifications.length > 0 && (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(2.5) }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

const iconSize = wp(11);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: hp(7.5) },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: wp(2.5),
    paddingHorizontal: wp(4), marginBottom: hp(1.5),
  },
  title: { color: '#fff', fontSize: responsiveFontSize(20), fontWeight: 'bold' },
  badge: {
    backgroundColor: '#E91E8C', borderRadius: wp(2.5),
    paddingHorizontal: wp(1.8), paddingVertical: hp(0.25),
  },
  badgeText: { color: '#fff', fontSize: responsiveFontSize(12), fontWeight: 'bold' },
  notifRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: hp(1.75), gap: wp(3.5),
    borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a',
  },
  notifUnread: { backgroundColor: '#0d0d0d' },
  iconContainer: {
    width: iconSize, height: iconSize, borderRadius: iconSize / 2,
    justifyContent: 'center', alignItems: 'center',
  },
  notifInfo: { flex: 1 },
  notifText: { color: '#fff', fontSize: responsiveFontSize(14) },
  notifTime: { color: '#666', fontSize: responsiveFontSize(12), marginTop: hp(0.4) },
  unreadDot: {
    width: wp(2), height: wp(2), borderRadius: wp(1),
    backgroundColor: '#E91E8C',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: hp(1.25) },
  emptyText: { color: '#888', fontSize: responsiveFontSize(18), fontWeight: '600' },
  emptySub: { color: '#555', fontSize: responsiveFontSize(14) },
});

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEMO_NOTIFICATIONS, NOTIFICATION_ICON_MAP, INotification, ENotificationType } from '@/constants/dummyData';

const NotificationsScreen = () => {
  const renderItem = ({ item }: { item: INotification }) => {
    const icon = NOTIFICATION_ICON_MAP[item.type] ?? NOTIFICATION_ICON_MAP[ENotificationType.Like];
    return (
      <View style={styles.notifRow}>
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '22' }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.notifInfo}>
          <Text style={styles.notifText}>{item.text}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={DEMO_NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 4 }}
      />
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 8 },
  notifRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, gap: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a',
  },
  iconContainer: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  notifInfo: { flex: 1 },
  notifText: { color: '#fff', fontSize: 14 },
  notifTime: { color: '#666', fontSize: 12, marginTop: 3 },
});

import { useState, useEffect } from 'react';
import {
  collection, query, where, orderBy,
  onSnapshot, doc, writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ENotificationType } from '@/constants/dummyData';

export interface IFirebaseNotification {
  id: string;
  type: ENotificationType;
  text: string;
  senderUsername: string;
  recipientId: string;
  read: boolean;
  createdAt: any;
}

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<IFirebaseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as IFirebaseNotification[];
      setNotifications(data);
      setLoading(false);

      const unread = snap.docs.filter((d) => !d.data().read);
      setUnreadCount(unread.length);

      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach((d) => batch.update(doc(db, 'notifications', d.id), { read: true }));
        void batch.commit();
      }
    }, () => setLoading(false));

    return () => unsub();
  }, [userId]);

  return { notifications, loading, unreadCount };
};

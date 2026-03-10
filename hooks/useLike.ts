import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDoc, collection, doc, increment,
  serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ENotificationType } from '@/constants/dummyData';

interface LikeParams {
  reelId: string;
  reelUserId: string;
  liked: boolean;
  currentUserId: string;
  currentUsername: string;
}

export const useLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reelId, reelUserId, liked, currentUserId, currentUsername }: LikeParams) => {
      const isDemo = reelUserId.startsWith('demo') || reelUserId === currentUserId;
      if (isDemo) return;

      await updateDoc(doc(db, 'reels', reelId), {
        likesCount: increment(liked ? 1 : -1),
      });

      if (liked) {
        await addDoc(collection(db, 'notifications'), {
          type: ENotificationType.Like,
          text: `${currentUsername} liked your reel`,
          recipientId: reelUserId,
          senderId: currentUserId,
          senderUsername: currentUsername,
          read: false,
          createdAt: serverTimestamp(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
    },
  });
};

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  doc, getDoc, setDoc, deleteDoc,
  updateDoc, increment, addDoc, collection, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ENotificationType } from '@/constants/dummyData';

const likeDocId = (reelId: string, userId: string) => `${reelId}_${userId}`;

// Hook to get + toggle like status for a single reel
export const useLike = (reelId: string, reelUserId: string, initialLikeCount: number, currentUserId: string, currentUsername: string) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [checking, setChecking] = useState(true);

  // Check if user already liked this reel on mount
  useEffect(() => {
    if (!currentUserId || !reelId) { setChecking(false); return; }
    const isDemo = reelUserId.startsWith('demo');
    if (isDemo) { setChecking(false); return; }

    getDoc(doc(db, 'likes', likeDocId(reelId, currentUserId)))
      .then((snap) => setLiked(snap.exists()))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [reelId, currentUserId, reelUserId]);

  const mutation = useMutation({
    mutationFn: async () => {
      const isDemo = reelUserId.startsWith('demo') || reelUserId === currentUserId;
      const likeRef = doc(db, 'likes', likeDocId(reelId, currentUserId));

      if (liked) {
        // Unlike
        await deleteDoc(likeRef);
        if (!isDemo) {
          await updateDoc(doc(db, 'reels', reelId), { likesCount: increment(-1) });
        }
      } else {
        // Like
        await setDoc(likeRef, { reelId, userId: currentUserId, createdAt: serverTimestamp() });
        if (!isDemo) {
          await updateDoc(doc(db, 'reels', reelId), { likesCount: increment(1) });
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
      }
    },
    onMutate: () => {
      // Optimistic update
      setLiked((prev) => !prev);
      setLikeCount((prev) => liked ? prev - 1 : prev + 1);
    },
    onError: () => {
      // Rollback
      setLiked((prev) => !prev);
      setLikeCount((prev) => liked ? prev + 1 : prev - 1);
    },
  });

  const toggle = () => {
    if (checking || mutation.isPending) return;
    mutation.mutate();
  };

  return { liked, likeCount, toggle, loading: checking || mutation.isPending };
};

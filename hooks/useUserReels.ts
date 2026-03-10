import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IReel } from '@/constants/dummyData';

export const useUserReels = (userId: string | undefined) =>
  useQuery<IReel[]>({
    queryKey: ['userReels', userId],
    queryFn: async () => {
      const q = query(
        collection(db, 'reels'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as IReel[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
    initialData: [],
  });

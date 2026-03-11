import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IReel } from '@/constants/dummyData';

export const useUserReels = (userId: string | undefined) =>
  useQuery<IReel[]>({
    queryKey: ['userReels', userId],
    queryFn: async () => {
      const q = query(collection(db, 'reels'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const reels = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as IReel[];
      return reels.sort((a: any, b: any) => {
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      });
    },
    enabled: !!userId,
    staleTime: 0,
    initialData: [],
  });

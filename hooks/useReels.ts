import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IReel } from '@/constants/dummyData';

export const useReels = () =>
  useQuery<IReel[]>({
    queryKey: ['reels'],
    queryFn: async () => {
      const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      if (snap.empty) return [];
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as IReel[];
    },
    staleTime: 1000 * 30,
  });

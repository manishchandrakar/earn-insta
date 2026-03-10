import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DUMMY_REELS, IReel } from '@/constants/dummyData';

export const useReels = () =>
  useQuery<IReel[]>({
    queryKey: ['reels'],
    queryFn: async () => {
      const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      if (snap.empty) return DUMMY_REELS;
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as IReel[];
      return [...fetched, ...DUMMY_REELS];
    },
    initialData: DUMMY_REELS,
    staleTime: 1000 * 60 * 2,
  });

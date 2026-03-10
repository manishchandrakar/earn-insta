import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IUserResult } from '@/constants/dummyData';

export const useSearch = () => {
  const [searchText, setSearchText] = useState('');

  const { data: results = [], isFetching } = useQuery<IUserResult[]>({
    queryKey: ['search', searchText],
    queryFn: async () => {
      const q = query(
        collection(db, 'users'),
        where('username', '>=', searchText.toLowerCase()),
        where('username', '<=', searchText.toLowerCase() + '\uf8ff'),
        limit(20),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data()) as IUserResult[];
    },
    enabled: searchText.trim().length >= 2,
    staleTime: 1000 * 30,
  });

  return { searchText, setSearchText, results, loading: isFetching };
};

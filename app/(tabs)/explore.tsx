// This file is kept for compatibility but the explore tab is replaced by search
import { Redirect } from 'expo-router';
import { AppRoutes } from '@/constants/routes';
export default function Explore() {
  return <Redirect href={AppRoutes.SEARCH} />;
}

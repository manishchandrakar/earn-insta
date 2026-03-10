// This file is kept for compatibility but the explore tab is replaced by search
import { Redirect } from 'expo-router';
export default function Explore() {
  return <Redirect href={'/(tabs)/search' as any} />;
}

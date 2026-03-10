import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserResult {
  uid: string;
  username: string;
  displayName: string;
  followersCount: number;
}

const Separator = () => <View style={{ height: 0.5, backgroundColor: '#1a1a1a' }} />;

const SUGGESTED = [
  { id: '1', label: 'Trending Creators', icon: 'flame', color: '#FF6B35' },
  { id: '2', label: 'New Users', icon: 'sparkles', color: '#9B59B6' },
  { id: '3', label: 'Top Earners', icon: 'trophy', color: '#F1C40F' },
];

const SearchScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '>=', text.toLowerCase()),
        where('username', '<=', text.toLowerCase() + '\uf8ff'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc) => doc.data()) as UserResult[];
      setResults(users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#E91E8C', '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C', '#E74C3C'];
    const index = (name?.codePointAt(0) || 0) % colors.length;
    return colors[index];
  };

  const renderUser = ({ item }: { item: UserResult }) => (
    <TouchableOpacity style={styles.userRow} activeOpacity={0.7}>
      {/* Avatar with initial */}
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.displayName) }]}>
        <Text style={styles.avatarText}>
          {(item.displayName || item.username || '?')[0].toUpperCase()}
        </Text>
      </View>

      {/* User info */}
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>{item.displayName}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>

      {/* Stats + Follow */}
      <View style={styles.rightSection}>
        <Text style={styles.followers}>
          {item.followersCount >= 1000
            ? `${(item.followersCount / 1000).toFixed(1)}K`
            : item.followersCount || 0}{' '}
          followers
        </Text>
        <TouchableOpacity style={styles.followBtn}>
          <Text style={styles.followBtnText}>Follow</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#555"
            value={searchText}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); setResults([]); }}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && (
        <ActivityIndicator style={{ marginTop: 20 }} color="#E91E8C" />
      )}

      {/* Results */}
      {results.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Results ({results.length})</Text>
          <FlatList
            data={results}
            renderItem={renderUser}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={Separator}
          />
        </>
      ) : searchText.length > 0 && !loading ? (
        /* No results */
        <View style={styles.noResults}>
          <View style={styles.noResultsIcon}>
            <Ionicons name="person-outline" size={36} color="#555" />
          </View>
          <Text style={styles.noResultsText}>No users found</Text>
          <Text style={styles.noResultsSub}>Try a different username</Text>
        </View>
      ) : !loading ? (
        /* Default state */
        <View style={styles.defaultState}>
          {/* Discover categories */}
          <Text style={styles.sectionTitle}>Browse</Text>
          <View style={styles.categoryRow}>
            {SUGGESTED.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} activeOpacity={0.8}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '22' }]}>
                  <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search hint */}
          <View style={styles.searchHint}>
            <Ionicons name="search-circle" size={64} color="#1a1a1a" />
            <Text style={styles.hintText}>Search by username</Text>
            <Text style={styles.hintSub}>Type at least 2 characters</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingTop: 58, paddingHorizontal: 20, paddingBottom: 10,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  searchBarWrapper: { paddingHorizontal: 16, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#111', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    gap: 10, borderWidth: 1, borderColor: '#2a2a2a',
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },

  sectionTitle: {
    color: '#888', fontSize: 13, fontWeight: '600',
    letterSpacing: 0.5, marginLeft: 20, marginBottom: 8, textTransform: 'uppercase',
  },

  // User row
  userRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  displayName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  username: { color: '#666', fontSize: 13, marginTop: 2 },
  rightSection: { alignItems: 'flex-end', gap: 6 },
  followers: { color: '#666', fontSize: 11 },
  followBtn: {
    backgroundColor: '#E91E8C', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  followBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  separator: { height: 0.5, backgroundColor: '#1a1a1a' },

  // No results
  noResults: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  noResultsIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#111', justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  noResultsText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  noResultsSub: { color: '#555', fontSize: 14 },

  // Default state
  defaultState: { flex: 1 },
  categoryRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, marginBottom: 30,
  },
  categoryCard: {
    flex: 1, backgroundColor: '#111', borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#222',
  },
  categoryIcon: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  categoryLabel: { color: '#ccc', fontSize: 11, fontWeight: '600', textAlign: 'center' },

  searchHint: { alignItems: 'center', marginTop: 20, gap: 8 },
  hintText: { color: '#444', fontSize: 16, fontWeight: '600' },
  hintSub: { color: '#333', fontSize: 13 },
});

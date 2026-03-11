import React from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearch } from '@/hooks/useSearch';
import { SEARCH_CATEGORIES, IUserResult } from '@/constants/dummyData';
import { getAvatarColor } from '@/utils/formatters';
import Avatar from '@/components/ui/Avatar';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

const Separator = () => <View style={{ height: 0.5, backgroundColor: '#1a1a1a' }} />;

const UserRow = ({ item }: { item: IUserResult }) => (
  <TouchableOpacity style={styles.userRow} activeOpacity={0.7}>
    <Avatar size={wp(12.5)} name={item.displayName} color={getAvatarColor(item.displayName)} />
    <View style={styles.userInfo}>
      <Text style={styles.displayName}>{item.displayName}</Text>
      <Text style={styles.username}>@{item.username}</Text>
    </View>
    <View style={styles.rightSection}>
      <Text style={styles.followers}>
        {item.followersCount >= 1000
          ? `${(item.followersCount / 1000).toFixed(1)}K`
          : item.followersCount || 0} followers
      </Text>
      <TouchableOpacity style={styles.followBtn}>
        <Text style={styles.followBtnText}>Follow</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const SearchScreen = () => {
  const { searchText, setSearchText, results, loading } = useSearch();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={wp(4.5)} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#555"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={wp(4.5)} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: hp(2.5) }} color="#E91E8C" />}

      {results.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Results ({results.length})</Text>
          <FlatList
            data={results}
            renderItem={({ item }) => <UserRow item={item} />}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={{ paddingHorizontal: wp(4) }}
            ItemSeparatorComponent={Separator}
          />
        </>
      )}

      {results.length === 0 && searchText.length > 1 && !loading && (
        <View style={styles.noResults}>
          <View style={styles.noResultsIcon}>
            <Ionicons name="person-outline" size={wp(9)} color="#555" />
          </View>
          <Text style={styles.noResultsText}>No users found</Text>
          <Text style={styles.noResultsSub}>Try a different username</Text>
        </View>
      )}

      {searchText.length === 0 && (
        <View style={styles.defaultState}>
          <Text style={styles.sectionTitle}>Browse</Text>
          <View style={styles.categoryRow}>
            {SEARCH_CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} activeOpacity={0.8}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '22' }]}>
                  <Ionicons name={cat.icon} size={wp(6)} color={cat.color} />
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.searchHint}>
            <Ionicons name="search-circle" size={wp(16)} color="#1a1a1a" />
            <Text style={styles.hintText}>Search by username</Text>
            <Text style={styles.hintSub}>Type at least 2 characters</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SearchScreen;

const noResultsIconSize = wp(20);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingTop: hp(7.25), paddingHorizontal: wp(5), paddingBottom: hp(1.25) },
  title: { color: '#fff', fontSize: responsiveFontSize(24), fontWeight: 'bold' },
  searchBarWrapper: { paddingHorizontal: wp(4), marginBottom: hp(2) },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#111', borderRadius: wp(3.5),
    paddingHorizontal: wp(3.5), paddingVertical: hp(1.5),
    gap: wp(2.5), borderWidth: 1, borderColor: '#2a2a2a',
  },
  searchInput: { flex: 1, color: '#fff', fontSize: responsiveFontSize(15) },
  sectionTitle: {
    color: '#888', fontSize: responsiveFontSize(13), fontWeight: '600',
    letterSpacing: 0.5, marginLeft: wp(5), marginBottom: hp(1), textTransform: 'uppercase',
  },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: hp(1.5), gap: wp(3) },
  userInfo: { flex: 1 },
  displayName: { color: '#fff', fontSize: responsiveFontSize(15), fontWeight: '600' },
  username: { color: '#666', fontSize: responsiveFontSize(13), marginTop: hp(0.25) },
  rightSection: { alignItems: 'flex-end', gap: hp(0.75) },
  followers: { color: '#666', fontSize: responsiveFontSize(11) },
  followBtn: {
    backgroundColor: '#E91E8C', borderRadius: wp(2),
    paddingHorizontal: wp(3.5), paddingVertical: hp(0.625),
  },
  followBtnText: { color: '#fff', fontSize: responsiveFontSize(12), fontWeight: '700' },
  noResults: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: hp(1.25) },
  noResultsIcon: {
    width: noResultsIconSize, height: noResultsIconSize, borderRadius: noResultsIconSize / 2,
    backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', marginBottom: hp(1),
  },
  noResultsText: { color: '#fff', fontSize: responsiveFontSize(18), fontWeight: '600' },
  noResultsSub: { color: '#555', fontSize: responsiveFontSize(14) },
  defaultState: { flex: 1 },
  categoryRow: { flexDirection: 'row', gap: wp(2.5), paddingHorizontal: wp(4), marginBottom: hp(3.75) },
  categoryCard: {
    flex: 1, backgroundColor: '#111', borderRadius: wp(3.5),
    padding: wp(3.5), alignItems: 'center', gap: hp(1),
    borderWidth: 1, borderColor: '#222',
  },
  categoryIcon: {
    width: wp(12), height: wp(12), borderRadius: wp(6),
    justifyContent: 'center', alignItems: 'center',
  },
  categoryLabel: { color: '#ccc', fontSize: responsiveFontSize(11), fontWeight: '600', textAlign: 'center' },
  searchHint: { alignItems: 'center', marginTop: hp(2.5), gap: hp(1) },
  hintText: { color: '#444', fontSize: responsiveFontSize(16), fontWeight: '600' },
  hintSub: { color: '#333', fontSize: responsiveFontSize(13) },
});

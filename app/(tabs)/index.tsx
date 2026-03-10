import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface Reel {
  id: string;
  videoUrl: string;
  caption: string;
  username: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  userId: string;
}

const DUMMY_REELS: Reel[] = [
  {
    id: '1',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    caption: 'First reel on EarnInsta! 🎬🔥 #viral #fyp',
    username: 'earninsta_official',
    likesCount: 12400,
    commentsCount: 450,
    sharesCount: 230,
    userId: 'demo1',
  },
  {
    id: '2',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    caption: 'Watch and earn coins! 💰 #earn #money',
    username: 'creator_pro',
    likesCount: 8900,
    commentsCount: 320,
    sharesCount: 150,
    userId: 'demo2',
  },
];

function ReelItem({ item, isActive }: { item: Reel; isActive: boolean }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const [following, setFollowing] = useState(false);

  const player = useVideoPlayer(item.videoUrl, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive]);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <View style={styles.reelContainer}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />

      <View style={styles.overlay}>
        {/* Right side actions */}
        <View style={styles.rightActions}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color="#fff" />
            </View>
            {!following && (
              <TouchableOpacity style={styles.followPlusBtn} onPress={() => setFollowing(true)}>
                <Ionicons name="add" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={30} color={liked ? '#E91E8C' : '#fff'} />
            <Text style={styles.actionText}>{formatCount(likesCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>{formatCount(item.commentsCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-social-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>{formatCount(item.sharesCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom info */}
        <View style={styles.bottomInfo}>
          <View style={styles.userRow}>
            <Text style={styles.username}>@{item.username}</Text>
            {!following && (
              <TouchableOpacity style={styles.followTextBtn} onPress={() => setFollowing(true)}>
                <Text style={styles.followText}>Follow</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
          <View style={styles.musicRow}>
            <Ionicons name="musical-notes" size={14} color="#fff" />
            <Text style={styles.musicText}> Original Sound</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ReelsFeedScreen() {
  const [reels, setReels] = useState<Reel[]>(DUMMY_REELS);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Reel[];
        setReels([...fetched, ...DUMMY_REELS]);
      }
    } catch {}
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const renderItem = useCallback(
    ({ item, index }: { item: Reel; index: number }) => (
      <ReelItem item={item} isActive={index === activeIndex} />
    ),
    [activeIndex]
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>For You</Text>
      </View>
      <FlatList
        data={reels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews
        initialNumToRender={2}
        maxToRenderPerBatch={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute', top: 50, left: 0, right: 0, zIndex: 10, alignItems: 'center',
  },
  topBarTitle: {
    color: '#fff', fontSize: 16, fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  reelContainer: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: '#000' },
  video: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 90,
    paddingHorizontal: 14,
  },
  rightActions: {
    position: 'absolute', right: 12, bottom: 100,
    alignItems: 'center', gap: 18,
  },
  avatarContainer: { alignItems: 'center', marginBottom: 4 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#555', borderWidth: 2, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  followPlusBtn: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#E91E8C',
    justifyContent: 'center', alignItems: 'center',
    marginTop: -10,
  },
  actionBtn: { alignItems: 'center', gap: 3 },
  actionText: {
    color: '#fff', fontSize: 12, fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  bottomInfo: { flex: 1, paddingRight: 72, paddingBottom: 4 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  username: {
    color: '#fff', fontSize: 15, fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  followTextBtn: {
    borderWidth: 1, borderColor: '#fff', borderRadius: 4,
    paddingHorizontal: 10, paddingVertical: 2,
  },
  followText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  caption: {
    color: '#fff', fontSize: 14, marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  musicRow: { flexDirection: 'row', alignItems: 'center' },
  musicText: { color: '#fff', fontSize: 13 },
});

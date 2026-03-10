import React, { useState, useCallback, useEffect } from 'react';
import {
  View, FlatList, Dimensions, StyleSheet,
  TouchableOpacity, Text, StatusBar, Pressable,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useReels } from '@/hooks/useReels';
import { useLike } from '@/hooks/useLike';
import { IReel } from '@/constants/dummyData';
import { formatCount } from '@/utils/formatters';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── ReelItem ──────────────────────────────────────────────────────
const ReelItem = React.memo(({
  item, isActive, isScreenFocused,
}: { item: IReel; isActive: boolean; isScreenFocused: boolean }) => {
  const { user, userProfile } = useAuth();
  const { mutate: likeMutate } = useLike();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const [following, setFollowing] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const [showIcon, setShowIcon] = useState(false);

  const player = useVideoPlayer(item.videoUrl, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (isActive && isScreenFocused && !manualPaused) player.play();
    else player.pause();
  }, [isActive, isScreenFocused, manualPaused]);

  const handleTap = useCallback(() => {
    setManualPaused((p) => !p);
    setShowIcon(true);
    setTimeout(() => setShowIcon(false), 800);
  }, []);

  const handleLike = useCallback(() => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => newLiked ? prev + 1 : prev - 1);

    likeMutate({
      reelId: item.id,
      reelUserId: item.userId,
      liked: newLiked,
      currentUserId: user?.uid ?? '',
      currentUsername: userProfile?.username || user?.displayName || 'Someone',
    }, {
      onError: () => {
        setLiked(!newLiked);
        setLikesCount((prev) => newLiked ? prev - 1 : prev + 1);
      },
    });
  }, [liked, item, user, userProfile, likeMutate]);

  return (
    <Pressable style={styles.reelContainer} onPress={handleTap}>
      <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} />

      {showIcon && (
        <View style={styles.tapIconContainer}>
          <Ionicons name={manualPaused ? 'pause' : 'play'} size={wp(15)} color="rgba(255,255,255,0.85)" />
        </View>
      )}

      <View style={styles.overlay}>
        {/* Right actions */}
        <View style={styles.rightActions}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={wp(5.5)} color="#fff" />
            </View>
            {!following && (
              <TouchableOpacity style={styles.followPlusBtn} onPress={() => setFollowing(true)}>
                <Ionicons name="add" size={wp(3.5)} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={wp(7.5)} color={liked ? '#E91E8C' : '#fff'} />
            <Text style={styles.actionText}>{formatCount(likesCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={wp(7)} color="#fff" />
            <Text style={styles.actionText}>{formatCount(item.commentsCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-social-outline" size={wp(7)} color="#fff" />
            <Text style={styles.actionText}>{formatCount(item.sharesCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="ellipsis-horizontal" size={wp(6)} color="#fff" />
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
            <Ionicons name="musical-notes" size={wp(3.5)} color="#fff" />
            <Text style={styles.musicText}> Original Sound</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

// ─── Feed Screen ───────────────────────────────────────────────────
const ReelsFeedScreen = () => {
  const { data: reels = [] } = useReels();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, [])
  );

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: IReel; index: number }) => (
      <ReelItem item={item} isActive={index === activeIndex} isScreenFocused={isScreenFocused} />
    ),
    [activeIndex, isScreenFocused]
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
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        removeClippedSubviews
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
};

export default ReelsFeedScreen;

const avatarSize = wp(11.5);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute', top: hp(6.25), left: 0, right: 0, zIndex: 10, alignItems: 'center',
  },
  topBarTitle: {
    color: '#fff', fontSize: responsiveFontSize(16), fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  reelContainer: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: '#000' },
  video: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingBottom: hp(11.25), paddingHorizontal: wp(3.5),
  },
  rightActions: {
    position: 'absolute', right: wp(3), bottom: hp(12.5),
    alignItems: 'center', gap: hp(2.25),
  },
  avatarContainer: { alignItems: 'center', marginBottom: hp(0.5) },
  avatar: {
    width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2,
    backgroundColor: '#555', borderWidth: 2, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  followPlusBtn: {
    width: wp(5), height: wp(5), borderRadius: wp(2.5),
    backgroundColor: '#E91E8C', justifyContent: 'center', alignItems: 'center',
    marginTop: -hp(1.25),
  },
  actionBtn: { alignItems: 'center', gap: hp(0.375) },
  actionText: {
    color: '#fff', fontSize: responsiveFontSize(12), fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  bottomInfo: { flex: 1, paddingRight: wp(18), paddingBottom: hp(0.5) },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: wp(2.5), marginBottom: hp(0.5) },
  username: {
    color: '#fff', fontSize: responsiveFontSize(15), fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  followTextBtn: {
    borderWidth: 1, borderColor: '#fff', borderRadius: wp(1),
    paddingHorizontal: wp(2.5), paddingVertical: hp(0.25),
  },
  followText: { color: '#fff', fontSize: responsiveFontSize(12), fontWeight: '600' },
  caption: {
    color: '#fff', fontSize: responsiveFontSize(14), marginBottom: hp(1),
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  musicRow: { flexDirection: 'row', alignItems: 'center' },
  musicText: { color: '#fff', fontSize: responsiveFontSize(13) },
  tapIconContainer: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center',
  },
});

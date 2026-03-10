import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, FlatList, Dimensions, StyleSheet,
  TouchableOpacity, Text, ActivityIndicator,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useUserReels } from '@/hooks/useUserReels';
import { IReel } from '@/constants/dummyData';
import { formatCount } from '@/utils/formatters';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const ReelViewerItem = React.memo(({ item, isActive }: { item: IReel; isActive: boolean }) => {
  const player = useVideoPlayer(item.videoUrl, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (isActive) player.play();
    else player.pause();
  }, [isActive]);

  return (
    <View style={styles.reelContainer}>
      <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} />
      <View style={styles.overlay}>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="heart-outline" size={wp(7.5)} color="#fff" />
            <Text style={styles.actionText}>{formatCount(item.likesCount)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={wp(7)} color="#fff" />
            <Text style={styles.actionText}>{formatCount(item.commentsCount)}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomInfo}>
          <Text style={styles.username}>@{item.username}</Text>
          <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
        </View>
      </View>
    </View>
  );
});

const ReelViewerScreen = () => {
  const { userId, startIndex } = useLocalSearchParams<{ userId: string; startIndex: string }>();
  const { data: reels = [], isLoading } = useUserReels(userId);
  const [activeIndex, setActiveIndex] = useState(Number(startIndex) || 0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (reels.length > 0) {
      const index = Number(startIndex) || 0;
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: false });
      }, 100);
    }
  }, [reels]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E8C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={wp(7)} color="#fff" />
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={({ item, index }) => (
          <ReelViewerItem item={item} isActive={index === activeIndex} />
        )}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({ length: SCREEN_HEIGHT, offset: SCREEN_HEIGHT * index, index })}
        removeClippedSubviews
        initialNumToRender={2}
      />
    </View>
  );
};

export default ReelViewerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  backBtn: {
    position: 'absolute', top: hp(6.5), left: wp(4), zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: wp(5), padding: wp(1.5),
  },
  reelContainer: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: '#000' },
  video: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingBottom: hp(6.25), paddingHorizontal: wp(3.5),
  },
  rightActions: {
    position: 'absolute', right: wp(3), bottom: hp(10),
    alignItems: 'center', gap: hp(2.25),
  },
  actionBtn: { alignItems: 'center', gap: hp(0.375) },
  actionText: { color: '#fff', fontSize: responsiveFontSize(12), fontWeight: '600' },
  bottomInfo: { flex: 1, paddingRight: wp(15), paddingBottom: hp(0.5) },
  username: { color: '#fff', fontSize: responsiveFontSize(15), fontWeight: 'bold', marginBottom: hp(0.5) },
  caption: { color: '#fff', fontSize: responsiveFontSize(14) },
});

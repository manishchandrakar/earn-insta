import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppRoutes } from '@/constants/routes';
import toast from '@/utils/toast';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

const UploadScreen = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Please allow media library access', { title: 'Permission needed' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos',
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!videoUri) {
      toast.error('Please select a video first');
      return;
    }
    if (!caption.trim()) {
      toast.error('Please add a caption');
      return;
    }
    if (!user) return;

    setUploading(true);
    setProgress(0);

    try {
      const token = await user.getIdToken();
      const filenamePath = `reels/${user.uid}/${Date.now()}.mp4`;
      const filenameEncoded = encodeURIComponent(filenamePath);
      const bucket = 'earn-insta.firebasestorage.app';
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${filenameEncoded}`;

      const response = await fetch(videoUri);
      const blob = await response.blob();

      const responseData: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(`Status ${xhr.status}: ${xhr.responseText}`));
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.open('POST', uploadUrl, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('Content-Type', 'video/mp4');
        xhr.send(blob);
      });

      setProgress(100);

      const downloadToken = responseData.downloadTokens;
      const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${filenameEncoded}?alt=media&token=${downloadToken}`;

      await addDoc(collection(db, 'reels'), {
        videoUrl: downloadURL,
        caption: caption.trim(),
        userId: user.uid,
        username: userProfile?.username || user.displayName || 'user',
        userAvatar: userProfile?.photoURL || '',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        viewsCount: 0,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', user.uid), {
        reelsCount: increment(1),
      });

      await queryClient.invalidateQueries({ queryKey: ['userReels', user.uid] });
      await queryClient.invalidateQueries({ queryKey: ['reels'] });
      await refreshProfile();
      setUploading(false);
      setVideoUri(null);
      setCaption('');
      toast.success('Your reel has been uploaded!', { title: 'Posted!' });
      setTimeout(() => router.replace(AppRoutes.PROFILE), 1500);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message, { title: 'Upload failed' });
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Upload Reel</Text>

      <TouchableOpacity style={styles.videoPicker} onPress={pickVideo}>
        {videoUri ? (
          <View style={styles.videoSelected}>
            <Ionicons name="checkmark-circle" size={wp(10)} color="#E91E8C" />
            <Text style={styles.videoSelectedText}>Video Selected</Text>
            <Text style={styles.changeText}>Tap to change</Text>
          </View>
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="cloud-upload-outline" size={wp(12.5)} color="#555" />
            <Text style={styles.videoPlaceholderText}>Tap to select video</Text>
            <Text style={styles.videoSubText}>MP4, MOV up to 500MB</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.captionContainer}>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption... #hashtags"
          placeholderTextColor="#555"
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={200}
        />
        <Text style={styles.charCount}>{caption.length}/200</Text>
      </View>

      {uploading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% uploaded...</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.uploadBtn, (!videoUri || uploading) && styles.uploadBtnDisabled]}
        onPress={handleUpload}
        disabled={!videoUri || uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={wp(5)} color="#fff" />
            <Text style={styles.uploadBtnText}>Post Reel</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { padding: wp(5), paddingTop: hp(7.5) },
  title: { color: '#fff', fontSize: responsiveFontSize(22), fontWeight: 'bold', marginBottom: hp(3) },
  videoPicker: {
    height: hp(25), backgroundColor: '#111', borderRadius: wp(4),
    borderWidth: 1, borderColor: '#333', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', marginBottom: hp(2.5),
  },
  videoPlaceholder: { alignItems: 'center', gap: hp(1) },
  videoPlaceholderText: { color: '#888', fontSize: responsiveFontSize(16), fontWeight: '500' },
  videoSubText: { color: '#555', fontSize: responsiveFontSize(13) },
  videoSelected: { alignItems: 'center', gap: hp(0.75) },
  videoSelectedText: { color: '#fff', fontSize: responsiveFontSize(16), fontWeight: '600' },
  changeText: { color: '#888', fontSize: responsiveFontSize(13) },
  captionContainer: {
    backgroundColor: '#111', borderRadius: wp(3),
    borderWidth: 1, borderColor: '#333', padding: wp(3.5), marginBottom: hp(2.5),
  },
  captionInput: { color: '#fff', fontSize: responsiveFontSize(15), minHeight: hp(10), textAlignVertical: 'top' },
  charCount: { color: '#555', fontSize: responsiveFontSize(12), textAlign: 'right', marginTop: hp(1) },
  progressContainer: { marginBottom: hp(2), gap: hp(1) },
  progressBar: {
    height: hp(0.75), backgroundColor: '#222', borderRadius: wp(1), overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#E91E8C', borderRadius: wp(1) },
  progressText: { color: '#888', fontSize: responsiveFontSize(13), textAlign: 'center' },
  uploadBtn: {
    backgroundColor: '#E91E8C', borderRadius: wp(3.5), padding: hp(2),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(2),
  },
  uploadBtnDisabled: { backgroundColor: '#4a0a2a', opacity: 0.6 },
  uploadBtnText: { color: '#fff', fontSize: responsiveFontSize(16), fontWeight: 'bold' },
});

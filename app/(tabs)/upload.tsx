import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

export default function UploadScreen() {
  const { user, userProfile } = useAuth();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow media library access');
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
      Alert.alert('No video', 'Please select a video first');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Caption needed', 'Please add a caption');
      return;
    }
    if (!user) return;

    setUploading(true);
    setProgress(0);

    try {
      // Get Firebase auth token
      const token = await user.getIdToken();
      const filenamePath = `reels/${user.uid}/${Date.now()}.mp4`;
      const filenameEncoded = encodeURIComponent(filenamePath);
      const bucket = 'earn-insta.firebasestorage.app';
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${filenameEncoded}`;

      // Read file as base64 then upload via XHR with progress
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

      // Save reel to Firestore
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

      // Update user reel count
      await updateDoc(doc(db, 'users', user.uid), {
        reelsCount: increment(1),
      });

      setUploading(false);
      setVideoUri(null);
      setCaption('');
      Alert.alert('Success!', 'Your reel has been uploaded!', [
        { text: 'View Feed', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message);
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Upload Reel</Text>

      {/* Video picker */}
      <TouchableOpacity style={styles.videoPicker} onPress={pickVideo}>
        {videoUri ? (
          <View style={styles.videoSelected}>
            <Ionicons name="checkmark-circle" size={40} color="#E91E8C" />
            <Text style={styles.videoSelectedText}>Video Selected</Text>
            <Text style={styles.changeText}>Tap to change</Text>
          </View>
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="cloud-upload-outline" size={50} color="#555" />
            <Text style={styles.videoPlaceholderText}>Tap to select video</Text>
            <Text style={styles.videoSubText}>MP4, MOV up to 500MB</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption */}
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

      {/* Upload progress */}
      {uploading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% uploaded...</Text>
        </View>
      )}

      {/* Upload button */}
      <TouchableOpacity
        style={[styles.uploadBtn, (!videoUri || uploading) && styles.uploadBtnDisabled]}
        onPress={handleUpload}
        disabled={!videoUri || uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.uploadBtnText}>Post Reel</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  videoPicker: {
    height: 200, backgroundColor: '#111', borderRadius: 16,
    borderWidth: 1, borderColor: '#333', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  videoPlaceholder: { alignItems: 'center', gap: 8 },
  videoPlaceholderText: { color: '#888', fontSize: 16, fontWeight: '500' },
  videoSubText: { color: '#555', fontSize: 13 },
  videoSelected: { alignItems: 'center', gap: 6 },
  videoSelectedText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  changeText: { color: '#888', fontSize: 13 },
  captionContainer: {
    backgroundColor: '#111', borderRadius: 12,
    borderWidth: 1, borderColor: '#333', padding: 14, marginBottom: 20,
  },
  captionInput: { color: '#fff', fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  charCount: { color: '#555', fontSize: 12, textAlign: 'right', marginTop: 8 },
  progressContainer: { marginBottom: 16, gap: 8 },
  progressBar: {
    height: 6, backgroundColor: '#222', borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#E91E8C', borderRadius: 3 },
  progressText: { color: '#888', fontSize: 13, textAlign: 'center' },
  uploadBtn: {
    backgroundColor: '#E91E8C', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  uploadBtnDisabled: { backgroundColor: '#4a0a2a', opacity: 0.6 },
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

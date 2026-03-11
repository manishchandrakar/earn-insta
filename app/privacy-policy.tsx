import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Privacy Policy', headerShown: true, headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.date}>Last updated: March 2026</Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.body}>
          We collect information you provide directly to us, such as when you create an account (email address, username). We also collect videos and media you choose to upload through the app.
        </Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.body}>
          We use the information we collect to:{'\n'}
          • Provide and maintain the Reel app{'\n'}
          • Authenticate your account{'\n'}
          • Store and display your uploaded videos{'\n'}
          • Improve our services
        </Text>

        <Text style={styles.heading}>3. Data Storage</Text>
        <Text style={styles.body}>
          Your data is stored securely using Firebase (Google Cloud). Videos and media are stored in Firebase Storage. Authentication data is managed by Firebase Authentication.
        </Text>

        <Text style={styles.heading}>4. Media Access</Text>
        <Text style={styles.body}>
          The app requests access to your device&rsquo;s media library (photos and videos) only when you choose to upload content. We do not access your media without your explicit action.
        </Text>

        <Text style={styles.heading}>5. Data Sharing</Text>
        <Text style={styles.body}>
          We do not sell, trade, or share your personal information with third parties, except as required to operate our services (e.g., Firebase by Google).
        </Text>

        <Text style={styles.heading}>6. Data Deletion</Text>
        <Text style={styles.body}>
          You may request deletion of your account and associated data at any time by contacting us. Upon request, we will delete your personal information from our systems within 30 days.
        </Text>

        <Text style={styles.heading}>7. Children&#39;s Privacy</Text>
        <Text style={styles.body}>
          This app is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13.
        </Text>

        <Text style={styles.heading}>8. Contact Us</Text>
        <Text style={styles.body}>
          If you have any questions about this Privacy Policy, please contact us at:{'\n'}
          amanchanderi1234@gmail.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#888',
    marginBottom: 24,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E91E8C',
    marginTop: 20,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
});

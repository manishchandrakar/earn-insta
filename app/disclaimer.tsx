import { ScrollView, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DisclaimerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Disclaimer', headerShown: true, headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Disclaimer</Text>
        <Text style={styles.date}>Last updated: March 2026</Text>

        <Text style={styles.heading}>1. General Information</Text>
        <Text style={styles.body}>
          The Reel app is provided for entertainment and personal content sharing purposes only. The content displayed on this platform is user-generated and does not represent the views or opinions of the Reel team.
        </Text>

        <Text style={styles.heading}>2. User-Generated Content</Text>
        <Text style={styles.body}>
          We are not responsible for any content uploaded by users. Users are solely responsible for the videos, images, and other media they share on the platform. By uploading content, users confirm they hold the necessary rights to that content.
        </Text>

        <Text style={styles.heading}>3. No Warranty</Text>
        <Text style={styles.body}>
          The app is provided &rdquo;as is&#34; without any warranty of any kind, express or implied. We do not guarantee that the app will be uninterrupted, error-free, or free from harmful components.
        </Text>

        <Text style={styles.heading}>4. Limitation of Liability</Text>
        <Text style={styles.body}>
          To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Reel app.
        </Text>

        <Text style={styles.heading}>5. Third-Party Services</Text>
        <Text style={styles.body}>
          The app uses third-party services including Firebase by Google. We are not responsible for the availability, accuracy, or content of these external services. Their respective terms and privacy policies apply.
        </Text>

        <Text style={styles.heading}>6. Changes to This Disclaimer</Text>
        <Text style={styles.body}>
          We reserve the right to update this disclaimer at any time. Continued use of the app after any changes constitutes your acceptance of the updated disclaimer.
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

import { ScrollView, Text, StyleSheet, TouchableOpacity, Linking, Alert, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const EMAIL = 'amanchanderi1234@gmail.com';

export default function ContactScreen() {
  const openEmail = () => {
    Linking.openURL(`mailto:${EMAIL}?subject=Reel App Support`).catch(() =>
      Alert.alert('Error', 'Could not open email client.')
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Contact Us', headerShown: true, headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="chatbubbles" size={36} color="#E91E8C" />
          </View>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>Have a question or feedback?{'\n'}We&apos;d love to hear from you.</Text>
        </View>

        {/* Email Card */}
        <TouchableOpacity style={styles.emailCard} onPress={openEmail} activeOpacity={0.8}>
          <View style={styles.emailLeft}>
            <View style={styles.emailIconBg}>
              <Ionicons name="mail" size={22} color="#E91E8C" />
            </View>
            <View>
              <Text style={styles.emailLabel}>Send us an email</Text>
              <Text style={styles.emailValue}>{EMAIL}</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={26} color="#E91E8C" />
        </TouchableOpacity>

        {/* Support Topics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support Topics</Text>
          {[
            { icon: 'person-outline', text: 'Account issues (login, deletion, profile)' },
            { icon: 'cloud-upload-outline', text: 'Content upload problems' },
            { icon: 'bug-outline', text: 'Bug reports' },
            { icon: 'bulb-outline', text: 'Feature requests' },
            { icon: 'shield-outline', text: 'Privacy & data inquiries' },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.topicRow}>
              <Ionicons name={icon as any} size={16} color="#E91E8C" />
              <Text style={styles.topicText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Response Time */}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#888" />
          <Text style={styles.infoText}>We typically respond within <Text style={styles.infoHighlight}>2–3 business days</Text></Text>
        </View>

        <Text style={styles.footer}>Reel App · v1.0.0 · © 2026 Manish Chandrakar</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 20, paddingBottom: 48 },

  hero: { alignItems: 'center', paddingVertical: 32 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1a001a', borderWidth: 1, borderColor: '#3a003a',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },

  emailCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#E91E8C33',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  emailLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  emailIconBg: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#1a001a', justifyContent: 'center', alignItems: 'center',
  },
  emailLabel: { color: '#888', fontSize: 12, marginBottom: 2 },
  emailValue: { color: '#fff', fontSize: 13, fontWeight: '600' },

  card: {
    backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#1e1e1e',
    borderRadius: 16, padding: 16, marginBottom: 16, gap: 14,
  },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topicText: { color: '#bbb', fontSize: 13, flex: 1 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#1e1e1e',
    borderRadius: 12, padding: 14, marginBottom: 32,
  },
  infoText: { color: '#888', fontSize: 13, flex: 1 },
  infoHighlight: { color: '#fff', fontWeight: '600' },

  footer: { fontSize: 12, color: '#333', textAlign: 'center' },
});

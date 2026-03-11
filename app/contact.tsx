import { ScrollView, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ContactRow = ({ icon, label, value, onPress }: { icon: any; label: string; value: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon} size={20} color="#E91E8C" style={styles.rowIcon} />
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
    <Ionicons name="chevron-forward" size={16} color="#444" />
  </TouchableOpacity>
);

export default function ContactScreen() {
  const openEmail = () => {
    Linking.openURL('mailto:amanchanderi1234@gmail.com ?subject=Reel App Support').catch(() =>
      Alert.alert('Error', 'Could not open email client.')
    );
  };



  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Contact Us', headerShown: true, headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Contact Us</Text>
        <Text style={styles.subtitle}>
          Have a question, feedback, or found a bug? We&#39;d love to hear from you.
        </Text>

        <Text style={styles.sectionHeading}>GET IN TOUCH</Text>

        <ContactRow
          icon="mail-outline"
          label="Email"
          value="amanchanderi1234@gmail.com "
          onPress={openEmail}
        />
       

        <Text style={styles.sectionHeading}>SUPPORT TOPICS</Text>
        <Text style={styles.body}>
          • Account issues (login, deletion, profile){'\n'}
          • Content upload problems{'\n'}
          • Bug reports{'\n'}
          • Feature requests{'\n'}
          • Privacy & data inquiries
        </Text>

        <Text style={styles.sectionHeading}>RESPONSE TIME</Text>
        <Text style={styles.body}>
          We typically respond within 2–3 business days. For urgent issues, please include &ldquo;URGENT&rdquo; in your email subject line.
        </Text>

        <Text style={styles.footer}>
          Reel App · Version 1.0.0 · © 2026 Manish Chandrakar
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    lineHeight: 22,
    marginBottom: 32,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  rowIcon: { marginRight: 12 },
  rowLabel: { color: '#888', fontSize: 13, marginRight: 8 },
  rowValue: { flex: 1, color: '#fff', fontSize: 13 },
  body: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 24,
  },
  footer: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
    marginTop: 48,
  },
});

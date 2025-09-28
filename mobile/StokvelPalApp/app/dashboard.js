import { View, Text, Button, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { useRouter } from 'expo-router';
import { AppContext } from './context/AppContext';

export default function Dashboard() {
  const { user } = useContext(AppContext);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>StokvelPal Dashboard</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Phone Number:</Text>
        <Text style={styles.value}>{user.phone || 'Not set'}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Verified:</Text>
        <Text style={styles.value}>{user.isVerified ? 'Yes ✅' : 'No ❌'}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Your Stokvel Groups:</Text>
        <Text style={styles.value}>Coming soon...</Text>
      </View>

      <Button
        title='View My Groups'
        onPress={() => router.push('/groups')}
        color='#1E88E5'
      />

      <Button
        title="Logout"
        color="#E53935"
        onPress={() => router.replace('/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  infoBox: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    marginTop: 5,
  },
});

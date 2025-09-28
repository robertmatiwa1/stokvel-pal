import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useState, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AppContext } from './context/AppContext';
import { useRouter } from 'expo-router';

export default function PinVerification() {
  const { user, setUser } = useContext(AppContext);
  const [pin, setPin] = useState('');
  const router = useRouter();

  const handleVerify = async () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'Enter a 4-digit PIN');
      return;
    }

    try {
      // Save PIN securely
      await SecureStore.setItemAsync('userPin', pin);

      // Update user state
      setUser({ ...user, isVerified: true });

      // Show success message
      Alert.alert('Success', 'Phone verified and PIN saved!', [
        {
          text: 'Continue',
          onPress: () => router.replace('/dashboard'), // Navigate to Dashboard
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save PIN. Try again.');
      console.error('SecureStore error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter 4-digit PIN</Text>

      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={setPin}
        placeholder="••••"
      />

      <Button title="Verify PIN" onPress={handleVerify} />
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
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 10,
  },
});

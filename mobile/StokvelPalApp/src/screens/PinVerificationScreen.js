import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export default function PinVerificationScreen({ route, navigation }) {
  const { phoneNumber } = route.params || {};
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('Enter a 4-digit PIN');
      return;
    }

    try {
      const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
      await SecureStore.setItemAsync('user_pin_hash', digest);
      await SecureStore.setItemAsync('user_phone', phoneNumber);
      Alert.alert('Success', 'PIN saved securely. Proceeding to app.');
      navigation.navigate('Welcome');
    } catch (err) {
      console.error(err);
      setError('Failed to save PIN');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Enter the 4-digit PIN</Text>
      <Text style={styles.hint}>A verification code was sent to {phoneNumber}</Text>

      <TextInput
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={t => { setPin(t.replace(/\D/g, '')); setError(''); }}
        style={styles.input}
        placeholder="••••"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.btn} onPress={onSubmit}>
        <Text style={styles.btnText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  hint: { color: '#666', marginBottom: 18 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, fontSize: 24, textAlign: 'center', letterSpacing: 12, marginBottom: 12 },
  error: { color: 'red', marginBottom: 8 },
  btn: { backgroundColor: '#1f6feb', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
});

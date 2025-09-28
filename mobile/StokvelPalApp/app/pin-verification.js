import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';

export default function PinVerification() {
  const [pin, setPin] = useState('');

  const submitPin = () => {
    if (pin.length === 4) {
      Alert.alert('Success', 'PIN verified!');
    } else {
      Alert.alert('Error', 'Enter a 4-digit PIN');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20, textAlign: 'center' }}>Enter 4-digit PIN</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 20 }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={setPin}
      />
      <Button title="Verify" onPress={submitPin} />
    </View>
  );
}

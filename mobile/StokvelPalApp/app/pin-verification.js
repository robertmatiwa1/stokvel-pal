import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AppContext } from './context/AppContext';

export default function PinVerification() {
  const { user, setUser } = useContext(AppContext);
  const [pin, setPin] = useState('');

  const handleVerify = async () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'Enter a 4-digit PIN');
      return;
    }

    // Save PIN securely
    await SecureStore.setItemAsync('userPin', pin);
    setUser({ ...user, isVerified: true });
    Alert.alert('Success', 'Phone verified and PIN saved!');
    // Navigate to next screen in the future
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
      <Button title="Verify PIN" onPress={handleVerify} />
    </View>
  );
}

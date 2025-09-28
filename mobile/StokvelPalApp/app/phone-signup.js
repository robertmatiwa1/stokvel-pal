import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function PhoneSignup() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20, textAlign: 'center' }}>Enter Your Phone Number</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 20 }}
        placeholder="+27 000 000 000"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Button title="Continue" onPress={() => router.push('/pin-verification')} />
    </View>
  );
}

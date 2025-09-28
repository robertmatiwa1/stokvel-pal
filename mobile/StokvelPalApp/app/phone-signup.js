import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { AppContext } from './context/AppContext';

export default function PhoneSignup() {
  const router = useRouter();
  const { user, setUser } = useContext(AppContext);
  const [phone, setPhone] = useState(user.phone);

  const handleNext = () => {
    // Simple validation: South African numbers 10 digits after +27
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      Alert.alert('Invalid Phone', 'Enter a valid 10-digit South African number');
      return;
    }
    setUser({ ...user, phone });
    router.push('/pin-verification');
  };

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
      <Button title="Continue" onPress={handleNext} />
    </View>
  );
}

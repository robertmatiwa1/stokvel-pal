import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!username.trim() || !phone.trim() || !pin.trim()) {
      Alert.alert("Missing info", "Please fill in username, phone and pin.");
      return;
    }

    setLoading(true);
    try {
      await signUp(phone.trim(), pin.trim(), username.trim());
    } catch (e: any) {
      Alert.alert("Registration failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Create account</Text>

      <Text>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="testuser1"
        style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 }}
      />

      <Text>Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="0710000001"
        style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 }}
      />

      <Text>PIN</Text>
      <TextInput
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        placeholder="1234"
        style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 16 }}
      />

      <TouchableOpacity
        onPress={onRegister}
        disabled={loading}
        style={{ padding: 14, borderRadius: 8, borderWidth: 1, alignItems: "center", marginBottom: 12 }}
      >
        <Text>{loading ? "Creating..." : "Register"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignItems: "center" }}>
        <Text>Back to login</Text>
      </TouchableOpacity>
    </View>
  );
}

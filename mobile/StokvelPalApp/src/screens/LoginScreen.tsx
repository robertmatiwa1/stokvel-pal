import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!phone.trim() || !pin.trim()) {
      Alert.alert("Missing info", "Please enter phone and pin.");
      return;
    }

    setLoading(true);
    try {
      await signIn(phone.trim(), pin.trim());
    } catch (e: any) {
      Alert.alert("Login failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>StokvelPal</Text>

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
        onPress={onLogin}
        disabled={loading}
        style={{ padding: 14, borderRadius: 8, borderWidth: 1, alignItems: "center", marginBottom: 12 }}
      >
        <Text>{loading ? "Logging in..." : "Login"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ alignItems: "center" }}>
        <Text>Create account</Text>
      </TouchableOpacity>
    </View>
  );
}

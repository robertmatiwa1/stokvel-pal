import React, { useContext, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { AppContext } from "../context/AppContext";

export default function PhoneSignupScreen() {
  const router = useRouter();
  const { setPhone } = useContext(AppContext);

  const [phoneNumber, setPhoneNumber] = useState("");

  const handleContinue = () => {
    const cleaned = phoneNumber.trim();

    if (!cleaned) {
      Alert.alert("Phone number required", "Please enter your phone number to continue.");
      return;
    }

    setPhone(cleaned);

    // In a real app you would trigger OTP send here, for now we mock it
    router.push("/pin-verification");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your phone number</Text>

      <TextInput
        style={styles.input}
        placeholder="+27 000 000 000"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        We will send you a verification code, for now it is mocked.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    marginBottom: 14,
    textAlign: "center",
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#1f6feb",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  hint: {
    marginTop: 12,
    textAlign: "center",
    opacity: 0.7,
  },
});

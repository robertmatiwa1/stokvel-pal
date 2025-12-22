import React, { useContext, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { AppContext } from "../context/AppContext";

export default function PinVerificationScreen() {
  const router = useRouter();
  const { user, verifyUser } = useContext(AppContext);

  const [pin, setPin] = useState("");

  const maskedPhone = useMemo(() => {
    const p = user?.phone || "";
    if (p.length <= 4) return p;
    return `${p.slice(0, 3)}*****${p.slice(-3)}`;
  }, [user?.phone]);

  const handleVerify = () => {
    const cleaned = pin.trim();

    if (cleaned.length < 4) {
      Alert.alert("Invalid PIN", "Please enter the 4-digit code.");
      return;
    }

    // Mock OTP: accept 1234 for now
    if (cleaned !== "1234") {
      Alert.alert("Incorrect PIN", "Use 1234 for now (mock verification).");
      return;
    }

    verifyUser();
    router.replace("/groups");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your phone</Text>
      <Text style={styles.subtitle}>
        Enter the 4-digit code sent to {maskedPhone || "your number"}.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="1234"
        keyboardType="number-pad"
        maxLength={4}
        value={pin}
        onChangeText={setPin}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Mock PIN is 1234</Text>
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
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 18,
    opacity: 0.75,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 6,
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

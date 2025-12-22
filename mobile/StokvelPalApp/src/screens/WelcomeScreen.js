import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { AppContext } from "../context/AppContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useContext(AppContext);

  const goNext = () => {
    if (user?.isVerified) {
      router.push("/groups");
      return;
    }
    router.push("/phone-signup");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>StokvelPal</Text>
      <Text style={styles.subtitle}>Save together, grow together.</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/phone-signup")}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={goNext}>
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.75,
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#1f6feb",
    marginBottom: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#1f6feb",
  },
  secondaryButtonText: {
    color: "#1f6feb",
  },
});

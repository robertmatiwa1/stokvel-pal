import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";
const CUSTOMER_ID = "customer-1";

export default function BookingScreen() {
  const navigation = useNavigation();
  const [serviceType, setServiceType] = useState<string>("Cleaning");
  const [notes, setNotes] = useState<string>("");
  const [suburb, setSuburb] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitBooking = async () => {
    if (!serviceType.trim()) {
      Alert.alert("Service required", "Please enter the service you need");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: CUSTOMER_ID,
          serviceType: serviceType.trim(),
          notes: notes.trim() || undefined,
          suburb: suburb.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message ?? "Unable to create booking");
      }

      await response.json();

      Alert.alert("Booking confirmed", "Your provider will confirm shortly.", [
        {
          text: "View jobs",
          onPress: () => navigation.navigate("Dashboard" as never),
        },
      ]);
    } catch (error) {
      console.error("Failed to create booking", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Book a new service</Text>
        <Text style={styles.subtitle}>Tell us what you need and we will match you with a provider.</Text>

        <View style={styles.fieldSet}>
          <Text style={styles.label}>Service</Text>
          <TextInput
            style={styles.input}
            value={serviceType}
            onChangeText={setServiceType}
            placeholder="e.g. Cleaning"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.fieldSet}>
          <Text style={styles.label}>Preferred suburb (optional)</Text>
          <TextInput
            style={styles.input}
            value={suburb}
            onChangeText={setSuburb}
            placeholder="e.g. Sandton"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.fieldSet}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional details"
            multiline
            numberOfLines={4}
            editable={!isSubmitting}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={submitBooking}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : "Confirm Booking"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  container: {
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#4A4A4A",
    marginBottom: 24,
  },
  fieldSet: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E1E5EA",
  },
  notesInput: {
    height: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#0275D8",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

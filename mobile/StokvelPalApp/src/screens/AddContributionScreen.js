import React, { useContext, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AppContext } from "../context/AppContext";

export default function AddContributionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const groupId = typeof params.groupId === "string" ? params.groupId : "";
  const groupName = typeof params.groupName === "string" ? params.groupName : "";

  const { groups, addTransaction } = useContext(AppContext);

  const [amount, setAmount] = useState("");

  const selectedGroup = useMemo(() => {
    return groups?.find((g) => g.id === groupId) || null;
  }, [groups, groupId]);

  const handleContribution = () => {
    const cleaned = amount.trim().replace(",", ".");
    const value = Number(cleaned);

    if (!groupId) {
      Alert.alert("Missing group", "Please select a group first.");
      router.replace("/groups");
      return;
    }

    if (!cleaned || Number.isNaN(value) || value <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount greater than 0.");
      return;
    }

    addTransaction({ groupId, amount: value });

    Alert.alert("Success", "Contribution added.");
    router.replace("/transactions");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Add Contribution{groupName ? `, ${groupName}` : ""}
      </Text>

      {selectedGroup?.contribution ? (
        <Text style={styles.helper}>
          Suggested monthly contribution: R{selectedGroup.contribution}
        </Text>
      ) : null}

      <TextInput
        placeholder="Enter amount, e.g. 500"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleContribution}>
        <Text style={styles.buttonText}>Contribute</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkBtn} onPress={() => router.back()}>
        <Text style={styles.linkText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, marginBottom: 8, fontWeight: "800" },
  helper: { marginBottom: 14, opacity: 0.75 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    fontSize: 16,
  },

  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#1f6feb",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  linkBtn: { marginTop: 12, alignItems: "center" },
  linkText: { color: "#1f6feb", fontWeight: "800" },
});

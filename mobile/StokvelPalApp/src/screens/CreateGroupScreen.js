import React, { useContext, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { AppContext } from "../context/AppContext";

export default function CreateGroupScreen() {
  const router = useRouter();
  const { addGroup } = useContext(AppContext);

  const [name, setName] = useState("");
  const [contribution, setContribution] = useState("");

  const handleCreate = () => {
    const groupName = name.trim();
    const cleaned = contribution.trim().replace(",", ".");
    const amount = Number(cleaned);

    if (!groupName) {
      Alert.alert("Group name required", "Please enter a group name.");
      return;
    }

    if (!cleaned || Number.isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid contribution", "Please enter a valid monthly contribution amount.");
      return;
    }

    addGroup({ name: groupName, contribution: amount });

    Alert.alert("Success", "Group created.");
    router.replace("/groups");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Group</Text>

      <Text style={styles.label}>Group name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Family Stokvel"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Monthly contribution (R)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 500"
        keyboardType="numeric"
        value={contribution}
        onChangeText={setContribution}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkBtn} onPress={() => router.back()}>
        <Text style={styles.linkText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 18, textAlign: "center" },

  label: { fontWeight: "700", marginBottom: 6, opacity: 0.85 },
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
    marginTop: 6,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  linkBtn: { marginTop: 12, alignItems: "center" },
  linkText: { color: "#1f6feb", fontWeight: "800" },
});

import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function AddContributionScreen() {
  const { groupId, groupName } = useLocalSearchParams();
  const router = useRouter();
  const [amount, setAmount] = useState("");

  const handleContribution = () => {
    // TODO: Replace with real API call
    router.push({
      pathname: "/transactions",
      params: { groupId, groupName, amount },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Contribution to {groupName}</Text>
      <TextInput
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />
      <Button title="Contribute" onPress={handleContribution} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, marginBottom: 16, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
});

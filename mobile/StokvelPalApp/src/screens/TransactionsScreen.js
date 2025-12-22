import React from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import TransactionItem from "../components/TransactionItem";

const dummyTransactions = [
  { id: "t1", user: "Alice", amount: 200, date: "2025-09-25" },
  { id: "t2", user: "Bob", amount: 150, date: "2025-09-26" },
];

export default function TransactionsScreen() {
  const { groupName } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions - {groupName}</Text>
      <FlatList
        data={dummyTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, marginBottom: 16, fontWeight: "bold" },
});

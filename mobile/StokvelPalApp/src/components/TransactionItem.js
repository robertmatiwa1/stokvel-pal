import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TransactionItem({ transaction }) {
  return (
    <View style={styles.item}>
      <Text style={styles.user}>{transaction.user}</Text>
      <Text style={styles.amount}>R{transaction.amount}</Text>
      <Text style={styles.date}>{transaction.date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    marginVertical: 6,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  user: { fontSize: 16, fontWeight: "600" },
  amount: { fontSize: 16, color: "green" },
  date: { fontSize: 14, color: "#666" },
});

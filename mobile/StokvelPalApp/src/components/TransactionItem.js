import React from "react";
import { View, Text, StyleSheet } from "react-native";

const formatZAR = (value: number | string) => {
  const n = Number(value) || 0;
  return `R ${n.toFixed(2)}`;
};

export default function TransactionItem({ transaction }) {
  return (
    <View style={styles.item}>
      <Text style={styles.user}>{transaction.user}</Text>

      <Text
        style={[
          styles.amount,
          { color: Number(transaction.amount) >= 0 ? "green" : "red" },
        ]}
      >
        {formatZAR(transaction.amount)}
      </Text>

      <Text style={styles.date}>
        {new Date(transaction.date).toLocaleDateString("en-ZA")}
      </Text>
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
  amount: { fontSize: 16, fontWeight: "700" },
  date: { fontSize: 14, color: "#666" },
});

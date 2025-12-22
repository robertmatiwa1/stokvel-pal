import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export default function GroupCard({ group, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{group.name}</Text>
      <Text style={styles.details}>
        Members: {group.members} | Total: R{group.total}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  details: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
});

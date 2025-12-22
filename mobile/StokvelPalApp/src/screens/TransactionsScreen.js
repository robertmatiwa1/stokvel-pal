import React, { useContext, useMemo } from "react";
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import TransactionItem from "../components/TransactionItem";
import { AppContext } from "../context/AppContext";

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions, groups } = useContext(AppContext);

  const enriched = useMemo(() => {
    const groupMap = new Map((groups || []).map((g) => [g.id, g.name]));
    const list = (transactions || []).map((t) => ({
      ...t,
      groupName: groupMap.get(t.groupId) || "Unknown group",
    }));
    // latest first
    return list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [transactions, groups]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>

        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/groups")}>
          <Text style={styles.backText}>Back to Groups</Text>
        </TouchableOpacity>
      </View>

      {enriched.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptyText}>Add a contribution from any group to see it here.</Text>
        </View>
      ) : (
        <FlatList
          data={enriched}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => <TransactionItem transaction={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  title: { fontSize: 20, fontWeight: "800" },

  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f6feb",
  },
  backText: { color: "#1f6feb", fontWeight: "800" },

  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  emptyText: { textAlign: "center", opacity: 0.75 },
});

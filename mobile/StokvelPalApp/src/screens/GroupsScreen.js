import React, { useContext } from "react";
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import GroupCard from "../components/GroupCard";
import { AppContext } from "../context/AppContext";

export default function GroupsScreen() {
  const router = useRouter();
  const { groups, user, logout } = useContext(AppContext);

  const goToAddContribution = (group) => {
    router.push({
      pathname: "/add-group",
      params: { groupId: group.id, groupName: group.name },
    });
  };

  const goToCreateGroup = () => {
    // For now reuse the same route, later we will split it into /create-group
    router.push("/create-group" );
  };

  const goToTransactions = () => {
    router.push("/transactions");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Groups</Text>
          <Text style={styles.subtitle}>
            {user?.phone ? `Signed in as ${user.phone}` : "Signed in"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.primaryBtn} onPress={goToCreateGroup}>
          <Text style={styles.primaryBtnText}>Create Group</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={goToTransactions}>
          <Text style={styles.secondaryBtnText}>Transactions</Text>
        </TouchableOpacity>
      </View>

      {(!groups || groups.length === 0) ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No groups yet</Text>
          <Text style={styles.emptyText}>Create your first stokvel group to get started.</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <GroupCard group={item} onPress={() => goToAddContribution(item)} />
          )}
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
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { marginTop: 2, opacity: 0.7 },

  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logoutText: { fontWeight: "700" },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 8,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#1f6feb",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f6feb",
    backgroundColor: "transparent",
  },
  secondaryBtnText: { color: "#1f6feb", fontWeight: "800" },

  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  emptyText: { textAlign: "center", opacity: 0.75 },
});

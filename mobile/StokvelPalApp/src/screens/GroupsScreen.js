import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import GroupCard from "../components/GroupCard";

const dummyGroups = [
  { id: "1", name: "Family Stokvel", members: 8, total: 5000 },
  { id: "2", name: "Friends Savings", members: 5, total: 2500 },
];

export default function GroupsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onPress={() =>
              router.push({
                pathname: "/add-contribution",
                params: { groupId: item.id, groupName: item.name },
              })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
});

import React, { useCallback, useLayoutEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { joinGroup, listMembers, Member } from "../api/endpoints";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<RootStackParamList, "GroupDetails">;

export default function GroupDetailsScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: groupName || "Group details" });
  }, [navigation, groupName]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMembers(groupId);
      setMembers(data);
    } catch (e: any) {
      const message = e?.message ? String(e.message) : "Failed to load members.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleJoin = useCallback(async () => {
    setJoining(true);
    try {
      await joinGroup(groupId);
      await load();
      Alert.alert("Success", "You have joined this group.");
    } catch (e: any) {
      const message = e?.message ? String(e.message) : "Failed to join group.";
      Alert.alert("Error", message);
    } finally {
      setJoining(false);
    }
  }, [groupId, load]);

  const goMonthlySummary = useCallback(() => {
    navigation.navigate("MonthlySummary", { groupId, groupName });
  }, [navigation, groupId, groupName]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Members</Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddMember", { groupId, groupName })}
            style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
          >
            <Text>Add member</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleJoin}
            disabled={joining}
            style={{
              padding: 10,
              borderWidth: 1,
              borderRadius: 8,
              opacity: joining ? 0.6 : 1,
            }}
          >
            <Text>{joining ? "Joining..." : "Join group"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={goMonthlySummary}
        style={{
          padding: 12,
          borderRadius: 10,
          backgroundColor: "#111",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
          Monthly summary
        </Text>
      </TouchableOpacity>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View style={{ padding: 14, borderWidth: 1, borderRadius: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 16 }}>{item.username}</Text>
            <Text>{item.phone}</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>
              Joined: {new Date(item.joined_at).toLocaleDateString("en-ZA")}
            </Text>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text>No members yet.</Text> : null}
        ListFooterComponent={
          <View style={{ marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Contributions", { groupId, groupName })}
              style={{
                backgroundColor: "black",
                paddingVertical: 12,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                View Contributions
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

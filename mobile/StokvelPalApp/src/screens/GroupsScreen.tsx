import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { RootStackParamList } from "../navigation/AppNavigator";
import { listGroups, Group } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Groups">;

export default function GroupsScreen({ navigation }: Props) {
  const { signOut } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listGroups();
      setGroups(data);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const logout = async () => {
    await signOut();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateGroup")}
          style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
        >
          <Text>Create group</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}>
          <Text>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("GroupDetails", { groupId: item.id, groupName: item.name })}
            style={{ padding: 14, borderWidth: 1, borderRadius: 10, marginBottom: 10 }}
          >
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
            {item.description ? <Text>{item.description}</Text> : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? <Text>No groups yet.</Text> : null}
      />
    </View>
  );
}

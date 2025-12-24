import React, { useCallback, useLayoutEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { listContributionsByGroup } from "../api/endpoints";
import { formatZAR } from "../utils/money";

type Props = NativeStackScreenProps<RootStackParamList, "Contributions">;

export default function ContributionsScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [total, setTotal] = useState<string>("0");
  const [totalsByMember, setTotalsByMember] = useState<
    { user_id: string; username: string; total: string }[]
  >([]);
  const [items, setItems] = useState<any[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: groupName ? `Contributions, ${groupName}` : "Contributions",
    });
  }, [navigation, groupName]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listContributionsByGroup(groupId);
      setTotal(data.total ?? "0");
      setTotalsByMember(data.totalsByMember ?? []);
      setItems(data.items ?? []);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await listContributionsByGroup(groupId);
      setTotal(data.total ?? "0");
      setTotalsByMember(data.totalsByMember ?? []);
      setItems(data.items ?? []);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setRefreshing(false);
    }
  }, [groupId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    navigation.navigate("AddContribution", { groupId, groupName });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Group total */}
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: "#f2f2f2" }}>
        <Text style={{ fontSize: 16, fontWeight: "700" }}>Group total</Text>
        <Text style={{ fontSize: 28, fontWeight: "800", marginTop: 6 }}>
          {formatZAR(Number(total))}
        </Text>

        <TouchableOpacity
          onPress={openAdd}
          style={{
            marginTop: 12,
            backgroundColor: "black",
            paddingVertical: 12,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
            Add contribution
          </Text>
        </TouchableOpacity>
      </View>

      {/* Totals per member */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
          Totals per member
        </Text>

        <FlatList
          data={totalsByMember}
          keyExtractor={(item) => item.user_id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: "#fff",
                marginRight: 10,
                borderWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text style={{ fontWeight: "700" }}>{item.username || "Member"}</Text>
              <Text style={{ marginTop: 6, fontSize: 16, fontWeight: "800" }}>
                {formatZAR(Number(item.total))}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Contribution history */}
      <View style={{ marginTop: 16, flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
          History
        </Text>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={{ color: "#666", marginTop: 12 }}>
              {loading ? "Loading..." : "No contributions yet."}
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: "#fff",
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text style={{ fontWeight: "800" }}>
                {formatZAR(Number(item.amount))}
              </Text>
              <Text style={{ marginTop: 4, color: "#444" }}>
                {item.username || "Member"}
              </Text>
              <Text style={{ marginTop: 4, color: "#666" }}>
                {new Date(item.paid_at).toLocaleDateString("en-ZA")}
              </Text>
              {!!item.note && (
                <Text style={{ marginTop: 6, color: "#333" }}>{item.note}</Text>
              )}
            </View>
          )}
        />
      </View>
    </View>
  );
}

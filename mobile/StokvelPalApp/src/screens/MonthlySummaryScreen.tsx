import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getMonthlySummary, MonthlySummaryRow } from "../api/endpoints";
import { formatZAR } from "../utils/money";

type Props = NativeStackScreenProps<RootStackParamList, "MonthlySummary">;

const monthLabel = (yyyyMm: string) => {
  const [y, m] = yyyyMm.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString("en-ZA", { year: "numeric", month: "short" });
};

export default function MonthlySummaryScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [year, setYear] = useState<number>(currentYear);
  const [rows, setRows] = useState<MonthlySummaryRow[]>([]);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: groupName ? `Monthly summary, ${groupName}` : "Monthly summary",
    });
  }, [navigation, groupName]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMonthlySummary(groupId, year);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert("Error", e?.message ? String(e.message) : "Failed to load monthly summary.");
    } finally {
      setLoading(false);
    }
  }, [groupId, year]);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }: { item: MonthlySummaryRow }) => {
    const inTotal = Number(item.in_total) || 0;
    const net = Number(item.net) || 0;
    const tx = Number(item.tx_count) || 0;

    return (
      <View
        style={{
          padding: 14,
          borderWidth: 1,
          borderColor: "#eee",
          borderRadius: 12,
          backgroundColor: "#fff",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "800" }}>{monthLabel(item.month)}</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
          <View>
            <Text style={{ color: "#666" }}>In</Text>
            <Text style={{ fontSize: 16, fontWeight: "800" }}>{formatZAR(inTotal)}</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#666" }}>Transactions</Text>
            <Text style={{ fontSize: 16, fontWeight: "800" }}>{tx}</Text>
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "#666" }}>Net</Text>
          <Text style={{ fontSize: 16, fontWeight: "800", color: net >= 0 ? "green" : "red" }}>
            {formatZAR(net)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => setYear((y) => y - 1)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <Text style={{ fontWeight: "700" }}>Prev</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "900" }}>{year}</Text>

        <TouchableOpacity
          onPress={() => setYear((y) => Math.min(currentYear, y + 1))}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <Text style={{ fontWeight: "700" }}>Next</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(x) => x.month}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          <Text style={{ color: "#666", marginTop: 12 }}>
            {loading ? "Loading..." : "No data for this year yet."}
          </Text>
        }
      />
    </View>
  );
}

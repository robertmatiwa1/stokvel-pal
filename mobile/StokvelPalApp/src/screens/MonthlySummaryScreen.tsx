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
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: groupName ? `Monthly summary, ${groupName}` : "Monthly summary",
    });
  }, [navigation, groupName]);

  const fetchData = useCallback(async () => {
    try {
      const data = await getMonthlySummary(groupId, year);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert("Error", e?.message ? String(e.message) : "Failed to load monthly summary.");
      setRows([]);
    }
  }, [groupId, year]);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    load();
  }, [load]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => (b.month || "").localeCompare(a.month || ""));
  }, [rows]);

  const yearTotals = useMemo(() => {
    let inTotal = 0;
    let netTotal = 0;
    let txTotal = 0;

    for (const r of rows) {
      inTotal += Number(r.in_total) || 0;
      netTotal += Number(r.net) || 0;
      txTotal += Number(r.tx_count) || 0;
    }

    return { inTotal, netTotal, txTotal };
  }, [rows]);

  const renderHeader = () => {
    const hasData = sortedRows.length > 0;

    return (
      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#eee",
            borderRadius: 12,
            padding: 14,
            backgroundColor: "#fff",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "900", marginBottom: 10 }}>Year totals</Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: "#666" }}>In</Text>
              <Text style={{ fontSize: 16, fontWeight: "900" }}>{formatZAR(yearTotals.inTotal)}</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: "#666" }}>Transactions</Text>
              <Text style={{ fontSize: 16, fontWeight: "900" }}>{yearTotals.txTotal}</Text>
            </View>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "#666" }}>Net</Text>
            <Text style={{ fontSize: 16, fontWeight: "900", color: yearTotals.netTotal >= 0 ? "green" : "red" }}>
              {formatZAR(yearTotals.netTotal)}
            </Text>
          </View>
        </View>

        {!hasData ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              padding: 14,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "900", marginBottom: 6 }}>No activity for {year} yet</Text>
            <Text style={{ color: "#666", lineHeight: 18 }}>
              When members add contributions, you will see monthly totals here. Add a contribution, then pull down to refresh.
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 14, fontWeight: "900", marginTop: 4 }}>Months</Text>
        )}
      </View>
    );
  };

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
        <Text style={{ fontSize: 16, fontWeight: "900" }}>{monthLabel(item.month)}</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
          <View>
            <Text style={{ color: "#666" }}>In</Text>
            <Text style={{ fontSize: 16, fontWeight: "900" }}>{formatZAR(inTotal)}</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#666" }}>Transactions</Text>
            <Text style={{ fontSize: 16, fontWeight: "900" }}>{tx}</Text>
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "#666" }}>Net</Text>
          <Text style={{ fontSize: 16, fontWeight: "900", color: net >= 0 ? "green" : "red" }}>
            {formatZAR(net)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
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
          <Text style={{ fontWeight: "800" }}>Prev</Text>
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
            opacity: year >= currentYear ? 0.4 : 1,
          }}
          disabled={year >= currentYear}
        >
          <Text style={{ fontWeight: "800" }}>Next</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedRows}
        keyExtractor={(x) => x.month}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          loading ? <Text style={{ color: "#666", marginTop: 12 }}>Loading...</Text> : <View style={{ height: 8 }} />
        }
      />
    </View>
  );
}

import React, { useCallback, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { addContribution, listMembers } from "../api/endpoints";

type Props = NativeStackScreenProps<RootStackParamList, "AddContribution">;

export default function AddContributionScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;

  const [members, setMembers] = useState<{ user_id: string; username: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: groupName ? `Add contribution, ${groupName}` : "Add contribution" });
  }, [navigation, groupName]);

  const loadMembers = useCallback(async () => {
    try {
      const list = await listMembers(groupId);
      const mapped = (list ?? []).map((m: any) => ({
        user_id: m.user_id ?? m.id ?? m.userId,
        username: m.username ?? "",
      }));
      setMembers(mapped);
      if (mapped.length > 0) setSelectedUserId(mapped[0].user_id);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }, [groupId]);

  React.useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const submit = useCallback(async () => {
    const cleanAmount = Number(amount);

    if (!selectedUserId) {
      Alert.alert("Missing", "Please select a member");
      return;
    }

    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
      Alert.alert("Invalid amount", "Enter an amount greater than 0");
      return;
    }

    setSaving(true);
    try {
      await addContribution({
        group_id: groupId,
        user_id: selectedUserId,
        amount: cleanAmount,
        note: note.trim() ? note.trim() : undefined,
      });

      Alert.alert("Saved", "Contribution added");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }, [amount, groupId, note, navigation, selectedUserId]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: "700", marginBottom: 8 }}>Member</Text>
      <View style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        {members.length === 0 ? (
          <Text style={{ color: "#666" }}>No members found</Text>
        ) : (
          members.map((m) => (
            <TouchableOpacity
              key={m.user_id}
              onPress={() => setSelectedUserId(m.user_id)}
              style={{
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <Text style={{ fontWeight: selectedUserId === m.user_id ? "800" : "500" }}>
                {m.username || "Member"} {selectedUserId === m.user_id ? "✓" : ""}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <Text style={{ fontWeight: "700", marginBottom: 8 }}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="e.g. 150"
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}
      />

      <Text style={{ fontWeight: "700", marginBottom: 8 }}>Note (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="e.g. December contribution"
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}
      />

      <TouchableOpacity
        disabled={saving}
        onPress={submit}
        style={{ backgroundColor: "black", paddingVertical: 14, borderRadius: 12, opacity: saving ? 0.7 : 1 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "800" }}>
          {saving ? "Saving..." : "Save contribution"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

import React, { useCallback, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { addMember } from "../api/endpoints";

type Props = NativeStackScreenProps<RootStackParamList, "AddMember">;

export default function AddMemberScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: groupName ? `Add member, ${groupName}` : "Add member" });
  }, [navigation, groupName]);

  const submit = useCallback(async () => {
    const cleanUsername = username.trim();
    const cleanPhone = phone.trim();

    if (!cleanUsername) {
      Alert.alert("Missing info", "Please enter a username.");
      return;
    }

    if (!cleanPhone) {
      Alert.alert("Missing info", "Please enter a phone number.");
      return;
    }

    setSaving(true);
    try {
      const res: any = await addMember(groupId, cleanUsername, cleanPhone);

      if (res?.alreadyMember) {
        Alert.alert("Info", res?.message || "This user is already a member of this group.");
        return;
      }

      Alert.alert("Success", "Member added.");
      setUsername("");
      setPhone("");
      navigation.goBack();
    } catch (e: any) {
      const raw = e?.message ? String(e.message) : "Failed to add member.";
      const msg =
        raw.includes("403") || raw.toLowerCase().includes("permission")
          ? "Only admins can add members."
          : raw;

      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  }, [groupId, username, phone, navigation]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 6 }}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="e.g. tendai"
        autoCapitalize="none"
        style={{ borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 }}
      />

      <Text style={{ fontSize: 16, marginBottom: 6 }}>Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="e.g. 0710000001"
        keyboardType="phone-pad"
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <TouchableOpacity
        onPress={submit}
        disabled={saving}
        style={{
          marginTop: 16,
          padding: 14,
          borderWidth: 1,
          borderRadius: 12,
          alignItems: "center",
          opacity: saving ? 0.6 : 1,
        }}
      >
        <Text>{saving ? "Saving..." : "Add member"}</Text>
      </TouchableOpacity>
    </View>
  );
}

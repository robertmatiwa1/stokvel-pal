import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { createGroup } from "../api/endpoints";

type Props = NativeStackScreenProps<RootStackParamList, "CreateGroup">;

export default function CreateGroupScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Missing info", "Group name is required.");
      return;
    }

    setLoading(true);
    try {
      await createGroup(name.trim(), description.trim() || undefined);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Create failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text>Group name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Khayelitsha Savings"
        style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 }}
      />

      <Text>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Monthly contribution stokvel"
        style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 16 }}
      />

      <TouchableOpacity
        onPress={onCreate}
        disabled={loading}
        style={{ padding: 14, borderRadius: 8, borderWidth: 1, alignItems: "center" }}
      >
        <Text>{loading ? "Creating..." : "Create"}</Text>
      </TouchableOpacity>
    </View>
  );
}

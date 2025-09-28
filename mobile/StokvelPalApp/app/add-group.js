import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useState, useContext } from 'react';
import { AppContext } from './context/AppContext';
import { useRouter } from 'expo-router';
import uuid from 'react-native-uuid'; // To generate unique IDs

export default function AddGroup() {
  const { groups, setGroups } = useContext(AppContext);
  const router = useRouter();

  const [groupName, setGroupName] = useState('');
  const [contribution, setContribution] = useState('');

  const handleAddGroup = () => {
    if (!groupName || !contribution) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    const newGroup = {
      id: uuid.v4(), // generate unique ID
      name: groupName,
      contribution: `R${contribution}`,
    };

    setGroups([...groups, newGroup]);
    Alert.alert('Success', `Group "${groupName}" added!`, [
      { text: 'OK', onPress: () => router.replace('/groups') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Group</Text>

      <TextInput
        style={styles.input}
        placeholder="Group Name"
        value={groupName}
        onChangeText={setGroupName}
      />

      <TextInput
        style={styles.input}
        placeholder="Initial Contribution (R)"
        keyboardType="numeric"
        value={contribution}
        onChangeText={setContribution}
      />

      <Button title="Add Group" onPress={handleAddGroup} />
      <Button title="Cancel" color="#E53935" onPress={() => router.replace('/groups')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
});

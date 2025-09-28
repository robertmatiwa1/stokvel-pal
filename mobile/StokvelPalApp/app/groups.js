import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';

// Dummy data for groups
const dummyGroups = [
  { id: '1', name: 'Family Stokvel', contribution: 'R500' },
  { id: '2', name: 'Friends Stokvel', contribution: 'R300' },
  { id: '3', name: 'Community Stokvel', contribution: 'R150' },
];

export default function GroupList() {
  const { user } = useContext(AppContext);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Stokvel Groups</Text>

      <FlatList
        data={dummyGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupCard}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupContribution}>Contribution: {item.contribution}</Text>
            <Button
              title="View Transactions"
              onPress={() => alert(`Transactions for ${item.name} coming soon!`)}
            />
          </View>
        )}
      />

      	<Button
  	title="Add New Group"
  	onPress={() => router.push('/add-group')}
  	color="#1E88E5"
	/>
	<Button
        title="Back to Dashboard"
        onPress={() => router.replace('/dashboard')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  groupCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
  },
  groupName: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
  groupContribution: { fontSize: 16, marginBottom: 10 },
});

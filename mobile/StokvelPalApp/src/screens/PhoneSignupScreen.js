import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function PhoneSignupScreen() {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleContinue = () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Phone number required", "Please enter your phone number to continue");
      return;
    }

    navigation.navigate("Dashboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="+27 000 000 000"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <Button title="Continue" onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
});

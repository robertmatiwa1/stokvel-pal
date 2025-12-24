import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import GroupsScreen from "../screens/GroupsScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import GroupDetailsScreen from "../screens/GroupDetailsScreen";
import AddMemberScreen from "../screens/AddMemberScreen";
import { useAuth } from "../context/AuthContext";
import { setOnUnauthorized } from "../api/authEvents";
import ContributionsScreen from "../screens/ContributionsScreen";
import AddContributionScreen from "../screens/AddContributionScreen";
import MonthlySummaryScreen from "../screens/MonthlySummaryScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Groups: undefined;
  CreateGroup: undefined;
  GroupDetails: { groupId: string; groupName?: string };
  AddMember: { groupId: string; groupName?: string };
  Contributions: { groupId: string; groupName?: string };
  AddContribution: { groupId: string; groupName?: string };
  MonthlySummary: { groupId: string; groupName?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Groups" component={GroupsScreen} options={{ title: "Groups" }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: "Create group" }} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} options={{ title: "Group details" }} />
      <Stack.Screen name="Contributions" component={ContributionsScreen} />
      <Stack.Screen name="AddContribution" component={AddContributionScreen} />
      <Stack.Screen name="AddMember" component={AddMemberScreen} options={{ title: "Add member" }} />
      <Stack.Screen name="MonthlySummary" component={MonthlySummaryScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isReady, setTokenUnsafe } = useAuth();

  useEffect(() => {
    setOnUnauthorized(() => {
      setTokenUnsafe(null);
    });

    return () => {
      setOnUnauthorized(null);
    };
  }, [setTokenUnsafe]);

  if (!isReady) return <Splash />;

  return <NavigationContainer>{token ? <AppStack /> : <AuthStack />}</NavigationContainer>;
}

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import PhoneSignupScreen from "./src/screens/PhoneSignupScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import Dashboard from "./src/screens/Dashboard";
import BookingScreen from "./src/screens/BookingScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="PhoneSignup" component={PhoneSignupScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Booking" component={BookingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

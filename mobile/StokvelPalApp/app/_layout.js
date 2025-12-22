import React from "react";
import { Stack } from "expo-router";
import AppProvider from "../src/context/AppContext";

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1f6feb" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
    </AppProvider>
  );
}

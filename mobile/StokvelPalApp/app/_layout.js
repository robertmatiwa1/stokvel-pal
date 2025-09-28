import AppProvider from './context/AppContext';
import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <AppProvider>
      <Slot />
    </AppProvider>
  );
}

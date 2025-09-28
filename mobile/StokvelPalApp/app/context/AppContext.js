import { createContext, useState } from 'react';

export const AppContext = createContext();

export default function AppProvider({ children }) {
  const [user, setUser] = useState({
    phone: '',
    isVerified: false,
  });

  const [groups, setGroups] = useState([
    // Initial dummy data
    { id: '1', name: 'Family Stokvel', contribution: 'R500' },
    { id: '2', name: 'Friends Stokvel', contribution: 'R300' },
    { id: '3', name: 'Community Stokvel', contribution: 'R150' },
  ]);

  return (
    <AppContext.Provider value={{ user, setUser, groups, setGroups }}>
      {children}
    </AppContext.Provider>
  );
}

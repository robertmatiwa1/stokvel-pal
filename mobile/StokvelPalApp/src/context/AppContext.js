import { createContext, useState } from 'react';

export const AppContext = createContext();

export default function AppProvider({ children }) {
  const [user, setUser] = useState({
    phone: '',
    isVerified: false,
  });

  const [groups, setGroups] = useState([
    { id: '1', name: 'Family Stokvel', contribution: 500 },
    { id: '2', name: 'Friends Stokvel', contribution: 300 },
    { id: '3', name: 'Community Stokvel', contribution: 150 },
  ]);

  const [transactions, setTransactions] = useState([
    // { id: 't1', groupId: '1', amount: 500, date: '2025-09-28' }
  ]);

  return (
    <AppContext.Provider value={{ user, setUser, groups, setGroups, transactions, setTransactions }}>
      {children}
    </AppContext.Provider>
  );
}

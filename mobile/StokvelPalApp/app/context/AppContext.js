import { createContext, useState } from 'react';

export const AppContext = createContext();

export default function AppProvider({ children }) {
  const [user, setUser] = useState({ phone: '', isVerified: false });
  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  );
}

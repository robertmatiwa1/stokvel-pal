import React, { createContext, useMemo, useState } from "react";

export const AppContext = createContext(null);

export default function AppProvider({ children }) {
  const [user, setUser] = useState({
    phone: "",
    isVerified: false,
  });

  const [groups, setGroups] = useState([
    { id: "1", name: "Family Stokvel", contribution: 500 },
    { id: "2", name: "Friends Stokvel", contribution: 300 },
    { id: "3", name: "Community Stokvel", contribution: 150 },
  ]);

  const [transactions, setTransactions] = useState([]);

  const setPhone = (phone) => {
    setUser((prev) => ({ ...prev, phone }));
  };

  const verifyUser = () => {
    setUser((prev) => ({ ...prev, isVerified: true }));
  };

  const logout = () => {
    setUser({ phone: "", isVerified: false });
  };

  const addGroup = ({ name, contribution }) => {
    const id = Date.now().toString();
    setGroups((prev) => [...prev, { id, name, contribution }]);
  };

  const addTransaction = ({ groupId, amount }) => {
    const id = Date.now().toString();
    const date = new Date().toISOString().slice(0, 10);
    setTransactions((prev) => [...prev, { id, groupId, amount, date }]);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      setPhone,
      verifyUser,
      logout,
      groups,
      setGroups,
      addGroup,
      transactions,
      setTransactions,
      addTransaction,
    }),
    [user, groups, transactions]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

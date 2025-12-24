import React, { createContext, useEffect, useMemo, useState } from "react";
import { saveItem, getItem, deleteItem } from "../services/SecureStorage";

export const AppContext = createContext(null);

const STORAGE_KEYS = {
  USER: "stokvel_user",
  GROUPS: "stokvel_groups",
  TRANSACTIONS: "stokvel_transactions",
};

export default function AppProvider({ children }) {
  const [hydrating, setHydrating] = useState(true);

  const [user, setUser] = useState({
    phone: "",
    isVerified: false,
  });

  const [groups, setGroups] = useState([]);
  const [transactions, setTransactions] = useState([]);

  /* =========================
     Load persisted state
     ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        const savedUser = await getItem(STORAGE_KEYS.USER);
        const savedGroups = await getItem(STORAGE_KEYS.GROUPS);
        const savedTransactions = await getItem(STORAGE_KEYS.TRANSACTIONS);

        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedGroups) setGroups(JSON.parse(savedGroups));
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      } catch (e) {
        console.warn("Failed to hydrate app state", e);
      } finally {
        setHydrating(false);
      }
    };

    load();
  }, []);

  /* =========================
     Persist on change
     ========================= */
  useEffect(() => {
    if (!hydrating) {
      saveItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }, [user, hydrating]);

  useEffect(() => {
    if (!hydrating) {
      saveItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    }
  }, [groups, hydrating]);

  useEffect(() => {
    if (!hydrating) {
      saveItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
  }, [transactions, hydrating]);

  /* =========================
     Actions
     ========================= */
  const setPhone = (phone) => {
    setUser((prev) => ({ ...prev, phone }));
  };

  const verifyUser = () => {
    setUser((prev) => ({ ...prev, isVerified: true }));
  };

  const logout = async () => {
    await deleteItem(STORAGE_KEYS.USER);
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
      hydrating,
      user,
      setPhone,
      verifyUser,
      logout,
      groups,
      addGroup,
      transactions,
      addTransaction,
    }),
    [hydrating, user, groups, transactions]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

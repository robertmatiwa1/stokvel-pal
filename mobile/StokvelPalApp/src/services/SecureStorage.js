import * as SecureStore from 'expo-secure-store';

export const saveItem = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.error('SecureStorage save error:', e);
    throw e;
  }
};

export const getItem = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.error('SecureStorage get error:', e);
    throw e;
  }
};

export const deleteItem = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (e) {
    console.error('SecureStorage delete error:', e);
    throw e;
  }
};

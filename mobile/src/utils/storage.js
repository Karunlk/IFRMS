import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const storage = {
  async getToken() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
  },

  async setToken(token) {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getUser() {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async setUser(user) {
    if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async clear() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};

import API from '../utils/api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const getStorage = () => sessionStorage;

const migrateLegacyAuthIfNeeded = () => {
  const storage = getStorage();
  if (!storage.getItem(TOKEN_KEY)) {
    const legacyToken = localStorage.getItem(TOKEN_KEY);
    if (legacyToken) {
      storage.setItem(TOKEN_KEY, legacyToken);
    }
  }

  if (!storage.getItem(USER_KEY)) {
    const legacyUser = localStorage.getItem(USER_KEY);
    if (legacyUser) {
      storage.setItem(USER_KEY, legacyUser);
    }
  }
};

const authService = {
  login: (credentials) => API.post('/api/auth/login', credentials),

  logout: () => {
    const storage = getStorage();
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: () => {
    migrateLegacyAuthIfNeeded();
    const user = getStorage().getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    migrateLegacyAuthIfNeeded();
    return !!getStorage().getItem(TOKEN_KEY);
  },

  getToken: () => {
    migrateLegacyAuthIfNeeded();
    return getStorage().getItem(TOKEN_KEY);
  },

  setSession: (token, user) => {
    const storage = getStorage();
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));

    // Ensure old cross-tab session does not override current tab.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  },
};

export default authService;

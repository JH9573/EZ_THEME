import { pinia, useAuthStore, useThemeStore, useAppStore } from '@/stores';

const getStores = () => ({
  auth: useAuthStore(pinia),
  theme: useThemeStore(pinia),
  app: useAppStore(pinia)
});

const clearBrowserAuthState = () => {
  window.isUserLoggedIn = false;
  window.authDataInStorage = null;
  window.authCookieFailure = false;

  [
    'token',
    'auth_data',
    'cookie_auth_data',
    'userInfo',
    'is_admin',
    'vuex',
    'user',
    'auth'
  ].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  ['auth_data', 'XSRF-TOKEN', 'laravel_session', 'token'].forEach(name => {
    ['/', '/dashboard', '/user', '/admin'].forEach(path => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    });
  });
};

const legacyStore = {
  get state() {
    const { auth, theme, app } = getStores();
    return {
      user: auth.user,
      token: auth.token,
      theme: theme.theme,
      loading: app.loading,
      error: app.error
    };
  },
  get getters() {
    const { auth, theme } = getStores();
    return {
      isLoggedIn: auth.isLoggedIn,
      userInfo: auth.userInfo,
      currentTheme: theme.currentTheme,
      isDarkTheme: theme.isDarkTheme
    };
  },
  commit(type, payload) {
    const { auth, theme, app } = getStores();
    const mutations = {
      SET_USER: () => auth.setUser(payload),
      SET_TOKEN: () => auth.setToken(payload),
      CLEAR_USER: () => auth.clearUser(),
      SET_THEME: () => theme.setTheme(payload),
      SET_LOADING: () => app.setLoading(payload),
      SET_ERROR: () => app.setError(payload)
    };

    if (mutations[type]) {
      mutations[type]();
    }
  },
  dispatch(type, payload) {
    const { auth, theme } = getStores();
    const actions = {
      login: () => auth.setToken(payload),
      logout: async () => {
        auth.clearUser();
        clearBrowserAuthState();
      },
      setUser: () => auth.setUser(payload),
      toggleTheme: () => theme.toggleTheme(),
      initUserInfo: () => auth.initUserInfo()
    };

    if (actions[type]) {
      return actions[type]();
    }

    return undefined;
  }
};

export default legacyStore;

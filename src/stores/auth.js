import { defineStore } from 'pinia';

const readStoredUser = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) return null;

  try {
    return JSON.parse(userInfo);
  } catch (err) {
    localStorage.removeItem('userInfo');
    return null;
  }
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: readStoredUser(),
    token: localStorage.getItem('token') || ''
  }),
  getters: {
    isLoggedIn: state => !!state.token,
    userInfo: state => state.user
  },
  actions: {
    setToken(token) {
      this.token = token || '';
      if (this.token) {
        localStorage.setItem('token', this.token);
      } else {
        localStorage.removeItem('token');
      }
    },
    setUser(user) {
      this.user = user;
      if (user) {
        localStorage.setItem('userInfo', JSON.stringify(user));
      } else {
        localStorage.removeItem('userInfo');
      }
    },
    clearUser() {
      this.user = null;
      this.token = '';
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
    initUserInfo() {
      this.user = readStoredUser();
    }
  }
});

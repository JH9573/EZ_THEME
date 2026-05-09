import { defineStore } from 'pinia';
import { THEME_CONFIG } from '@/utils/baseConfig';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('theme') || THEME_CONFIG.defaultTheme
  }),
  getters: {
    currentTheme: state => state.theme,
    isDarkTheme: state => state.theme === 'dark'
  },
  actions: {
    setTheme(theme) {
      this.theme = theme;
      localStorage.setItem('theme', theme);
    },
    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    }
  }
});

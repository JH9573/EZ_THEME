import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    error: null
  }),
  actions: {
    setLoading(status) {
      this.loading = status;
    },
    setError(error) {
      this.error = error;
    }
  }
});

import { checkLoginStatus } from '@/api/auth';
import { reloadMessages } from '@/i18n';

let lastLoginState = null;

export const checkAuthAndReloadMessages = () => {
  const isLoggedIn = checkLoginStatus();

  if (lastLoginState === null || lastLoginState !== isLoggedIn) {
    lastLoginState = isLoggedIn;

    try {
      setTimeout(async () => {
        try {
          await reloadMessages();
        } catch (asyncError) {
        }
      }, 10);
    } catch (error) {
    }
  }

  return isLoggedIn;
};

export const isAuthPage = (path) => {
  return /\/(login|register|forgot-password)/.test(path);
};

export const setupLoginStateWatcher = () => {
  let lastLoginState = null;

  setInterval(() => {
    const isLoggedIn = checkLoginStatus();

    if (lastLoginState !== null && lastLoginState !== isLoggedIn) {
      reloadMessages().catch(() => {
      });
    }

    lastLoginState = isLoggedIn;
  }, 60000);
};

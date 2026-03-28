// src/lib/utils/telegram.ts

export const getTelegramUser = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        if (webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
            return webApp.initDataUnsafe.user;
        }
    }
    return null;
};

export const expandTelegramWebApp = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
    }
};

export const readyTelegramWebApp = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
    }
};

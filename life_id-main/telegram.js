// telegram.js - Telegram Mini App Bridge
class TelegramMiniApp {
  init() {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      console.log('Telegram WebApp initialized:', tg.initDataUnsafe);

      if (tg.themeParams && tg.themeParams.bg_color) {
        document.documentElement.style.setProperty('--bg', tg.themeParams.bg_color);
        document.documentElement.style.setProperty('--surface', tg.themeParams.secondary_bg_color || '#ffffff');
      }

      tg.MainButton.text = "LifeID: Portalga kirish";
      tg.MainButton.onClick(() => {
        alert("Telegram Mini App orqali tasdiqlandi!");
      });

      return tg;
    }
    return null;
  }
}

window.TelegramBridge = new TelegramMiniApp();

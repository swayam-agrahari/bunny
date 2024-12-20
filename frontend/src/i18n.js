import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../src/i18n/en.json";

// Initialize with default English messages in case of error
const resources = { en: { translation: en } };

// Dynamically load all other messages
async function loadMessages() {
  try {
    const modules = import.meta.glob("./i18n/*.json");
    await Promise.all(
      Object.entries(modules).map(async ([path, importFn]) => {
        const lang = path.replace("./i18n/", "").replace(".json", "");
        if (lang !== "en" && lang !== "qqq") {
          const module = await importFn();
          resources[lang] = { translation: module.default };
        }
      })
    );
  } catch (error) {
    console.error("Error loading i18n messages:", error);
  }
}

// Initialize i18n instance
async function initializeI18n() {
  try {
    await loadMessages();
  } catch (error) {
    console.error("Error initializing i18n:", error);
  }

  i18n.use(initReactI18next).init({
    resources,
    fallbackLng: "en",
    supportedLngs: Object.keys(resources),
    lng: "en",
  });

  return i18n;
}

export default initializeI18n;

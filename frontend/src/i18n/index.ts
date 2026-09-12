import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import fr from "./locales/fr.json";

/**
 * The frontend half of the localization setup. The backend already localizes everything
 * it owns - error messages and validation failures resolved through MessageSource - so
 * this bundle only holds text the server never sees: labels, buttons, placeholders.
 *
 * Keep this list in step with LocaleConfig#localeResolver on the backend, which declares
 * the same two supported locales and the same English default.
 */
export const SUPPORTED_LANGUAGES = ["en", "fr"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Where the detector persists the user's choice, so it survives a reload. */
export const LANGUAGE_STORAGE_KEY = "app-language";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES,
    // 'fr-CA' from the browser resolves to our 'fr' bundle instead of falling back to English.
    nonExplicitSupportedLngs: true,
    // React escapes interpolated values already; escaping twice mangles apostrophes.
    interpolation: { escapeValue: false },
    detection: {
      // An explicit choice wins over the browser's preference, which is only the first guess.
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
  });

/**
 * The language actually in use, narrowed to a locale we support. `resolvedLanguage` is what
 * i18next settled on after the fallback chain, so 'fr-CA' arrives here as 'fr' - which is
 * also what the Accept-Language header should carry.
 */
export const currentLanguage = (): SupportedLanguage =>
  (i18n.resolvedLanguage ?? "en") as SupportedLanguage;

// Screen readers and browser translation prompts read <html lang>, so keep it in sync.
const syncHtmlLang = () => {
  document.documentElement.lang = currentLanguage();
};

syncHtmlLang();
i18n.on("languageChanged", syncHtmlLang);

export default i18n;

import "i18next";

import type en from "@/i18n/locales/en.json";

/**
 * Types `t()` against the English bundle, so a key that does not exist is a compile error
 * rather than a string that silently renders as its own key at runtime.
 *
 * English is the source of truth here: `fr.json` is a translation of it, and adding a key
 * to `en.json` is what makes it available to `t()`.
 */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof en;
    };
  }
}

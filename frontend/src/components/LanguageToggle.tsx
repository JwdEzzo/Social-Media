import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";
import { resetAllApiState, type AppDispatch } from "@/store/store";

/**
 * Languages are listed by their own name (an autonym) rather than translated, so someone who
 * landed on the wrong language can still recognise theirs.
 */
const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: "English",
  fr: "Français",
};

export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const changeLanguage = async (language: SupportedLanguage) => {
    if (language === i18n.resolvedLanguage) return;

    // The detector persists the choice, and every later request carries it as Accept-Language.
    await i18n.changeLanguage(language);
    dispatch(resetAllApiState());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("common.language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-gray-800">
        {SUPPORTED_LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language}
            onClick={() => changeLanguage(language)}
            className="dark:hover:bg-gray-700"
          >
            {LANGUAGE_NAMES[language]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

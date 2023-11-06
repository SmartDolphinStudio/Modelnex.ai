import { clientGuideFor } from "./clientGuides";
import { demoGuideFor } from "./demoGuide";
import type { Language } from "./contentTypes";
import {
  productIntroductionFor,
  type DocumentBlock,
} from "./productIntroduction";
import { serviceGuideFor } from "./serviceGuides";
import { serviceScopeFor } from "./serviceScope";
import { operationalGuideFor } from "./operationalGuides";
import { serviceRuleGuideFor } from "./serviceRulesGuides";

export type DocContent = {
  intro: string;
  paragraphs: string[];
  table: string[][];
  code: string;
  figure: string;
  review?: boolean;
  warning: string;
  codeFile: string;
  codeLanguage: string;
  invoicePreview?: boolean;
  blocks?: DocumentBlock[];
};

const documentFromBlocks = (
  intro: string,
  blocks: DocumentBlock[],
  codeLanguage: string,
  warning = "",
): DocContent => ({
  intro,
  paragraphs: [],
  table: [],
  code: "",
  figure: "",
  warning,
  codeFile: "",
  codeLanguage,
  blocks,
});

const sourceLanguageWarning = (language: Language): string => {
  if (language === "zh-CN") return "";
  return {
    en: "This page is currently maintained as the official Simplified Chinese source text. Other language versions are being reviewed; the interface and search remain available in the selected language.",
    "zh-TW": "本頁目前以簡體中文正式原文維護；其他語言版本正在校對，介面與搜尋仍會依所選語言顯示。",
    de: "Diese Seite wird derzeit als offizieller Ausgangstext in vereinfachtem Chinesisch gepflegt. Andere Sprachversionen werden geprüft; Oberfläche und Suche bleiben in der ausgewählten Sprache verfügbar.",
    nl: "Deze pagina wordt momenteel onderhouden als de officiële brontekst in vereenvoudigd Chinees. Andere taalversies worden nagekeken; de interface en zoekfunctie blijven beschikbaar in de gekozen taal.",
  }[language];
};

const developmentContent = (language: Language): DocContent => {
  const copy: Record<Language, { heading: string; body: string }> = {
    en: {
      heading: "Documentation in development",
      body: "This section is currently under development. Please check back later.",
    },
    "zh-CN": {
      heading: "文档正在开发中",
      body: "本章节当前正在开发中，请稍后再试。",
    },
    "zh-TW": {
      heading: "文件正在開發中",
      body: "本章節目前正在開發中，請稍後再試。",
    },
    de: {
      heading: "Dokumentation in Entwicklung",
      body: "Dieser Abschnitt befindet sich derzeit in Entwicklung. Bitte versuchen Sie es später erneut.",
    },
    nl: {
      heading: "Documentatie in ontwikkeling",
      body: "Dit gedeelte is momenteel in ontwikkeling. Probeer het later opnieuw.",
    },
  };
  const value = copy[language];
  return documentFromBlocks(
    "",
    [
      { type: "heading", id: "development-status", text: value.heading },
      { type: "paragraph", text: value.body },
    ],
    value.heading,
  );
};

export function contentFor(
  id: string,
  _title: string,
  language: Language,
): DocContent {
  const productIntroduction = productIntroductionFor(id, language);
  if (productIntroduction) {
    return documentFromBlocks(
      productIntroduction.intro,
      productIntroduction.blocks,
      "产品介绍",
    );
  }

  const serviceScope = serviceScopeFor(id);
  if (serviceScope) {
    return documentFromBlocks(
      serviceScope.intro,
      serviceScope.blocks,
      "服务范围",
      sourceLanguageWarning(language),
    );
  }

  const serviceGuide = serviceGuideFor(id);
  if (serviceGuide) {
    return documentFromBlocks(
      serviceGuide.intro,
      serviceGuide.blocks,
      "产品与服务",
      sourceLanguageWarning(language),
    );
  }

  const clientGuide = clientGuideFor(id, language);
  if (clientGuide) {
    return documentFromBlocks(clientGuide.intro, clientGuide.blocks, "客户端");
  }

  const operationalGuide = operationalGuideFor(id);
  if (operationalGuide) {
    return documentFromBlocks(
      operationalGuide.intro,
      operationalGuide.blocks,
      "产品与服务",
      sourceLanguageWarning(language),
    );
  }

  const serviceRuleGuide = serviceRuleGuideFor(id);
  if (serviceRuleGuide) {
    return documentFromBlocks(
      serviceRuleGuide.intro,
      serviceRuleGuide.blocks,
      "服务规则",
      sourceLanguageWarning(language),
    );
  }

  const demoGuide = demoGuideFor(id, language);
  if (demoGuide) {
    return documentFromBlocks(
      demoGuide.intro,
      demoGuide.blocks,
      demoGuide.codeLanguage,
      demoGuide.warning,
    );
  }

  return developmentContent(language);
}

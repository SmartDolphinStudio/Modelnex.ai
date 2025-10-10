import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Globe2,
  Menu,
  Search,
  X,
} from "lucide-react";
import "./docs.css";
import { contentFor } from "./content";
import type { Language } from "./contentTypes";
import { sections as directorySections } from "./navigation";
import type { DocumentBlock } from "./productIntroduction";

const StandardChart = lazy(() =>
  import("./StandardVisuals").then((module) => ({ default: module.StandardChart })),
);
const StandardFormula = lazy(() =>
  import("./StandardVisuals").then((module) => ({ default: module.StandardFormula })),
);
const MermaidFlow = lazy(() =>
  import("./StandardVisuals").then((module) => ({ default: module.MermaidFlow })),
);

type Section = {
  id: string;
  title: Record<Language, string>;
  children?: Section[];
};
const text = {
  en: {
    language: "English",
    search: "Search docs",
    empty: "No matching documents",
    toc: "On this page",
    placeholder: "Placeholder",
    result: "Search results",
    document: "Document",
    reportStatus: "Current status",
    signedIn: "Signed in to this documentation site",
    signedOut: "Not signed in",
    reportAnonymous: "Submit anonymously",
    reportAccount: "Open account center",
    reportTitle: "Report title",
    reportDetails: "Describe the issue and the expected correction",
    reportSubmit: "Submit report",
    reportCancel: "Cancel",
    reportSent: "Your report has been received.",
    reportFailed: "The report could not be sent. Please try again later.",
    reportNotice: "Anonymous reports do not contain account information or attachments.",
    characters: "characters",
    loadingChart: "Loading chart...",
    loadingFormula: "Loading formula...",
    loadingDiagram: "Loading diagram...",
    primary: "Primary",
    secondary: "Secondary",
    review: "This page contains draft legal content. Qualified legal review is required before it becomes a formal policy or legal commitment.",
    scope: "Scope and usage notes",
    reference: "Reference information",
    example: "Example",
    receiptTitle: "Demonstration receipt template",
    receiptDescription: "This visual is a sample layout only. It is not a payment request, tax document, receipt, contract, or proof of service.",
    receiptAlt: "ModelNex.AI demonstration receipt template, marked not valid",
  },
  "zh-CN": {
    language: "简体中文",
    search: "搜索文档",
    empty: "没有匹配的文档",
    toc: "本页内容",
    placeholder: "占位符",
    result: "搜索结果",
    document: "文档",
    reportStatus: "当前状态",
    signedIn: "已登录文档站账户",
    signedOut: "未登录",
    reportAnonymous: "匿名提交",
    reportAccount: "前往账户中心",
    reportTitle: "错误标题",
    reportDetails: "请说明问题位置、现象和期望的修正方式",
    reportSubmit: "提交报告",
    reportCancel: "取消",
    reportSent: "错误报告已提交。",
    reportFailed: "报告未能提交，请稍后重试。",
    reportNotice: "匿名报告不包含账户信息或附件。",
    characters: "字",
    loadingChart: "正在加载图表...",
    loadingFormula: "正在加载公式...",
    loadingDiagram: "正在加载框架图...",
    primary: "主数据",
    secondary: "对照数据",
    review: "本页包含法律草案内容；在成为正式政策或法律承诺前，必须经过具备资格的法律审阅。",
    scope: "适用范围与使用说明",
    reference: "参考信息",
    example: "示例",
    receiptTitle: "收据模板展示",
    receiptDescription: "此视觉稿仅用于展示排版，不是付款请求、税务文件、收据、合同或服务凭证。",
    receiptAlt: "ModelNex.AI 收据模板展示，已标明不具效力",
  },
  "zh-TW": {
    language: "繁體中文",
    search: "搜尋文件",
    empty: "沒有相符的文件",
    toc: "本頁內容",
    placeholder: "占位符",
    result: "搜尋結果",
    document: "文件",
    reportStatus: "目前狀態",
    signedIn: "已登入文件站帳戶",
    signedOut: "未登入",
    reportAnonymous: "匿名提交",
    reportAccount: "前往帳戶中心",
    reportTitle: "錯誤標題",
    reportDetails: "請說明問題位置、現象和預期的修正方式",
    reportSubmit: "提交報告",
    reportCancel: "取消",
    reportSent: "錯誤報告已提交。",
    reportFailed: "報告未能提交，請稍後再試。",
    reportNotice: "匿名報告不包含帳戶資訊或附件。",
    characters: "字",
    loadingChart: "正在載入圖表...",
    loadingFormula: "正在載入公式...",
    loadingDiagram: "正在載入框架圖...",
    primary: "主要資料",
    secondary: "對照資料",
    review: "本頁包含法律草案內容；在成為正式政策或法律承諾前，必須經過具備資格的法律審閱。",
    scope: "適用範圍與使用說明",
    reference: "參考資訊",
    example: "範例",
    receiptTitle: "收據範本展示",
    receiptDescription: "此視覺稿僅用於展示排版，不是付款請求、稅務文件、收據、合約或服務憑證。",
    receiptAlt: "ModelNex.AI 收據範本展示，已標明不具效力",
  },
  de: {
    language: "Deutsch",
    search: "Dokumentation durchsuchen",
    empty: "Keine passenden Dokumente",
    toc: "Auf dieser Seite",
    placeholder: "Platzhalter",
    result: "Suchergebnisse",
    document: "Dokument",
    reportStatus: "Aktueller Status",
    signedIn: "In dieser Dokumentationsseite angemeldet",
    signedOut: "Nicht angemeldet",
    reportAnonymous: "Anonym senden",
    reportAccount: "Kontobereich öffnen",
    reportTitle: "Titel des Berichts",
    reportDetails: "Beschreiben Sie das Problem und die erwartete Korrektur",
    reportSubmit: "Bericht senden",
    reportCancel: "Abbrechen",
    reportSent: "Ihr Bericht ist eingegangen.",
    reportFailed: "Der Bericht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
    reportNotice: "Anonyme Berichte enthalten keine Kontoinformationen oder Anhänge.",
    characters: "Zeichen",
    loadingChart: "Diagramm wird geladen...",
    loadingFormula: "Formel wird geladen...",
    loadingDiagram: "Diagramm wird geladen...",
    primary: "Primärdaten",
    secondary: "Vergleichsdaten",
    review: "Diese Seite enthält einen rechtlichen Entwurf. Vor einer verbindlichen Verwendung ist eine qualifizierte rechtliche Prüfung erforderlich.",
    scope: "Geltungsbereich und Nutzungshinweise",
    reference: "Referenzinformationen",
    example: "Beispiel",
    receiptTitle: "Demo-Belegvorlage",
    receiptDescription: "Diese Darstellung ist nur ein Layoutbeispiel. Sie ist keine Zahlungsaufforderung, Steuerunterlage, Quittung, Vertrag oder Leistungsnachweis.",
    receiptAlt: "ModelNex.AI Demo-Belegvorlage, als ungültig gekennzeichnet",
  },
  nl: {
    language: "Nederlands",
    search: "Documentatie doorzoeken",
    empty: "Geen overeenkomende documenten",
    toc: "Op deze pagina",
    placeholder: "Tijdelijke aanduiding",
    result: "Zoekresultaten",
    document: "Document",
    reportStatus: "Huidige status",
    signedIn: "Aangemeld bij deze documentatiesite",
    signedOut: "Niet aangemeld",
    reportAnonymous: "Anoniem verzenden",
    reportAccount: "Accountcentrum openen",
    reportTitle: "Titel van het rapport",
    reportDetails: "Beschrijf het probleem en de gewenste correctie",
    reportSubmit: "Rapport verzenden",
    reportCancel: "Annuleren",
    reportSent: "Uw rapport is ontvangen.",
    reportFailed: "Het rapport kon niet worden verzonden. Probeer het later opnieuw.",
    reportNotice: "Anonieme rapporten bevatten geen accountgegevens of bijlagen.",
    characters: "tekens",
    loadingChart: "Grafiek wordt geladen...",
    loadingFormula: "Formule wordt geladen...",
    loadingDiagram: "Diagram wordt geladen...",
    primary: "Primaire gegevens",
    secondary: "Vergelijkingsgegevens",
    review: "Deze pagina bevat een juridisch concept. Een gekwalificeerde juridische beoordeling is vereist voordat de tekst een formeel beleid of een juridische toezegging wordt.",
    scope: "Toepassingsgebied en gebruiksnotities",
    reference: "Referentie-informatie",
    example: "Voorbeeld",
    receiptTitle: "Voorbeeld van een ontvangstbewijs",
    receiptDescription: "Deze weergave is alleen een lay-outvoorbeeld. Het is geen betalingsverzoek, belastingdocument, ontvangstbewijs, contract of bewijs van dienstverlening.",
    receiptAlt: "ModelNex.AI-voorbeeld van een ontvangstbewijs, gemarkeerd als ongeldig",
  },
} as const;
const sections: Section[] = directorySections;

const browserDefaultLanguage = (): Language => {
  const language = navigator.language.toLocaleLowerCase();
  if (language.startsWith("zh-tw") || language.startsWith("zh-hk")) return "zh-TW";
  if (language.startsWith("zh")) return "zh-CN";
  if (language.startsWith("de")) return "de";
  if (language.startsWith("nl")) return "nl";
  return "en";
};

const flatten = (items: Section[]): Section[] =>
  items.flatMap((item) => [
    item,
    ...(item.children ? flatten(item.children) : []),
  ]);

const documentedLeaves = (items: Section[]): Section[] =>
  items.flatMap((item) =>
    item.children ? documentedLeaves(item.children) : [item],
  );

const documents = documentedLeaves(sections);
const documentIds = new Set(documents.map((item) => item.id));
const aggregateDocumentIds = new Set([
  "service-model",
  "supported-platforms",
  "service-availability",
  "service-limitations",
  "user-responsibilities",
  "account",
]);
const isDocument = (item: Section) =>
  documentIds.has(item.id) || aggregateDocumentIds.has(item.id);
const searchableBlockText = (block: DocumentBlock): string[] => {
  if (block.type === "list") return block.items;
  if (block.type === "diagram") return [block.title, ...block.nodes];
  if (block.type === "flow") {
    return [block.title, ...block.nodes.flatMap((node) => [node.label, node.detail])];
  }
  if (block.type === "matrix") return [...block.headers, ...block.rows.flat()];
  if (block.type === "chart") return [block.title, ...block.values.map((value) => value.label)];
  if (block.type === "standard-chart") {
    return [block.title, ...block.values.map((value) => value.label)];
  }
  if (block.type === "heatmap") {
    return [block.title, ...block.columns, ...block.rows.flatMap((row) => [row.label])];
  }
  if (block.type === "math") return [block.label, block.formula];
  if (block.type === "report") return [block.label, block.description];
  if (block.type === "image") return [block.alt, block.caption];
  return [block.text];
};

const parentIdsFor = (items: Section[], id: string, parents: string[] = []): string[] => {
  for (const item of items) {
    if (item.id === id) return parents;
    if (item.children) {
      const found = parentIdsFor(item.children, id, [...parents, item.id]);
      if (found.length) return found;
    }
  }
  return [];
};

const sectionForHash = (hash: string) =>
  flatten(sections).find((item) => item.id === hash.replace(/^#/, ""));

function Tree({
  items,
  language,
  active,
  onSelect,
  open,
  onToggle,
  depth = 0,
}: {
  items: Section[];
  language: Language;
  active: string;
  onSelect: (item: Section) => void;
  open: Record<string, boolean>;
  onToggle: (id: string) => void;
  depth?: number;
}) {
  return (
    <>
      {items.map((item) => (
        <div className="tree-row" key={item.id}>
          <button
            className={`tree-button ${item.id === active ? "active" : ""} ${
              !item.children && !isDocument(item) ? "pending" : ""
            }`}
            type="button"
            style={{ paddingLeft: 11 + depth * 16 }}
            disabled={!item.children && !isDocument(item)}
            onClick={() => (item.children && !isDocument(item) ? onToggle(item.id) : onSelect(item))}
          >
            {item.children ? (
              <span
                className="tree-toggle"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(item.id);
                }}
              >
                {open[item.id] ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </span>
            ) : (
              <span className="tree-spacer" />
            )}{" "}
            {depth === 0 && <BookOpen size={15} />}
            {item.title[language]}
          </button>
          {item.children && open[item.id] && (
            <Tree
              items={item.children}
              language={language}
              active={active}
              onSelect={onSelect}
              open={open}
              onToggle={onToggle}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </>
  );
}

export default function DocsWorkspace() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "ModelNex.AI Docs";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
  const initialLanguage: Language =
    requestedLanguage === "zh-CN" ||
    requestedLanguage === "zh-TW" ||
    requestedLanguage === "de" ||
    requestedLanguage === "nl" ||
    requestedLanguage === "en"
      ? requestedLanguage
      : browserDefaultLanguage();
  const [documentLanguage, setDocumentLanguage] = useState<Language>(initialLanguage);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [active, setActive] = useState(
    () =>
      (sectionForHash(window.location.hash) &&
      isDocument(sectionForHash(window.location.hash)! )
        ? sectionForHash(window.location.hash)
        : undefined) ??
      documents.find((item) => item.id === "product-name") ??
      sections[0],
  );
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const item = sectionForHash(window.location.hash);
    return item && isDocument(item)
      ? Object.fromEntries(parentIdsFor(sections, item.id).map((id) => [id, true]))
      : {};
  });
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState("content");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMode, setReportMode] = useState<"choice" | "form">("choice");
  const [reportTitle, setReportTitle] = useState("");
  const [reportBody, setReportBody] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportResult, setReportResult] = useState<"success" | "failure" | null>(null);
  useEffect(() => {
    const onHashChange = () => {
      const item = sectionForHash(window.location.hash);
      if (item && isDocument(item)) {
        setActive(item);
        setOpen((state) => ({
          ...state,
          ...Object.fromEntries(parentIdsFor(sections, item.id).map((id) => [id, true])),
        }));
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const labels = text[documentLanguage];
  const matches = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return [];
    const terms = search.split(/\s+/).filter(Boolean);

    return documents
      .map((item) => {
        const searchable = (Object.keys(text) as Language[]).flatMap((language) => {
          const content = contentFor(item.id, item.title[language], language);
          return [
            item.title[language],
            content.intro,
            ...content.paragraphs,
            ...(content.blocks?.flatMap(searchableBlockText) ?? []),
          ];
        });
        const matched = searchable.filter((value) =>
          terms.every((term) => value.toLocaleLowerCase().includes(term)),
        );
        return { item, snippet: matched[0] ?? "", score: matched.length };
      })
      .filter((result) => result.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 12);
  }, [query]);
  const select = (item: Section) => {
    if (!isDocument(item)) return;
    setActive(item);
    window.history.replaceState(null, "", `#${item.id}`);
    setOpen((state) => ({
      ...state,
      ...Object.fromEntries(parentIdsFor(sections, item.id).map((id) => [id, true])),
    }));
    setQuery("");
    setMenuOpen(false);
  };
  const toggle = (id: string) =>
    setOpen((state) => ({ ...state, [id]: !state[id] }));
  const setLanguage = (language: Language) => {
    setDocumentLanguage(language);
    setLanguageOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const openReport = () => {
    setReportTitle(`Documentation report: ${active.id}`);
    setReportBody("");
    setReportMode("choice");
    setReportResult(null);
    setReportOpen(true);
  };
  const hasDocumentationToken = Boolean(window.localStorage.getItem("sd-jwt"));
  const submitReport = async () => {
    if (!reportTitle.trim() || !reportBody.trim()) return;
    setReportSubmitting(true);
    setReportResult(null);
    try {
      const token = window.localStorage.getItem("sd-jwt");
      const authenticated = Boolean(token);
      const response = await fetch(
        authenticated ? "/api/auth/tickets" : "/api/public/tickets/anonymous",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(
            authenticated
              ? {
                  title: reportTitle.trim(),
                  body: reportBody.trim(),
                  priority: "normal",
                  attachments: [],
                }
              : {
                  title: reportTitle.trim(),
                  body: reportBody.trim(),
                  sourcePage: `${window.location.pathname}${window.location.hash}`,
                },
          ),
        },
      );
      if (!response.ok) throw new Error("report request failed");
      setReportResult("success");
      setReportTitle("");
      setReportBody("");
    } catch {
      setReportResult("failure");
    } finally {
      setReportSubmitting(false);
    }
  };
  const content = contentFor(
    active.id,
    active.title[documentLanguage],
    documentLanguage,
  );
  const charCount = [
    content.intro,
    ...content.paragraphs,
    ...(content.blocks?.flatMap(searchableBlockText) ?? []),
    ...content.table.flat(),
    content.code,
    content.figure,
  ].join("").length;
  const contentHeadings = content.blocks?.filter(
    (block): block is Extract<DocumentBlock, { type: "heading" }> =>
      block.type === "heading",
  );
  const tocItems = [
    { id: "content", text: active.title[documentLanguage] },
    ...(contentHeadings ?? []).map((heading) => ({
      id: heading.id,
      text: heading.text,
    })),
    ...(!content.blocks
      ? [
          { id: "scope", text: "适用范围与使用说明" },
          { id: "reference", text: "参考信息" },
        ]
      : []),
  ];
  const tocItemIds = tocItems.map((item) => item.id).join("|");
  useEffect(() => {
    setActiveHeadingId("content");
    const observed = tocItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);
        if (visible[0]) setActiveHeadingId(visible[0].target.id);
      },
      { rootMargin: "-92px 0px -58% 0px", threshold: [0, 0.2, 1] },
    );
    observed.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [active.id, documentLanguage, tocItemIds]);

  const scrollToTocItem = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveHeadingId(id);
  };
  return (
    <div className="shell">
      <header className="topbar">
        <button
          className="icon-button mobile-menu"
          type="button"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={19} />
        </button>
        <button
          className="brand"
          type="button"
          onClick={() =>
            select(documents.find((item) => item.id === "product-name") ?? documents[0])
          }
        >
          <img src="/smartdolphin.png" alt="" />
          <span>
            <strong>ModelNex.AI</strong>
            <b>DOCS</b>
          </span>
        </button>
        <div className="toolbar">
          <label className="search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.search}
            />
          </label>
          <div className="language-wrap">
            <button
              className="language"
              type="button"
              onClick={() => setLanguageOpen((value) => !value)}
            >
              <Globe2 size={16} />
              {labels.language}
              <ChevronDown size={15} />
            </button>
            {languageOpen && (
              <div className="language-menu">
                {(Object.keys(text) as Language[]).map((language) => (
                  <button
                    key={language}
                    type="button"
                    className={language === documentLanguage ? "selected" : ""}
                    onClick={() => setLanguage(language)}
                  >
                    {text[language].language}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {query && (
          <div className="search-results">
            {matches.length ? (
              <table>
                <thead>
                  <tr>
                    <th>{labels.document}</th>
                    <th>{labels.result}</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((item) => (
                    <tr key={item.item.id}>
                      <td>
                        <button type="button" onClick={() => select(item.item)}>
                          <strong>{item.item.title[documentLanguage]}</strong>
                        </button>
                      </td>
                      <td>{item.snippet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <span>{labels.empty}</span>
            )}
          </div>
        )}
      </header>
      {menuOpen && (
        <button
          className="scrim"
          type="button"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-mobile">
          <span>DOCS</span>
          <button
            className="icon-button"
            type="button"
            onClick={() => setMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <nav>
          <Tree
            items={sections}
            language={documentLanguage}
            active={active.id}
            onSelect={select}
            open={open}
            onToggle={toggle}
          />
        </nav>
      </aside>
      <main>
        <article id="content">
          <h1>{active.title[documentLanguage]}</h1>
          <div className="doc-meta">
            <span>{charCount.toLocaleString()} {labels.characters}</span>
            <span>{content.codeLanguage}</span>
          </div>
          {content.warning && (
            <div className="fiction-banner">{content.warning}</div>
          )}
          {content.intro && <p className="doc-intro">{content.intro}</p>}
          {content.review && (
            <div className="review-banner">
              {labels.review}
            </div>
          )}
          {content.blocks ? (
            <div className="document-blocks">
              {content.blocks.map((block, index) => {
                if (block.type === "heading") {
                  return (
                    <h2 id={block.id} key={block.id}>
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === "paragraph") {
                  return <p key={index}>{block.text}</p>;
                }
                if (block.type === "pre") {
                  return (
                    <pre className="document-pre" key={index}>
                      {block.text}
                    </pre>
                  );
                }
                if (block.type === "diagram") {
                  return (
                    <section className="architecture-diagram" key={index}>
                      <h3>{block.title}</h3>
                      <div className="architecture-flow">
                        {block.nodes.map((node) => (
                          <span key={node}>{node}</span>
                        ))}
                      </div>
                    </section>
                  );
                }
                if (block.type === "chart") {
                  const maximum = Math.max(...block.values.map((value) => value.value), 1);
                  return (
                    <section className={`document-chart ${block.kind}`} key={index}>
                      <h3>{block.title}</h3>
                      <div className="chart-plot" role="img" aria-label={block.title}>
                        {block.values.map((value) => (
                          <div
                            className="chart-value"
                            key={value.label}
                            style={{ "--chart-value": `${Math.max((value.value / maximum) * 100, 3)}%` } as CSSProperties}
                          >
                            <span className="chart-label">{value.label}</span>
                            <span className="chart-mark" />
                            <strong>{value.value}%</strong>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }
                if (block.type === "standard-chart") {
                  return (
                    <Suspense key={index} fallback={<div className="flow-loading">{labels.loadingChart}</div>}>
                      <StandardChart {...block} primaryLabel={labels.primary} secondaryLabel={labels.secondary} />
                    </Suspense>
                  );
                }
                if (block.type === "heatmap") {
                  const maximum = Math.max(
                    ...block.rows.flatMap((row) => row.values),
                    1,
                  );
                  return (
                    <section className="standard-heatmap" key={index}>
                      <h3>{block.title}</h3>
                      <div className="heatmap-grid" role="img" aria-label={block.title}>
                        <span />
                        {block.columns.map((column) => (
                          <strong key={column}>{column}</strong>
                        ))}
                        {block.rows.flatMap((row) => [
                          <strong key={`${row.label}-label`}>{row.label}</strong>,
                          ...row.values.map((value, valueIndex) => (
                            <span
                              key={`${row.label}-${valueIndex}`}
                              className="heatmap-cell"
                              style={{
                                "--heat-intensity": `${Math.max(value / maximum, 0.12)}`,
                              } as CSSProperties}
                              aria-label={`${row.label} ${block.columns[valueIndex]}: ${value}`}
                            >
                              {value}
                            </span>
                          )),
                        ])}
                      </div>
                    </section>
                  );
                }
                if (block.type === "math") {
                  return (
                    <Suspense key={index} fallback={<div className="flow-loading">{labels.loadingFormula}</div>}>
                      <StandardFormula {...block} />
                    </Suspense>
                  );
                }
                if (block.type === "flow") {
                  return (
                    <Suspense key={index} fallback={<div className="flow-loading">{labels.loadingDiagram}</div>}>
                      <MermaidFlow {...block} loadingLabel={labels.loadingDiagram} />
                    </Suspense>
                  );
                }
                if (block.type === "report") {
                  return (
                    <section className="report-panel" key={index}>
                      <h3>{block.label}</h3>
                      <p>{block.description}</p>
                      <button type="button" onClick={openReport}>
                        {block.label}
                      </button>
                    </section>
                  );
                }
                if (block.type === "matrix") {
                  return (
                    <div className="doc-table" key={index}>
                      <table>
                        <thead>
                          <tr>
                            {block.headers.map((cell) => (
                              <th key={cell}>{cell}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                if (block.type === "image") {
                  return (
                    <figure className="document-image" key={index}>
                      <img src={block.src} alt={block.alt} />
                      <figcaption>{block.caption}</figcaption>
                    </figure>
                  );
                }
                return (
                  <ul key={index}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              })}
            </div>
          ) : (
            <>
              <h2 id="scope">{labels.scope}</h2>
              {content.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              <h2 id="reference">{labels.reference}</h2>
              <div className="doc-table">
                <table>
                  <thead>
                    <tr>
                      {content.table[0].map((cell) => (
                        <th key={cell}>{cell}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {content.table.slice(1).map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell) => (
                          <td key={cell}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {content.invoicePreview && (
            <section className="payment-demo-preview" aria-label={labels.receiptTitle}>
              <h2>{labels.receiptTitle}</h2>
              <p>{labels.receiptDescription}</p>
              <img src="/payment-demo-invoice-preview.png" alt={labels.receiptAlt} />
            </section>
          )}
          {!content.invoicePreview && !content.blocks && <h2>{labels.example}</h2>}
          <div className={content.invoicePreview || content.blocks ? "hidden" : "code-panel"}>
            <div className="code-toolbar">
              <span>{content.codeFile}</span>
              <span>{content.codeLanguage}</span>
            </div>
            <pre className="doc-code">
              <code>{content.code}</code>
            </pre>
          </div>
          <figure className={content.invoicePreview || content.blocks ? "hidden" : "doc-figure"}>
            <div>▧</div>
            <figcaption>{content.figure}</figcaption>
          </figure>
        </article>
        <aside className="toc">
          <p>{labels.toc}</p>
          {tocItems.map((item) => (
            <a
              className={item.id === activeHeadingId ? "active" : ""}
              href={`#${item.id}`}
              key={item.id}
              onClick={(event) => scrollToTocItem(event, item.id)}
            >
              {item.text}
            </a>
          ))}
        </aside>
      </main>
      {reportOpen && (
        <div className="report-modal-backdrop" role="presentation">
          <section className="report-modal" role="dialog" aria-modal="true" aria-label={labels.reportSubmit}>
            <button
              className="report-close"
              type="button"
              aria-label={labels.reportCancel}
              onClick={() => setReportOpen(false)}
            >
              <X size={18} />
            </button>
            <h2>{labels.reportSubmit}</h2>
            <p className="report-status">
              {labels.reportStatus}: <strong>{hasDocumentationToken ? labels.signedIn : labels.signedOut}</strong>
            </p>
            {reportMode === "choice" && !hasDocumentationToken ? (
              <div className="report-choice">
                <p>{labels.reportNotice}</p>
                <button type="button" onClick={() => setReportMode("form")}>
                  {labels.reportAnonymous}
                </button>
                <button
                  className="secondary"
                  type="button"
                  onClick={() => window.location.assign("https://modelnex.ai/console")}
                >
                  {labels.reportAccount}
                </button>
              </div>
            ) : (
              <div className="report-form">
                {!hasDocumentationToken && <p>{labels.reportNotice}</p>}
                <label>
                  {labels.reportTitle}
                  <input
                    value={reportTitle}
                    maxLength={160}
                    onChange={(event) => setReportTitle(event.target.value)}
                  />
                </label>
                <label>
                  {labels.reportDetails}
                  <textarea
                    value={reportBody}
                    maxLength={5000}
                    rows={7}
                    onChange={(event) => setReportBody(event.target.value)}
                  />
                </label>
                {reportResult && (
                  <p className={reportResult === "success" ? "report-success" : "report-failure"}>
                    {reportResult === "success" ? labels.reportSent : labels.reportFailed}
                  </p>
                )}
                <div className="report-actions">
                  <button className="secondary" type="button" onClick={() => setReportOpen(false)}>
                    {labels.reportCancel}
                  </button>
                  <button
                    type="button"
                    disabled={reportSubmitting || !reportTitle.trim() || !reportBody.trim()}
                    onClick={() => void submitReport()}
                  >
                    {labels.reportSubmit}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

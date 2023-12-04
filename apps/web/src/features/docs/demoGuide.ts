import type { Language } from "./contentTypes";
import type { DocumentBlock, ProductIntroductionDocument } from "./productIntroduction";

type DemoDocument = ProductIntroductionDocument & {
  warning: string;
  codeLanguage: string;
};

const copy: Record<Language, {
  intro: string;
  warning: string;
  headings: {
    tables: string;
    charts: string;
    math: string;
    flow: string;
    code: string;
    report: string;
  };
  paragraph: string;
  report: string;
  reportDescription: string;
}> = {
  en: {
    intro: "This standard page defines the presentation baseline for this beta documentation site. It demonstrates approved structures for tables, quantitative charts, flow diagrams, source-code blocks, and mathematical notation; it does not create a product, commercial, legal, or technical commitment.",
    warning: "This is a standard-format demonstration page. It is used to verify the site presentation baseline and does not constitute a service, agreement, condition, or technical specification. If a published page does not follow this standard, please report the issue to the administrator.",
    headings: { tables: "Professional tables", charts: "Quantitative charts", math: "Mathematical notation", flow: "Flow and architecture diagrams", code: "Markdown diagram source", report: "Report an issue" },
    paragraph: "The examples intentionally use synthetic values. They demonstrate document structure and visual semantics only, including accessible labels, responsive layouts, data grouping, status distinction, and source presentation.",
    report: "Report an issue",
    reportDescription: "Report a content, layout, translation, or accessibility issue with this documentation standard.",
  },
  "zh-CN": {
    intro: "本标准页面用于定义本站 Beta 文档的展示基线，集中演示经认可的表格、定量图表、流程与框架图、源代码块和数学公式格式；本页不构成产品、商业、法律或技术承诺。",
    warning: "当前界面为标准展示界面，用于验证本站的排版与格式标准，不构成任何服务、协议、条件或技术规范。如发现本站页面存在不符合本标准的内容、格式、翻译或无障碍问题，请向管理员汇报错误。",
    headings: { tables: "专业表格", charts: "定量图表", math: "数学公式", flow: "流程与框架图", code: "Markdown 图表源码", report: "汇报错误" },
    paragraph: "下方数据均为合成示例，只用于展示文档结构与视觉语义，包括无障碍标签、响应式排版、数据分组、状态区分和源码呈现方式。",
    report: "汇报错误",
    reportDescription: "汇报本标准页面或其他文档中的内容、排版、翻译或无障碍问题。",
  },
  "zh-TW": {
    intro: "本標準頁面用於定義本站 Beta 文件的展示基線，集中示範經認可的表格、定量圖表、流程與架構圖、原始碼區塊及數學公式格式；本頁不構成產品、商業、法律或技術承諾。",
    warning: "目前頁面為標準展示頁面，用於驗證本站的排版與格式標準，不構成任何服務、協議、條件或技術規範。如發現本站頁面存在不符合本標準的內容、格式、翻譯或無障礙問題，請向管理員回報錯誤。",
    headings: { tables: "專業表格", charts: "定量圖表", math: "數學公式", flow: "流程與架構圖", code: "Markdown 圖表原始碼", report: "回報錯誤" },
    paragraph: "下方資料均為合成範例，僅用於展示文件結構與視覺語義，包括無障礙標籤、響應式排版、資料分組、狀態區分和原始碼呈現方式。",
    report: "回報錯誤",
    reportDescription: "回報本標準頁面或其他文件中的內容、排版、翻譯或無障礙問題。",
  },
  de: {
    intro: "Diese Standardseite definiert die Darstellungsgrundlage für diese Beta-Dokumentationsseite. Sie zeigt freigegebene Strukturen für Tabellen, quantitative Diagramme, Ablauf- und Architekturdiagramme, Quelltextblöcke und mathematische Notation; daraus entstehen keine produktbezogenen, kommerziellen, rechtlichen oder technischen Zusagen.",
    warning: "Dies ist eine Demonstrationsseite für das Standardformat. Sie dient der Prüfung der Darstellungsgrundlage und stellt keinen Dienst, keine Vereinbarung, Bedingung oder technische Spezifikation dar. Bitte melden Sie Abweichungen dem Administrator.",
    headings: { tables: "Professionelle Tabellen", charts: "Quantitative Diagramme", math: "Mathematische Notation", flow: "Ablauf- und Architekturdiagramme", code: "Markdown-Quelle des Diagramms", report: "Problem melden" },
    paragraph: "Die Beispiele verwenden absichtlich synthetische Werte. Sie zeigen nur Dokumentstruktur und visuelle Bedeutung, einschließlich zugänglicher Beschriftungen, responsiver Layouts, Datengruppierung, Statusunterscheidung und Quelltextdarstellung.",
    report: "Problem melden",
    reportDescription: "Melden Sie ein Problem mit Inhalt, Layout, Übersetzung oder Barrierefreiheit dieses Dokumentationsstandards.",
  },
  nl: {
    intro: "Deze standaardpagina definieert de presentatienorm voor deze bètadocumentatiesite. Ze toont goedgekeurde structuren voor tabellen, kwantitatieve grafieken, stroom- en architectuurdiagrammen, broncodeblokken en wiskundige notatie; ze vormt geen product-, commerciële, juridische of technische toezegging.",
    warning: "Dit is een demonstratiepagina voor de standaardopmaak. Ze wordt gebruikt om de presentatienorm te controleren en vormt geen dienst, overeenkomst, voorwaarde of technische specificatie. Meld afwijkingen aan de beheerder.",
    headings: { tables: "Professionele tabellen", charts: "Kwantitatieve grafieken", math: "Wiskundige notatie", flow: "Stroom- en architectuurdiagrammen", code: "Markdown-bron van het diagram", report: "Probleem melden" },
    paragraph: "De voorbeelden gebruiken bewust synthetische waarden. Ze tonen alleen documentstructuur en visuele betekenis, waaronder toegankelijke labels, responsieve lay-outs, gegevensgroepering, statusonderscheid en bronweergave.",
    report: "Probleem melden",
    reportDescription: "Meld een probleem met inhoud, lay-out, vertaling of toegankelijkheid van deze documentatiestandaard.",
  },
};

const matrix = (headers: string[], rows: string[][]): DocumentBlock => ({
  type: "matrix",
  headers,
  rows,
});

export function demoGuideFor(
  id: string,
  language: Language,
): DemoDocument | undefined {
  if (id !== "format-demonstration") return undefined;
  const text = copy[language];
  return {
    intro: text.intro,
    warning: text.warning,
    codeLanguage: "标准",
    blocks: [
      { type: "paragraph", text: text.paragraph },
      { type: "heading", id: "standard-tables", text: text.headings.tables },
      matrix(["表 1：字段", "数据类型", "必填", "说明"], [["记录编号", "字符串", "是", "具有唯一性的引用标识"], ["创建时间", "UTC 日期时间", "是", "以 ISO 8601 记录"], ["状态", "枚举", "是", "按受控状态集展示"], ["备注", "文本", "否", "不包含秘密凭据"]]),
      matrix(["表 2：服务级别", "可用性目标", "响应等级", "审查周期"], [["基础", "99.5%", "标准", "每月"], ["专业", "99.9%", "优先", "每月"], ["关键", "99.95%", "紧急", "每周"]]),
      matrix(["表 3：发布门槛", "草稿", "审校", "Beta", "正式"], [["内容校验", "进行中", "已完成", "已完成", "已完成"], ["可访问性", "不适用", "已检查", "已检查", "已检查"], ["变更记录", "可选", "必需", "必需", "必需"]]),
      matrix(["表 4：风险", "可能性", "影响", "处置优先级"], [["连接抖动", "中", "中", "P2"], ["认证错误", "低", "高", "P1"], ["文档过期", "中", "低", "P3"], ["密钥泄露", "低", "关键", "P0"]]),
      { type: "heading", id: "standard-charts", text: text.headings.charts },
      { type: "standard-chart", title: "图 1：七日请求趋势（合成数据）", kind: "line", values: [{ label: "Mon", value: 42, secondary: 39 }, { label: "Tue", value: 56, secondary: 48 }, { label: "Wed", value: 51, secondary: 46 }, { label: "Thu", value: 68, secondary: 58 }, { label: "Fri", value: 63, secondary: 55 }, { label: "Sat", value: 47, secondary: 42 }, { label: "Sun", value: 59, secondary: 51 }] },
      { type: "standard-chart", title: "图 2：节点状态计数（合成数据）", kind: "bar", values: [{ label: "DE", value: 32 }, { label: "NL", value: 28 }, { label: "US", value: 36 }, { label: "CH", value: 19 }] },
      { type: "standard-chart", title: "图 3：发布状态占比（合成数据）", kind: "pie", values: [{ label: "正式", value: 58 }, { label: "Beta", value: 27 }, { label: "审校", value: 10 }, { label: "草稿", value: 5 }] },
      { type: "heatmap", title: "图 4：区域与时段负载热力图（合成数据）", columns: ["00", "06", "12", "18"], rows: [{ label: "欧洲", values: [26, 41, 68, 82] }, { label: "北美", values: [72, 53, 38, 65] }, { label: "亚太", values: [48, 77, 56, 33] }] },
      { type: "heading", id: "standard-math", text: text.headings.math },
      { type: "math", label: "公式 1：平均延迟", formula: "latency" },
      { type: "math", label: "公式 2：加权服务评分", formula: "weighted-score" },
      { type: "math", label: "公式 3：可用性", formula: "availability" },
      { type: "heading", id: "standard-flow", text: text.headings.flow },
      { type: "flow", title: "图 5：受控文档发布流程", nodes: [{ label: "内容起草", detail: "作者提交结构化内容" }, { label: "技术审校", detail: "验证链接、术语和示例" }, { label: "Beta 验证", detail: "验证渲染、无障碍和反馈" }, { label: "正式发布", detail: "登记版本与变更记录" }] },
      { type: "flow", title: "图 6：文档呈现架构", nodes: [{ label: "内容模型", detail: "受控文档块" }, { label: "本地化", detail: "五种界面语言" }, { label: "渲染层", detail: "表格、公式与图表" }, { label: "读者界面", detail: "搜索、目录和反馈" }] },
      { type: "heading", id: "standard-code", text: text.headings.code },
      { type: "pre", text: "```mermaid\nflowchart LR\n  A[内容起草] --> B{技术审校}\n  B -->|通过| C[Beta 验证]\n  B -->|退回| A\n  C --> D[正式发布]\n```" },
      { type: "heading", id: "standard-report", text: text.headings.report },
      { type: "report", label: text.report, description: text.reportDescription },
    ],
  };
}

import translations from "./clientGuides.translations.json";
import type { Language } from "./contentTypes";
import type {
  DocumentBlock,
  ProductIntroductionDocument,
} from "./productIntroduction";

type Article = ProductIntroductionDocument;
type TranslationLanguage = Exclude<Language, "zh-CN">;
type TranslationMap = Partial<Record<TranslationLanguage, Record<string, string>>>;

const translatedText = translations as TranslationMap;

const article = (intro: string, blocks: DocumentBlock[]): Article => ({
  intro,
  blocks,
});

const heading = (id: string, text: string): DocumentBlock => ({
  type: "heading",
  id,
  text,
});

const paragraph = (text: string): DocumentBlock => ({ type: "paragraph", text });
const list = (...items: string[]): DocumentBlock => ({ type: "list", items });
const diagram = (title: string, ...nodes: string[]): DocumentBlock => ({
  type: "diagram",
  title,
  nodes,
});
const matrix = (headers: string[], rows: string[][]): DocumentBlock => ({
  type: "matrix",
  headers,
  rows,
});

const articles: Record<string, Article> = {
  "android-client": article(
    "本章说明 ModelNex.AI Android 客户端的使用范围、系统交互、账户与网络服务边界。具体可用功能以当前正式发布版本、账户权益及客户端界面为准。",
    [
      heading("android-overview", "Android 客户端概述"),
      paragraph(
        "Android 客户端面向移动设备上的账户登录、官方节点连接、用户自定义节点、订阅与流量查看、卡包、诊断支持和账户安全设置等场景。客户端通过 Android 系统提供的 VPN 能力建立本机网络隧道，并在得到用户授权后处理相关网络连接。",
      ),
      paragraph(
        "客户端不替代 Android 系统、运营商或第三方网络服务。是否能够建立连接及最终访问效果，仍受设备系统版本、网络环境、节点状态、协议兼容性和服务端授权状态影响。",
      ),

      heading("android-architecture", "运行架构与责任边界"),
      diagram(
        "Android 客户端的连接链路",
        "用户界面与账户操作",
        "本地状态与系统权限协调",
        "认证后的账户、权益与节点信息",
        "Android VPN 系统服务",
        "已选择的官方或自定义节点",
      ),
      paragraph(
        "界面层负责展示账户、节点、连接和设置状态；客户端本地层负责保存必要的本机状态并协调系统权限；经认证的服务接口提供账户权益、可用节点和服务状态；Android 系统负责建立和管理设备级 VPN 连接。自定义节点由用户提供，不能因导入客户端而视为官方节点。",
      ),

      heading("android-install-update", "安装、签名与更新"),
      paragraph(
        "应仅从 ModelNex.AI 官方发布渠道取得 Android 安装包或更新。安装前应核对应用名称、发布来源和版本信息；不应从来源不明的聊天记录、网盘、网页镜像或修改版安装包中安装客户端。",
      ),
      paragraph(
        "客户端更新可能包含协议兼容性调整、账户接口更新或安全修复。对于被标记为重要或强制更新的版本，旧版本可能无法继续使用部分在线能力。更新不会要求用户通过客服、聊天或非官方网页提供密码、验证码、恢复短语或私钥。",
      ),

      heading("android-first-use", "首次使用与系统授权"),
      list(
        "登录或注册 ModelNex.AI 账户，并完成当前界面要求的身份验证；",
        "在节点页面选择可使用的官方节点，或按客户端支持的格式导入自定义节点；",
        "首次连接时，在 Android 系统弹窗中确认 VPN 连接授权；",
        "确认当前连接状态、节点信息和账户权益状态后再使用网络服务；",
        "如系统已由其他 VPN、防火墙、设备管理或安全软件接管网络，请先核对其兼容性。",
      ),
      paragraph(
        "Android 通常只允许一个设备级 VPN 服务同时处于活动状态。其他 VPN、部分网络安全软件、工作资料管理或设备策略可能阻止 ModelNex.AI 建立连接，或在连接期间改变网络行为。",
      ),

      heading("android-connection", "连接生命周期"),
      matrix(
        ["状态", "客户端含义", "用户可采取的操作"],
        [
          ["未连接", "尚未建立设备级 VPN 隧道。", "检查账户、节点和本地网络后发起连接。"],
          ["正在连接", "客户端正在请求授权或建立到所选节点的连接。", "保留前台页面，避免重复发起连接。"],
          ["已连接", "Android VPN 服务已处于活动状态。", "可查看节点、时长和流量等当前状态。"],
          ["已中断或失败", "连接被系统、网络、节点或认证状态中断。", "检查错误信息、网络与节点状态后再尝试。"],
          ["已断开", "客户端已停止本机 VPN 服务。", "需要时重新选择节点并连接。"],
        ],
      ),
      paragraph(
        "移动网络、Wi-Fi 切换、省电策略、系统后台限制或节点维护可能造成连接中断。自动重连或后台行为以当前发布版本的设置项和 Android 系统实际允许的行为为准。",
      ),

      heading("android-account-entitlements", "账户、订阅与卡包"),
      paragraph(
        "账户权益以经过认证的服务端状态为准。订阅流量、单独购买流量、有效期、限速策略和可用节点属于不同的权益字段，客户端应分别展示，不能将其中任一项错误替代为另一项。",
      ),
      paragraph(
        "卡包用于展示已发放的权益卡和其可用状态。只有被服务端标记为可在客户端应用的卡，才可在客户端执行相应操作；折扣、支付或仅用于网站结算的卡应在对应结算流程使用，而不是直接修改客户端权益。",
      ),
      paragraph(
        "账户、订阅、流量和卡包变更依赖在线服务同步。客户端在网络不稳定或刚完成操作时可能需要刷新，最终状态以服务端确认结果为准。",
      ),

      heading("android-nodes", "官方节点与自定义节点"),
      paragraph(
        "官方节点的可见范围由账户权限、服务状态和客户端版本共同决定。节点页面显示的可达性或延迟属于状态信息，不构成固定速度、固定延迟或持续可用性的承诺。",
      ),
      paragraph(
        "用户可在客户端支持的范围内导入合法取得使用权的自定义节点。自定义节点的地址、认证材料、流量、带宽、安全性及法律合规性由用户或相应资源提供方负责。导入、导出、截图或分享配置前，应移除私钥、密码、Token、API Key 和其他访问凭据。",
      ),

      heading("android-diagnostics", "通知、诊断与支持"),
      paragraph(
        "通知权限用于向用户显示与账户或客户端状态有关的信息。用户可在 Android 系统设置及客户端设置中管理通知权限；关闭通知不会自动改变账户权益，但可能无法及时收到更新、服务或安全提示。",
      ),
      paragraph(
        "诊断日志、反馈和客服对话用于用户主动寻求支持。提交前应检查文本、图片和配置中是否包含不必要的敏感数据。除非用户在当前功能中明确提交，客户端不应将用户的私钥、密码、验证码或完整自定义节点凭据作为普通支持内容发送。",
      ),

      heading("android-security", "安全使用建议"),
      list(
        "使用唯一且强度足够的账户密码，并按账户设置启用可用的身份验证保护；",
        "不要向任何人提供登录密码、一次性验证码、卡片安全信息、私钥或恢复材料；",
        "在出售、转交或维修设备前退出账户并移除本地敏感配置；",
        "及时安装 Android 系统更新与官方客户端安全更新；",
        "遇到未知登录、异常节点或可疑通知时，先修改密码并在设备管理中结束不认识的会话。",
      ),

      heading("android-troubleshooting", "常见连接检查"),
      matrix(
        ["现象", "优先检查项"],
        [
          ["无法发起连接", "网络可用性、账户登录状态、Android VPN 授权和是否存在另一项活动 VPN。"],
          ["连接后无法访问网络", "节点状态、当前网络限制、DNS 设置、系统私有 DNS 或其他安全软件。"],
          ["频繁断开", "Wi-Fi 与移动网络切换、电池优化、后台限制、节点维护和网络质量。"],
          ["权益或卡包未更新", "刷新账户状态；确认操作已由服务端完成且使用的是同一账户。"],
        ],
      ),
      paragraph(
        "如问题持续存在，可通过客户端支持入口提交简要复现步骤、发生时间、客户端版本和非敏感诊断信息。不要将账户密码、一次性验证码、私钥或完整认证配置写入工单或客服消息。",
      ),
    ],
  ),

  "cross-platform-features": article(
    "本章说明 ModelNex.AI 在不同客户端之间的统一账户规则、可同步范围与平台差异。当前仅对已正式发布并在相应版本中显示的功能作说明；未发布平台的具体能力以其后续正式文档为准。",
    [
      heading("cross-platform-principles", "跨平台设计原则"),
      paragraph(
        "ModelNex.AI 使用统一账户体系。用户可在受支持平台登录同一账户，并在服务端确认后取得该账户对应的订阅、流量、官方节点权限和卡包状态。账户统一不代表所有平台具有相同的界面、网络权限、协议实现、后台能力或系统集成方式。",
      ),
      paragraph(
        "跨平台设计以“账户权益集中确认、本机连接独立管理、敏感配置由用户控制”为原则。客户端不能把其他设备的在线连接状态、系统权限或本地网络设置当作当前设备的真实状态。",
      ),

      heading("cross-platform-flow", "账户与连接信息流"),
      diagram(
        "跨平台信息流",
        "用户在任一正式客户端登录同一账户",
        "认证服务确认账户、权益与可用服务",
        "客户端取得本机可展示的节点与账户状态",
        "每台设备分别请求本机系统 VPN 权限并建立连接",
        "本机连接、网络权限与诊断状态独立保存",
      ),
      paragraph(
        "账户级信息以经过认证的服务端确认结果为准；设备级信息则以本机客户端和操作系统为准。该划分避免一台设备的网络状态、权限或错误信息错误覆盖其他设备。",
      ),

      heading("cross-platform-sync", "同步范围与本机范围"),
      matrix(
        ["信息类别", "处理原则", "说明"],
        [
          ["账户资料与安全状态", "账户级同步", "以账户认证和服务端确认结果为准。"],
          ["订阅、流量与卡包", "账户级同步", "权益由服务端计算；客户端分别展示各权益类别。"],
          ["官方节点目录与服务状态", "服务端提供", "客户端按账户权限和当前服务状态展示。"],
          ["当前 VPN 连接", "本机独立", "每台设备的连接、断开和系统授权互不替代。"],
          ["系统 VPN 与通知权限", "本机独立", "由对应操作系统授予、撤销和限制。"],
          ["本地网络和界面偏好", "本机优先", "除非产品明确提供同步选项，否则不应假定跨设备复制。"],
          ["自定义节点与敏感配置", "用户明确控制", "导入、导出或同步应由用户主动发起，不应默认传播敏感凭据。"],
          ["诊断与支持附件", "用户主动提交", "仅在用户选择提交时进入对应支持流程。"],
        ],
      ),

      heading("cross-platform-platforms", "平台状态与功能差异"),
      matrix(
        ["平台", "文档状态", "当前说明"],
        [
          ["Android", "已提供客户端文档", "适用 Android 系统 VPN 授权、移动网络和后台限制规则。"],
          ["Windows", "正在开发中", "具体安装、网络权限和功能说明将在正式发布后提供。"],
          ["Linux", "正在开发中", "具体发行版、桌面集成和网络服务说明将在正式发布后提供。"],
          ["CLI", "正在开发中", "安装、命令、配置和设备兼容性说明将在正式发布后提供。"],
          ["macOS、iPhone、iPad", "正在开发中", "Apple 平台的网络权限与客户端说明将在正式发布后提供。"],
        ],
      ),
      paragraph(
        "“正在开发中”仅表示该平台的公开客户端文档尚未完成，不代表该平台已承诺上线日期、功能范围或与 Android 完全一致的实现。",
      ),

      heading("cross-platform-entitlements", "统一权益与使用顺序"),
      paragraph(
        "订阅权益、订阅流量、单独购买流量及服务限制应作为独立信息处理。客户端可以在账户页面分别展示这些字段，但不得因为某一字段存在或为空而推断其他字段的余额、有效期或限速策略。",
      ),
      paragraph(
        "当用户在某一设备购买服务、兑换权益或应用可用卡后，其他已登录客户端在完成刷新和服务端确认后应显示相同的账户级结果。网络连接本身仍由每台设备分别建立，不会因为另一设备已连接而自动连接。",
      ),

      heading("cross-platform-security", "跨平台安全边界"),
      list(
        "不要将账户密码、一次性验证码、私钥、Token 或 API Key 通过客服、工单或非官方渠道在设备之间传递；",
        "不要将一台设备导出的自定义节点配置默认视为另一台设备可以安全使用的配置；",
        "设备管理中的退出操作用于结束对应设备的账户会话，不等同于清除该设备操作系统中其他应用保存的数据；",
        "更换设备、出售设备或发现异常会话时，应退出账户、更新密码并复核已登录设备；",
        "始终使用官方发布渠道提供的客户端，避免在未经验证的构建版本中输入账户或节点凭据。",
      ),

      heading("cross-platform-versioning", "版本兼容与更新"),
      paragraph(
        "不同平台可能在不同时间接收功能、协议或安全更新。服务端接口会以兼容性和安全要求决定旧版本是否仍可访问特定在线功能。客户端版本落后时，用户应按照官方更新提示升级，而不应通过修改请求或替换内部组件绕过兼容性检查。",
      ),
      paragraph(
        "功能差异应以对应平台客户端页面、发布说明和本章节中的正式更新为准。没有在公开文档或当前客户端中出现的内部接口、测试能力或管理功能，不应视为面向用户的跨平台承诺。",
      ),

      heading("cross-platform-support", "跨设备问题排查"),
      matrix(
        ["问题", "建议处理方式"],
        [
          ["一台设备显示的权益与另一台不同", "分别刷新账户状态，确认两台设备使用的是同一账户，并等待服务端操作完成。"],
          ["一台设备能连接、另一台不能", "分别检查该设备的系统 VPN 授权、网络环境、版本、节点权限和本机安全软件。"],
          ["设备列表与实际使用不符", "在账户设备管理中核对最近活动信息，并结束不认识或不再使用的会话。"],
          ["设置无法跨设备复现", "先确认该设置是否属于本机网络、系统权限或本地偏好，不应默认认为其会同步。"],
        ],
      ),
      paragraph(
        "需要支持时，请说明受影响的平台、客户端版本、发生时间、账户操作结果和非敏感错误信息。跨平台问题应避免提交密码、验证码、私钥、完整节点认证配置或其他不必要的凭据。",
      ),
    ],
  ),
};

const normalizeTerms = (value: string) =>
  value
    .replace(/Smart\s+Dolphin\s+VPN/gi, "ModelNex.AI")
    .replace(/Api\s+Key/gi, "API Key")
    .replace(/Android\s+VPN/gi, "Android VPN");

const localizedText = (key: string, source: string, language: Language) => {
  if (language === "zh-CN") return source;
  return normalizeTerms(translatedText[language]?.[key] ?? source);
};

export function clientGuideFor(
  id: string,
  language: Language = "zh-CN",
): Article | undefined {
  const value = articles[id];
  if (!value) return undefined;

  return {
    intro: localizedText(`${id}.intro`, value.intro, language),
    blocks: value.blocks.map((block, blockIndex) => {
      if (block.type === "list") {
        return {
          ...block,
          items: block.items.map((item, itemIndex) =>
            localizedText(
              `${id}.blocks.${blockIndex}.items.${itemIndex}`,
              item,
              language,
            ),
          ),
        };
      }

      if (block.type === "diagram") {
        return {
          ...block,
          title: localizedText(
            `${id}.blocks.${blockIndex}.title`,
            block.title,
            language,
          ),
          nodes: block.nodes.map((node, nodeIndex) =>
            localizedText(
              `${id}.blocks.${blockIndex}.nodes.${nodeIndex}`,
              node,
              language,
            ),
          ),
        };
      }

      if (block.type === "matrix") {
        return {
          ...block,
          headers: block.headers.map((header, headerIndex) =>
            localizedText(
              `${id}.blocks.${blockIndex}.headers.${headerIndex}`,
              header,
              language,
            ),
          ),
          rows: block.rows.map((row, rowIndex) =>
            row.map((cell, cellIndex) =>
              localizedText(
                `${id}.blocks.${blockIndex}.rows.${rowIndex}.${cellIndex}`,
                cell,
                language,
              ),
            ),
          ),
        };
      }

      if (
        block.type === "image" ||
        block.type === "chart" ||
        block.type === "math" ||
        block.type === "flow" ||
        block.type === "standard-chart" ||
        block.type === "heatmap" ||
        block.type === "report"
      ) {
        return block;
      }

      return {
        ...block,
        text: localizedText(
          `${id}.blocks.${blockIndex}.text`,
          block.text,
          language,
        ),
      };
    }),
  };
}

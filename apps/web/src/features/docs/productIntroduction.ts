import translations from "./productIntroduction.translations.json";
import type { Language } from "./contentTypes";

export type DocumentBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "pre"; text: string }
  | { type: "math"; label: string; formula: "latency" | "weighted-score" | "availability" }
  | { type: "heading"; id: string; text: string }
  | { type: "diagram"; title: string; nodes: string[] }
  | {
      type: "flow";
      title: string;
      nodes: { label: string; detail: string }[];
    }
  | {
      type: "chart";
      title: string;
      kind: "bars" | "columns" | "segments";
      values: { label: string; value: number }[];
    }
  | {
      type: "standard-chart";
      title: string;
      kind: "line" | "bar" | "pie";
      values: { label: string; value: number; secondary?: number }[];
    }
  | {
      type: "heatmap";
      title: string;
      columns: string[];
      rows: { label: string; values: number[] }[];
    }
  | { type: "matrix"; headers: string[]; rows: string[][] }
  | { type: "report"; label: string; description: string }
  | { type: "image"; src: string; alt: string; caption: string };

export type ProductIntroductionDocument = {
  intro: string;
  blocks: DocumentBlock[];
};

type SourceArticle = {
  intro: string;
  blocks: DocumentBlock[];
};

type TranslationLanguage = Exclude<Language, "zh-CN">;
type TranslationMap = Partial<Record<TranslationLanguage, Record<string, string>>>;

const translatedText = translations as TranslationMap;

const article = (
  intro: string,
  blocks: DocumentBlock[],
): SourceArticle => ({ intro, blocks });

const paragraph = (text: string): DocumentBlock => ({ type: "paragraph", text });
const list = (...items: string[]): DocumentBlock => ({ type: "list", items });

const articles: Record<string, SourceArticle> = {
  "product-name": article("ModelNex.AI", [
    paragraph(
      "ModelNex.AI 为产品全球统一名称，不设中文名称、简称或其他地区名称。产品名称、客户端品牌及服务品牌在不同国家和地区保持统一。",
    ),
  ]),
  "product-overview": article(
    "ModelNex.AI 是一款面向个人用户、个人开发者及技术用户，同时兼顾高级用户和企业级定制需求的综合型 VPN 服务。",
    [
      paragraph(
        "ModelNex.AI 不仅提供基础的 VPN 连接能力，还提供面向网络工程、开发、隐私保护和高级网络配置场景的专业功能，包括多平台客户端、网络路由与分流、DNS 配置、IPv4/IPv6 相关功能、节点管理、连接控制以及其他高级网络功能。",
      ),
      paragraph(
        "产品整体以轻量化、专业化和低干扰为主要设计方向，不通过广告干扰正常使用，并针对技术用户提供较为完整的网络配置能力。",
      ),
      paragraph(
        "ModelNex.AI 同时提供 AI 辅助服务。用户可以通过 AI 服务获取产品使用帮助以及部分专业网络技术问题的辅助解答，从而降低高级网络功能的使用门槛。",
      ),
    ],
  ),
  "product-positioning": article("ModelNex.AI 的核心定位为专业型综合 VPN 服务。", [
    paragraph("产品同时覆盖以下使用场景："),
    list(
      "个人 VPN 使用；",
      "个人开发者及技术人员的网络环境；",
      "隐私保护与网络安全；",
      "跨地区网络访问；",
      "DNS 与网络解析配置；",
      "IPv4 / IPv6 网络配置；",
      "网络路由与流量分流；",
      "高级 VPN 参数配置；",
      "多设备、多平台协同使用；",
      "技术人员的网络测试与调试；",
      "高级用户的自定义节点与协议使用；",
      "企业及特殊场景的定制化需求。",
    ),
    paragraph(
      "ModelNex.AI 并不将自身定位为仅提供“点击连接即可使用”的基础 VPN 工具，而是同时提供面向普通用户和技术用户的多层次网络能力。",
    ),
    paragraph(
      "对于企业用户，ModelNex.AI 当前提供的企业级功能和专门化支持仍处于有限状态，因此暂不设置独立的企业服务入口。存在特殊需求的企业或组织可以通过官方渠道单独联系，以评估定制服务的可行性。",
    ),
  ]),
  "product-service-regions": article("ModelNex.AI 当前正式服务范围固定为 30 个国家：", [
    list("美国；", "申根区 29 个国家。"),
    paragraph(
      "除上述 30 个国家外，ModelNex.AI 当前不将其他国家或地区列入正式服务范围。",
    ),
    paragraph(
      "服务区域的具体国家列表、国家级服务说明、网络策略以及不同地区之间的具体差异，以“服务区域与节点”章节中的正式信息为准。",
    ),
    paragraph(
      "服务区域可能根据产品运营、基础设施、法律法规及服务能力发生调整。任何服务区域变更均以官方公布的信息为准。",
    ),
  ]),
  "product-clients-platforms": article("ModelNex.AI 当前提供以下七类客户端：", [
    list("Windows", "Android", "Linux", "CLI", "iPhone", "iPad", "macOS"),
    paragraph("其中，Linux 客户端与 CLI 客户端属于两个独立的产品形态。"),
    paragraph(
      "Linux 客户端面向完整 Linux 使用环境，CLI 客户端则定位为跨平台纯命令行客户端。CLI 不以 Linux 为唯一目标平台，可用于服务器、树莓派、ARM 设备以及其他具备兼容运行环境的设备。",
    ),
    paragraph(
      "不同平台的功能、系统权限、网络能力及配置方式可能存在差异。部分高级功能可能根据操作系统限制、系统 API、设备能力或平台政策而有所不同。",
    ),
    paragraph("各平台的具体安装方式、功能支持情况及差异，以“客户端”章节中的对应平台文档为准。"),
  ]),
  "product-network-capabilities": article(
    "ModelNex.AI 提供完整的 VPN 网络连接能力，并针对高级用户提供多种网络控制功能。",
    [
      paragraph("主要能力包括但不限于："),
      list(
        "VPN 隧道连接；",
        "节点选择；",
        "自动连接；",
        "自动重连；",
        "网络变化处理；",
        "路由配置；",
        "流量分流；",
        "DNS 配置；",
        "IPv4 网络支持；",
        "IPv6 网络支持；",
        "DNS 泄漏相关防护能力；",
        "IPv6 泄漏相关防护能力；",
        "网络状态查看；",
        "连接状态管理；",
        "节点健康状态管理；",
        "高级网络参数配置；",
        "用户自定义节点；",
        "用户自定义协议配置。",
      ),
      paragraph("不同客户端提供的具体功能并不完全相同。"),
      paragraph(
        "ModelNex.AI 会根据不同操作系统的网络模型、系统权限及平台能力提供相应的功能实现，因此 Windows、Android、Linux、CLI、iPhone、iPad 和 macOS 的设置界面及可用选项可能存在差异。",
      ),
    ],
  ),
  "product-protocols-technology": article("ModelNex.AI 使用 Dolphin-Core 作为核心 VPN 网络引擎。", [
    paragraph(
      "Dolphin-Core 基于 Sing-Box 项目进行深度改造，并在 ModelNex.AI 的长期开发过程中进行了大量针对自身产品需求的修改和扩展。因此，Dolphin-Core 不应简单理解为未经修改的原始 Sing-Box 客户端。",
    ),
    paragraph("ModelNex.AI 当前支持以下 VPN / 网络协议："),
    list(
      "Dolphin-Core 所支持的 ModelNex.AI 自有实现；",
      "REALITY / VLESS；",
      "WireGuard；",
      "Hysteria 2。",
    ),
    paragraph("ModelNex.AI 当前不承诺支持上述列表之外的其他协议。"),
    paragraph("具体协议实现、版本、兼容性及公开技术资料，以“开源与技术”章节为准。"),
  ]),
  "product-custom-nodes-protocols": article("ModelNex.AI 提供基础软件使用能力。", [
    paragraph(
      "用户在不购买 ModelNex.AI 高级服务的情况下，也可以使用客户端的基础功能，并可以根据客户端支持情况导入自己的节点及协议配置。",
    ),
    paragraph(
      "用户自行提供的节点、服务器及相关网络资源不属于 ModelNex.AI 的服务资源，其可用性、性能、安全性及合法性由用户自行负责。",
    ),
    paragraph(
      "ModelNex.AI 的客户端将尽可能提供对已支持协议和配置格式的兼容能力，但不同平台的实际支持范围可能存在差异。",
    ),
  ]),
  "product-advanced-services": article("ModelNex.AI 同时提供高级服务。", [
    paragraph(
      "高级服务与基础软件使用能力并非完全相同。部分专业网络能力、服务资源、节点资源或其他高级功能可能需要对应的订阅或服务权限。",
    ),
    paragraph("具体服务内容、套餐、价格、权限及限制，以“订阅、订单与支付”章节公布的当前信息为准。"),
  ]),
  "product-node-services": article("ModelNex.AI 当前提供有限规模的官方节点服务。", [
    paragraph("现阶段官方节点包括："),
    list("3 个普通节点；", "2 个纯净节点。"),
    paragraph("官方节点数量将根据基础设施建设、服务需求及运营情况逐步扩展。"),
    paragraph(
      "节点类型、节点状态、节点地区、节点可用性以及具体服务能力可能发生变化。官方节点并不代表所有平台、所有协议或所有网络环境下均具有完全相同的连接表现。",
    ),
    paragraph("关于节点的具体信息，以“服务区域与节点”章节的实时信息为准。"),
  ]),
  "product-ai-support": article(
    "ModelNex.AI 提供 AI 辅助服务，用于帮助用户理解和使用产品功能，并辅助处理部分网络技术相关问题。",
    [
      paragraph("AI 辅助服务可以用于："),
      list(
        "产品功能咨询；",
        "客户端使用指导；",
        "网络配置辅助；",
        "DNS 配置辅助；",
        "路由与分流相关问题分析；",
        "VPN 连接问题分析；",
        "基础网络技术问题解答；",
        "高级用户的技术辅助。",
      ),
      paragraph(
        "AI 提供的内容属于辅助性信息。对于涉及网络安全、系统配置、数据安全或其他可能产生实际影响的操作，用户应在执行前根据实际环境进行确认。",
      ),
      paragraph("AI 服务不能替代专业法律、医疗、财务或其他依法需要专业资质的服务。"),
    ],
  ),
  "product-customer-service": article("ModelNex.AI 提供专业客服支持。", [
    paragraph("客服主要用于产品使用、账户、订阅、网络连接以及其他产品相关问题的处理。"),
    paragraph("对于复杂的网络工程问题，ModelNex.AI 将根据问题类型提供相应的技术辅助能力。"),
    paragraph(
      "企业用户目前不享有独立的企业服务体系。如果企业或组织需要特殊网络架构、定制功能或其他专业服务，可以通过官方渠道联系 ModelNex.AI，由双方单独评估具体需求。",
    ),
  ]),
  "product-privacy-logs": article("ModelNex.AI 不以“零日志”作为产品宣传或服务承诺。", [
    paragraph(
      "VPN 服务在正常运行过程中需要产生一定的服务运行日志、系统日志、错误日志、安全日志及其他为提供、维护、保护和改进服务所必需的技术记录。",
    ),
    paragraph(
      "同时，ModelNex.AI 提供日志权限控制机制，使用户能够根据自身需求控制部分与个人使用行为相关的增强日志收集范围。",
    ),
    paragraph(
      "在用户未主动启用相应高级日志权限的情况下，ModelNex.AI 不会以启用该权限为前提，主动扩大用户可控制范围内的增强日志收集。",
    ),
    paragraph("用户可以根据客户端实际提供的日志权限设置，对可选日志范围进行管理。"),
    paragraph(
      "在用户主动启用更高级的日志权限后，系统可能收集更多与连接和网络使用相关的技术信息，例如 IP 地址、域名、连接时间戳以及其他用于故障分析、服务改进和网络质量优化的信息。",
    ),
    paragraph(
      "不同类型日志的具体收集范围、处理目的、保存期限、访问权限及删除机制，以“安全与隐私”和“正式法律文件”章节中的正式说明为准。",
    ),
    paragraph(
      "需要特别说明的是，“关闭用户可选日志权限”并不等同于 ModelNex.AI 的全部服务器、系统、安全及运行日志均停止记录。",
    ),
  ]),
  "product-advertising-experience": article("ModelNex.AI 以无广告、低干扰的产品体验为设计方向。", [
    paragraph("客户端及核心使用流程不会以展示广告作为主要产品模式。"),
    paragraph("具体第三方服务、分析工具、统计机制以及相关数据处理方式，以隐私政策和 Cookie 政策中的正式说明为准。"),
  ]),
  "product-open-source": article("ModelNex.AI 致力于公开部分客户端及技术实现。", [
    paragraph("目前 Windows、Linux 和 Android 客户端的整体代码计划作为开源项目提供。"),
    paragraph("服务端代码将根据实际情况逐步评估部分开源，但服务端完整开源范围目前尚未最终确定。"),
    paragraph("开源项目的具体仓库、许可证、代码范围、第三方依赖及开源义务，以“开源与技术”章节及相应开源仓库中的正式信息为准。"),
    paragraph("ModelNex.AI 不承诺公开全部服务端代码、内部基础设施或内部运营系统。"),
  ]),
  "product-internal-technology": article("为了保障服务安全、稳定性和运营能力，ModelNex.AI 不公开部分内部技术信息。", [
    paragraph("包括但不限于："),
    list(
      "内部架构；",
      "内部数据库结构；",
      "内部风控机制；",
      "内部安全策略；",
      "密钥管理细节；",
      "内部认证机制；",
      "节点调度算法；",
      "内部运维系统；",
      "内部监控系统；",
      "服务端敏感配置；",
      "其他可能影响服务安全性的内部信息。",
    ),
    paragraph("公开技术文档仅描述适合公开的技术架构、协议、接口、开源项目及相关实现信息。"),
  ]),
  "product-design-principles": article("ModelNex.AI 的产品设计主要遵循以下原则：", [
    paragraph("轻量化。尽可能降低客户端资源占用和使用复杂度，在满足功能需求的同时保持较轻量的运行体验。"),
    paragraph("专业化。提供面向开发者、网络工程师及高级用户的网络配置与控制能力。"),
    paragraph("低干扰。减少广告及不必要的产品干扰，将核心网络功能作为产品重点。"),
    paragraph("多平台。通过 Windows、Android、Linux、CLI、iPhone、iPad 和 macOS 提供多平台支持，并根据各平台能力提供相应的实现。"),
    paragraph("开放性。公开部分客户端及技术实现，同时支持用户导入自身节点和协议配置。"),
    paragraph("安全性。通过协议、加密、网络隔离、权限控制、日志权限及其他安全机制保障服务运行安全。"),
    paragraph("可维护性。通过版本管理、协议管理、API 版本控制及文档变更记录保持产品长期可维护性。"),
  ]),
  "product-service-boundaries": article(
    "ModelNex.AI 是 VPN 软件及网络服务提供商，不承诺对用户访问的所有互联网内容、第三方服务或第三方网络资源提供控制、保证或担保。",
    [
      paragraph(
        "用户仍需遵守其所在地以及所访问服务所在地适用的法律法规、第三方服务条款及其他具有约束力的规则。",
      ),
      paragraph("ModelNex.AI 不因为提供 VPN 技术而改变用户对其自身网络行为承担的责任。"),
      paragraph("具体用户责任、禁止行为、服务限制及服务终止条件，以《服务条款》和《可接受使用政策》为准。"),
    ],
  ),
  "product-information-priority": article(
    "本页面用于介绍 ModelNex.AI 的产品定位、主要能力和基本服务范围。",
    [
      paragraph(
        "具体功能、价格、节点状态、平台支持、协议兼容性、数据处理方式、用户权利及法律义务，应以对应正式页面和法律文件中的最新版本为准。",
      ),
      paragraph(
        "当产品介绍与具体技术文档、服务条款、隐私政策或其他正式文件存在差异时，应以对应事项的最新正式文件为准。",
      ),
    ],
  ),
};

const normalizeTerms = (value: string) =>
  value
    .replace(/Smart\s+Dolphin\s+VPN/gi, "ModelNex.AI")
    .replace(/Dolphin\s+Core/gi, "Dolphin-Core")
    .replace(/Sing\s*-?\s*Box/gi, "Sing-Box")
    .replace(/Reality\s*\/\s*Vless/gi, "REALITY / VLESS")
    .replace(/Hysteria\s*2/gi, "Hysteria 2")
    .replace(/Api\s+Key/gi, "API Key");

const localizedText = (key: string, source: string, language: Language) => {
  if (language === "zh-CN") return source;
  return normalizeTerms(translatedText[language]?.[key] ?? source);
};

export function productIntroductionFor(
  id: string,
  language: Language = "zh-CN",
): ProductIntroductionDocument | undefined {
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

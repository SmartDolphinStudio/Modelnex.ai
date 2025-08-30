import { useEffect, useId, useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "katex/dist/katex.min.css";
import type { DocumentBlock } from "./productIntroduction";

const mermaidEscape = (value: string) =>
  value.replace(/["[\]{}|<>]/g, "").replace(/\r?\n/g, " ");

const mathFormula = (
  formula: Extract<DocumentBlock, { type: "math" }>["formula"],
) => {
  switch (formula) {
    case "latency":
      return String.raw`\bar{L} = \frac{1}{n}\sum_{i=1}^{n}L_i`;
    case "weighted-score":
      return String.raw`S_w = \frac{\sum_{i=1}^{m}w_i s_i}{\sum_{i=1}^{m}w_i}`;
    case "availability":
      return String.raw`A = \left(1 - \frac{T_{\mathrm{unavailable}}}{T_{\mathrm{total}}}\right) \times 100\%`;
  }
};

export function StandardFormula({
  label,
  formula,
}: Extract<DocumentBlock, { type: "math" }>) {
  return (
    <section className="standard-formula" aria-label={label}>
      <h3>{label}</h3>
      <BlockMath math={mathFormula(formula)} />
    </section>
  );
}

export function MermaidFlow({
  title,
  nodes,
  loadingLabel = "Loading diagram...",
}: Extract<DocumentBlock, { type: "flow" }> & { loadingLabel?: string }) {
  const uniqueId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);
  const definition = useMemo(
    () => [
      "flowchart LR",
      ...nodes.map(
        (node, index) =>
          `N${index}[\"${mermaidEscape(node.label)}<br/>${mermaidEscape(node.detail)}\"]`,
      ),
      ...nodes.slice(0, -1).map((_, index) => `N${index} --> N${index + 1}`),
    ].join("\n"),
    [nodes],
  );

  useEffect(() => {
    let disposed = false;
    void import("mermaid")
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
          flowchart: { useMaxWidth: true, htmlLabels: false },
        });
        return mermaid.render(`flow-${uniqueId}`, definition);
      })
      .then((result) => {
        if (!disposed) setSvg(result.svg);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
    };
  }, [definition, uniqueId]);

  return (
    <section className="standard-flow" aria-label={title}>
      <h3>{title}</h3>
      {failed ? (
        <ol className="flow-fallback">
          {nodes.map((node) => (
            <li key={node.label}>
              <strong>{node.label}</strong>
              <span>{node.detail}</span>
            </li>
          ))}
        </ol>
      ) : svg ? (
        <div className="mermaid-canvas" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="flow-loading" aria-live="polite">{loadingLabel}</div>
      )}
    </section>
  );
}

const standardChartColors = ["#f4c74e", "#62c7bb", "#83a8f8", "#db8f6b"];

export function StandardChart({
  title,
  kind,
  values,
  primaryLabel = "Primary",
  secondaryLabel = "Secondary",
}: Extract<DocumentBlock, { type: "standard-chart" }> & {
  primaryLabel?: string;
  secondaryLabel?: string;
}) {
  const data = values.map((value) => ({
    name: value.label,
    value: value.value,
    secondary: value.secondary,
  }));

  return (
    <section className="standard-chart" aria-label={title}>
      <h3>{title}</h3>
      <div className="standard-chart-canvas">
        <ResponsiveContainer width="100%" height={280}>
          {kind === "line" ? (
            <LineChart data={data} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3b3730" />
              <XAxis dataKey="name" stroke="#b8b0a4" />
              <YAxis stroke="#b8b0a4" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" name={primaryLabel} stroke="#f4c74e" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="secondary" name={secondaryLabel} stroke="#62c7bb" strokeWidth={3} dot={false} />
            </LineChart>
          ) : kind === "bar" ? (
            <BarChart data={data} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3b3730" />
              <XAxis dataKey="name" stroke="#b8b0a4" />
              <YAxis stroke="#b8b0a4" />
              <Tooltip />
              <Bar dataKey="value" fill="#83a8f8" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={92} label>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={standardChartColors[index % standardChartColors.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

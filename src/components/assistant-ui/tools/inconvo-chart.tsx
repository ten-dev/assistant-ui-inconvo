"use client";

import { useMemo } from "react";
import { VegaEmbed as VegaLite } from "react-vega";
import type { VisualizationSpec } from "vega-embed";

import type {
  InconvoChartData,
  InconvoChartType,
  InconvoChartSpec,
} from "~/lib/inconvo/types";
import { buildChartPalette } from "~/components/assistant-ui/tools/inconvo-chart-colors";

interface InconvoChartProps {
  data?: InconvoChartData;
  spec?: InconvoChartSpec;
  variant?: InconvoChartType;
  xLabel?: string;
  yLabel?: string;
  title?: string;
}

export const InconvoChart = ({
  data,
  spec: providedSpec,
  variant = "bar",
  xLabel,
  yLabel,
  title,
}: InconvoChartProps) => {
  const tableData = useMemo(
    () =>
      data
        ? data.labels.flatMap((label, index) =>
            data.datasets.map((dataset) => ({
              label,
              series: dataset.name,
              value: dataset.values[index] ?? 0,
            })),
          )
        : [],
    [data],
  );

  const palette = useMemo(
    () => buildChartPalette(data?.datasets.length ?? 0),
    [data?.datasets.length],
  );

  const axisColor = "var(--muted-foreground)";

  const generatedSpec = useMemo<VisualizationSpec | null>(() => {
    if (!data) return null;

    const isLineChart = variant === "line";

    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: title ?? "Inconvo chart",
      background: "transparent",
      autosize: { type: "fit", contains: "padding" },
      width: "container",
      height: 380,
      padding: { left: 8, right: 12, top: 12, bottom: xLabel ? 56 : 28 },
      data: { values: tableData },
      mark: isLineChart
        ? {
            type: "line",
            interpolate: "monotone",
            point: { size: 60, filled: true, fill: "var(--card)" },
            strokeWidth: 2,
          }
        : {
            type: "bar",
            cornerRadiusEnd: 4,
          },
      encoding: {
        x: {
          field: "label",
          type: "ordinal",
          title: xLabel ?? null,
          axis: {
            labelAngle: -30,
            labelColor: axisColor,
            titleColor: axisColor,
            labelFontSize: 12,
            titleFontSize: 12,
            labelLimit: 160,
          },
        },
        y: {
          field: "value",
          type: "quantitative",
          title: yLabel ?? null,
          axis: {
            labelColor: axisColor,
            titleColor: axisColor,
            labelFontSize: 12,
            titleFontSize: 12,
            gridColor: "var(--border)",
            gridDash: [3, 3],
          },
        },
        color: {
          field: "series",
          type: "nominal",
          scale: { range: palette },
          legend: {
            title: null,
            orient: "top",
            labelColor: axisColor,
            titleColor: axisColor,
            labelFontSize: 12,
          },
        },
        tooltip: [
          { field: "label", type: "ordinal", title: xLabel ?? "Label" },
          { field: "series", type: "nominal", title: "Series" },
          { field: "value", type: "quantitative", title: yLabel ?? "Value" },
        ],
        ...(isLineChart
          ? {}
          : {
              xOffset: { field: "series" },
            }),
      },
      config: {
        view: { stroke: "var(--border)", strokeWidth: 1 },
        axis: {
          labelColor: axisColor,
          titleColor: axisColor,
          tickColor: axisColor,
          domainColor: axisColor,
        },
      },
    };
  }, [axisColor, data, palette, tableData, title, variant, xLabel, yLabel]);

  const resolvedSpec = (providedSpec ?? generatedSpec) as VisualizationSpec | null;
  if (!resolvedSpec) {
    return (
      <div className="text-sm text-muted-foreground">
        No chart data provided.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 text-foreground">
      <VegaLite spec={resolvedSpec} options={{ actions: false }} style={{ width: "100%" }} />
    </div>
  );
};

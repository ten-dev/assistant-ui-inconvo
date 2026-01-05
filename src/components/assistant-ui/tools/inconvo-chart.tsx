"use client";

import { useEffect, useMemo, useState } from "react";
import { VegaLite } from "react-vega";
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
  const [error, setError] = useState<string | null>(null);

  const tableData = useMemo(
    () =>
      data?.labels.flatMap((label, index) =>
        data.datasets.map((dataset) => ({
          label,
          series: dataset.name,
          value: dataset.values[index] ?? 0,
        }))
      ) ?? [],
    [data?.datasets, data?.labels]
  );

  const palette = useMemo(
    () => buildChartPalette(data?.datasets.length ?? 0),
    [data?.datasets.length]
  );

  const axisColor = "var(--muted-foreground)";

  const resolvedSpec = useMemo<VisualizationSpec | null>(() => {
    if (providedSpec) {
      return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        background: "transparent",
        autosize: { type: "fit", contains: "padding" },
        width: "container",
        ...providedSpec,
      } as VisualizationSpec;
    }

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
  }, [
    axisColor,
    data,
    palette,
    providedSpec,
    tableData,
    title,
    variant,
    xLabel,
    yLabel,
  ]);

  useEffect(() => {
    setError(null);
  }, [resolvedSpec]);

  const handleError = (err: Error) => {
    console.error("Vega-Lite render error:", err);
    setError(err.message);
  };

  if (!resolvedSpec) {
    return (
      <div className="text-sm text-muted-foreground">
        No chart data provided.
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Failed to render chart: {error}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 text-foreground">
      <VegaLite
        spec={resolvedSpec}
        actions={false}
        onError={handleError}
        style={{ width: "100%" }}
      />
    </div>
  );
};

"use client";

import { useEffect, useMemo, useState } from "react";
import { VegaLite } from "react-vega";
import type { VisualizationSpec } from "vega-embed";

import type {
  InconvoChartData,
  InconvoChartType,
  InconvoChartSpec,
} from "~/lib/inconvo/types";

interface InconvoChartProps {
  data?: InconvoChartData;
  spec?: InconvoChartSpec;
  variant?: InconvoChartType;
  xLabel?: string;
  yLabel?: string;
  title?: string;
}

export const InconvoChart = ({ spec: providedSpec }: InconvoChartProps) => {
  const [error, setError] = useState<string | null>(null);

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

    return null;
  }, [providedSpec]);

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

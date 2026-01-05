"use client";

import { useEffect, useMemo, useState } from "react";
import { VegaEmbed } from "react-vega";
import type { VisualizationSpec } from "vega-embed";

import type { InconvoChartSpec } from "~/lib/inconvo/types";

interface InconvoChartProps {
  spec?: InconvoChartSpec;
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

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Vega-Lite render error:", err);
    setError(message);
  };

  if (!resolvedSpec) {
    return (
      <div className="text-sm text-muted-foreground">
        No chart spec provided.
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
      <VegaEmbed
        spec={resolvedSpec}
        options={{ actions: false }}
        onError={handleError}
        style={{ width: "100%" }}
      />
    </div>
  );
};

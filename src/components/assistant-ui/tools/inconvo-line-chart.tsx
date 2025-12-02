"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Label,
  Legend,
} from "recharts";

import type { InconvoChartData } from "~/lib/inconvo/types";
import { buildGreyscalePalette } from "~/components/assistant-ui/tools/inconvo-chart-colors";

interface InconvoLineChartProps {
  data: InconvoChartData;
  xLabel?: string;
  yLabel?: string;
}

export const InconvoLineChart = ({
  data,
  xLabel,
  yLabel,
}: InconvoLineChartProps) => {
  const { resolvedTheme } = useTheme();

  const chartData = useMemo(() => {
    return data.labels.map((label, index) => {
      const row: { name: string; [key: string]: string | number } = {
        name: label,
      };
      data.datasets.forEach((dataset) => {
        row[dataset.name] = dataset.values[index];
      });
      return row;
    });
  }, [data]);

  const palette = useMemo(() => {
    const isDarkMode = resolvedTheme === "dark";
    return buildGreyscalePalette(data.datasets.length, isDarkMode);
  }, [data.datasets.length, resolvedTheme]);

  const axisColor = "var(--muted-foreground)";
  const textColor = "var(--foreground)";

  return (
    <div className="flex w-full flex-col gap-4 text-foreground">
      <ResponsiveContainer width="100%" height={400}>
        <RechartsLineChart
          data={chartData}
          margin={{ top: 20, right: 30, bottom: xLabel ? 80 : 40, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
            angle={-30}
            textAnchor="end"
            interval={data.labels.length > 12 ? "preserveStartEnd" : 0}
          >
            {xLabel ? (
              <Label
                position="bottom"
                offset={24}
                style={{
                  fill: axisColor,
                  textAnchor: "middle",
                }}
                value={xLabel}
              />
            ) : null}
          </XAxis>
          <YAxis
            width={80}
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
          >
            {yLabel ? (
              <Label
                angle={-90}
                position="insideLeft"
                style={{
                  fill: axisColor,
                  textAnchor: "middle",
                }}
                value={yLabel}
              />
            ) : null}
          </YAxis>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: textColor,
            }}
            labelStyle={{
              color: textColor,
              fontWeight: 600,
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{
              color: axisColor,
              paddingBottom: "4px",
            }}
          />
          {data.datasets.map((dataset, index) => {
            const stroke = palette[index] ?? "var(--chart-series-primary)";
            return (
              <Line
                key={dataset.name}
                type="monotone"
                dataKey={dataset.name}
                stroke={stroke}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2, stroke, fill: "var(--card)" }}
                activeDot={{ r: 5, strokeWidth: 2, stroke, fill: stroke }}
              />
            );
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

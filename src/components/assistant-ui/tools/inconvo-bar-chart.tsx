"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Label,
  Legend,
} from "recharts";

import type { InconvoChartData } from "~/lib/inconvo/types";

interface InconvoBarChartProps {
  data: InconvoChartData;
  xLabel?: string;
  yLabel?: string;
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const lightnessToGrayHex = (lightness: number) => {
  const channel = Math.round(clamp(lightness) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${channel}${channel}${channel}`;
};

const buildGreyscalePalette = (seriesCount: number, isDarkMode: boolean) => {
  if (seriesCount <= 0) return [];
  if (seriesCount === 1) {
    return [lightnessToGrayHex(isDarkMode ? 0.78 : 0.5)];
  }

  const start = isDarkMode ? 0.95 : 0.8;
  const end = isDarkMode ? 0.55 : 0.15;
  const step = (end - start) / (seriesCount - 1);

  return Array.from({ length: seriesCount }, (_, index) =>
    lightnessToGrayHex(start + step * index)
  );
};

export const InconvoBarChart = ({
  data,
  xLabel,
  yLabel,
}: InconvoBarChartProps) => {
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
        <RechartsBarChart
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
          {data.datasets.map((dataset, index) => (
            <Bar
              key={dataset.name}
              dataKey={dataset.name}
              fill={palette[index] ?? "var(--chart-series-primary)"}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

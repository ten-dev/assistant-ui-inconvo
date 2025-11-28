"use client";

import { useMemo } from "react";
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
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

export const InconvoBarChart = ({
  data,
  title,
  xLabel,
  yLabel,
}: InconvoBarChartProps) => {
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

  const palette = useMemo(
    () => [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ],
    [],
  );

  const axisColor = "var(--muted-foreground)";
  const textColor = "var(--foreground)";

  return (
    <div className="flex w-full flex-col gap-4 text-foreground">
      {title ? (
        <h3 className="text-lg font-semibold leading-snug text-foreground">
          {title}
        </h3>
      ) : null}

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
              fill={palette[index % palette.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

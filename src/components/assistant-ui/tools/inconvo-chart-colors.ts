const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const lightnessToGrayHex = (lightness: number) => {
  const channel = Math.round(clamp(lightness) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${channel}${channel}${channel}`;
};

export const buildGreyscalePalette = (
  seriesCount: number,
  isDarkMode: boolean,
) => {
  if (seriesCount <= 0) return [];
  if (seriesCount === 1) {
    return [lightnessToGrayHex(isDarkMode ? 0.78 : 0.5)];
  }

  const start = isDarkMode ? 0.95 : 0.8;
  const end = isDarkMode ? 0.55 : 0.15;
  const step = (end - start) / (seriesCount - 1);

  return Array.from({ length: seriesCount }, (_, index) =>
    lightnessToGrayHex(start + step * index),
  );
};

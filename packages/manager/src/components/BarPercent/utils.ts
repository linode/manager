import type { BarPercentProps } from './BarPercent';

export const getPercentage = (value: number, max: number) =>
  (Math.min(value, max) / max) * 100;

export const getCustomColor = (
  customColors: BarPercentProps['customColors'],
  percentage: number
) => {
  if (!customColors) {
    return undefined;
  }

  const color = customColors.find((color) => percentage >= color.percentage);
  return color?.color;
};

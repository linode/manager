import tokenUsageData from '../TokenUsageData.json';

import type { ChartPayload } from '../../Dashboard/UsageSection/chartUtils';

export const buildChartData = (): ChartPayload => {
  // Build series map: modelName -> values array with combined input+output
  const seriesMap = new Map<
    string,
    Array<{ date: string; time: string; value: number }>
  >();

  tokenUsageData.timePoints.forEach((timePoint) => {
    timePoint.models.forEach((model) => {
      if (!seriesMap.has(model.modelName)) {
        seriesMap.set(model.modelName, []);
      }
      seriesMap.get(model.modelName)!.push({
        date: timePoint.date,
        time: timePoint.time,
        value: model.input_tokens + model.output_tokens,
      });
    });
  });

  // Convert map to series array with combined tokens per model
  const allSeries = Array.from(seriesMap.entries()).map(
    ([modelName, values]) => ({
      id: modelName,
      label: modelName,
      values,
    })
  );

  return { series: allSeries };
};

export const buildSeriesColorIndices = (
  series: { id: string }[]
): Record<string, number> => {
  const indices: Record<string, number> = {};
  series.forEach((s, i) => {
    indices[s.id] = i;
  });
  return indices;
};

export type DataPoint = {
  date?: string;
  time: string;
  value: number;
  xAxisDate?: string;
};

export type DataSeries = {
  color?: string;
  id: string;
  label: string;
  values: DataPoint[];
};

export type ChartPayload = {
  series: DataSeries[];
};

export const filterChartPayloadBySeries = (
  data: ChartPayload,
  selectedSeriesId: string
): ChartPayload => {
  if (selectedSeriesId === 'all') {
    return data;
  }

  return {
    ...data,
    series: data.series.filter((series) => series.id === selectedSeriesId),
  };
};

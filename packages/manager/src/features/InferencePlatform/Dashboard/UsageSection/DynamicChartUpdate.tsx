import React from 'react';

import {
  StackedBarChart,
  type StackedBarChartProps,
} from 'src/components/StackedBarChart';

import { filterChartPayloadBySeries } from './chartUtils';

import type { ChartPayload, DataSeries } from './chartUtils';

type ManagedProps = 'data' | 'seriesColorIndices';

type DynamicChartUpdateProps = Omit<StackedBarChartProps, ManagedProps> & {
  chartComponent?: React.ComponentType<StackedBarChartProps>;
  data: ChartPayload;
  selectedSeriesId: string;
  seriesColorIndices?: Record<string, number>;
  updateIntervalMs?: number;
};

const DEFAULT_UPDATE_INTERVAL_MS = 15000;
const DEFAULT_START_DATE = '10/06/2026';

const cloneData = (data: ChartPayload): ChartPayload => ({
  series: data.series.map((series) => ({
    ...series,
    values: series.values.map((point) => ({ ...point })),
  })),
});

const getDeterministicIntInRange = (
  min: number,
  max: number,
  seedText: string
) => {
  if (max <= min) {
    return min;
  }

  const hash = seedText.split('').reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) % 104_729;
  }, 7);

  return min + (hash % (max - min + 1));
};

const formatDate = (day: number, month: number, year: number) => {
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
};

const parseDate = (date?: string) => {
  const [dayString, monthString, yearString] = (
    date ?? DEFAULT_START_DATE
  ).split('/');
  const day = Number.parseInt(dayString, 10);
  const month = Number.parseInt(monthString, 10);
  const year = Number.parseInt(yearString, 10);

  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
    return { day: 10, month: 6, year: 2026 };
  }

  return {
    day: Math.min(Math.max(day, 1), 31),
    month: Math.min(Math.max(month, 1), 12),
    year,
  };
};

const getNextDate = (date?: string) => {
  const { day, month, year } = parseDate(date);
  let nextDay = day + 1;
  let nextMonth = month;

  if (nextDay > 31) {
    nextDay = 1;
    nextMonth += 1;
  }

  if (nextMonth > 12) {
    nextMonth = 1;
  }

  return formatDate(nextDay, nextMonth, year);
};

const getNextDateAndTime = (date: string | undefined, time: string) => {
  const [hourString, minuteString = '00'] = time.split(':');
  const hour = Number.parseInt(hourString, 10);
  const normalizedDate = date ?? DEFAULT_START_DATE;

  if (Number.isNaN(hour)) {
    return {
      date: normalizedDate,
      time: `00:${minuteString}`,
    };
  }

  if (hour === 24) {
    return {
      date: getNextDate(normalizedDate),
      time: `00:${minuteString}`,
    };
  }

  if (hour >= 0 && hour < 24) {
    return {
      date: normalizedDate,
      time: `${String(hour + 1).padStart(2, '0')}:${minuteString}`,
    };
  }

  const normalizedHour = ((hour % 24) + 24) % 24;
  return {
    date: normalizedDate,
    time: `${String(normalizedHour + 1).padStart(2, '0')}:${minuteString}`,
  };
};

const rollSeriesForward = (series: DataSeries): DataSeries => {
  if (series.values.length === 0) {
    return series;
  }

  const shiftedValues = series.values.slice(1).map((value) => ({ ...value }));
  const tailSource =
    shiftedValues[shiftedValues.length - 1] ??
    series.values[series.values.length - 1];

  // Calculate the range from existing values to generate realistic new values
  const existingValues = series.values.map((v) => v.value);
  const minValue = Math.min(...existingValues);
  const maxValue = Math.max(...existingValues);

  const nextPointDateTime = getNextDateAndTime(
    tailSource.date,
    tailSource.time
  );

  // Generate a new value within the range of existing data
  const seed = `${nextPointDateTime.date}|${nextPointDateTime.time}|${series.id}`;
  const range = maxValue - minValue;
  const newValue = Math.floor(
    minValue + (getDeterministicIntInRange(0, 100, seed) / 100) * range * 1.2
  );

  const nextValues = [
    ...shiftedValues,
    {
      date: nextPointDateTime.date,
      time: nextPointDateTime.time,
      value: Math.max(1, newValue),
    },
  ];

  return {
    ...series,
    values: nextValues,
  };
};

export const DynamicChartUpdate = ({
  chartComponent = StackedBarChart,
  data,
  selectedSeriesId,
  seriesColorIndices,
  updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS,
  ...chartProps
}: DynamicChartUpdateProps) => {
  const [dynamicData, setDynamicData] = React.useState<ChartPayload>(() =>
    cloneData(data)
  );

  React.useEffect(() => {
    setDynamicData(cloneData(data));
  }, [data]);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDynamicData((previousData) => ({
        ...previousData,
        series: previousData.series.map(rollSeriesForward),
      }));
    }, updateIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [updateIntervalMs]);

  const filteredData = React.useMemo(
    () => filterChartPayloadBySeries(dynamicData, selectedSeriesId),
    [dynamicData, selectedSeriesId]
  );

  return React.createElement(chartComponent, {
    ...chartProps,
    data: filteredData,
    seriesColorIndices,
  });
};

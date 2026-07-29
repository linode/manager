import React from 'react';

import { getExtraPresets, isMSWEnabled } from 'src/dev-tools/utils';

import type {
  ChartPayload,
  DataSeries,
} from '../Dashboard/UsageSection/chartUtils';

type UsageDynamicData = {
  input: ChartPayload;
  output: ChartPayload;
  request: ChartPayload;
  total: ChartPayload;
};

type UsageDataContextType = {
  dynamicData: UsageDynamicData;
};

const UsageDataContext = React.createContext<undefined | UsageDataContextType>(
  undefined
);

type UsageDataProviderProps = {
  children: React.ReactNode;
  initialInputData: ChartPayload;
  initialOutputData: ChartPayload;
  initialRequestData: ChartPayload;
  initialTotalData: ChartPayload;
  updateIntervalMs?: number;
};

const DEFAULT_UPDATE_INTERVAL_MS = 5000;
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

const rollPayloadForward = (payload: ChartPayload): ChartPayload => ({
  ...payload,
  series: payload.series.map(rollSeriesForward),
});

export const UsageDataProvider = ({
  children,
  initialInputData,
  initialOutputData,
  initialRequestData,
  initialTotalData,
  updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS,
}: UsageDataProviderProps) => {
  // Check if Usage mock is enabled (evaluated at render time)
  const useMockAnimation =
    isMSWEnabled && getExtraPresets().includes('inferencePlatform:usage');

  const [dynamicData, setDynamicData] = React.useState<UsageDynamicData>(
    () => ({
      input: cloneData(initialInputData),
      output: cloneData(initialOutputData),
      request: cloneData(initialRequestData),
      total: cloneData(initialTotalData),
    })
  );

  // Update when API data changes (React Query refetch)
  React.useEffect(() => {
    setDynamicData({
      input: cloneData(initialInputData),
      output: cloneData(initialOutputData),
      request: cloneData(initialRequestData),
      total: cloneData(initialTotalData),
    });
  }, [
    initialInputData,
    initialOutputData,
    initialRequestData,
    initialTotalData,
  ]);

  // Animation interval - only runs when mock is enabled
  React.useEffect(() => {
    if (!useMockAnimation) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setDynamicData((prev) => ({
        input: rollPayloadForward(prev.input),
        output: rollPayloadForward(prev.output),
        request: rollPayloadForward(prev.request),
        total: rollPayloadForward(prev.total),
      }));
    }, updateIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [useMockAnimation, updateIntervalMs]);

  return (
    <UsageDataContext.Provider value={{ dynamicData }}>
      {children}
    </UsageDataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUsageData = () => {
  const context = React.useContext(UsageDataContext);
  if (!context) {
    throw new Error('useUsageData must be used within a UsageDataProvider');
  }
  return context.dynamicData;
};

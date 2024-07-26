import { convertData } from 'src/features/Longview/shared/formatters';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';

import type { TimeDuration } from '@linode/api-v4';
import type {
  StatWithDummyPoint,
  WithStartAndEnd,
} from 'src/features/Longview/request.types';

/**
 *
 * @returns an object that contains boolean property to check whether aclp is enabled or not
 */
export const useIsACLPEnabled = (): {
  isACLPEnabled: boolean;
} => {
  const { data: account, error } = useAccount();
  const flags = useFlags();

  if (error || !flags) {
    return { isACLPEnabled: false };
  }

  const hasAccountCapability = account?.capabilities?.includes('CloudPulse');
  const isFeatureFlagEnabled = flags.aclp?.enabled;

  const isACLPEnabled = Boolean(hasAccountCapability && isFeatureFlagEnabled);

  return { isACLPEnabled };
};

/**
 *
 * @param nonFormattedString input string that is to be formatted with first letter of each word capital
 * @returns the formatted string for the @nonFormattedString
 */
export const convertStringToCamelCasesWithSpaces = (
  nonFormattedString: string
): string => {
  return nonFormattedString
    ?.split(' ')
    .map((text) => text.charAt(0).toUpperCase() + text.slice(1))
    .join(' ');
};

export const createObjectCopy = <T>(object: T): T | null => {
  if (!object) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (e) {
    return null;
  }
};

/**
 *
 * @param timeDuration object according to which appropriate seconds values are calculated
 * @returns WithStartAndEnd object woth starting & ending second value for the @timeDuration
 */
export const convertTimeDurationToStartAndEndTimeRange = (
  timeDuration: TimeDuration
): WithStartAndEnd => {
  const startEnd: WithStartAndEnd = { end: 0, start: 0 };
  const nowInSeconds = Date.now() / 1000;
  startEnd.end = nowInSeconds;
  if (timeDuration.unit === 'hr') {
    startEnd.start = nowInSeconds - timeDuration.value * 60 * 60;
  }

  if (timeDuration.unit === 'min') {
    startEnd.start = nowInSeconds - timeDuration.value * 60;
  }

  if (timeDuration.unit === 'days') {
    startEnd.start = nowInSeconds - timeDuration.value * 24 * 60 * 60;
  }

  return startEnd;
};

/**
 *
 * @param data CloudPulseMetricData that has to be formatted
 * @param startTime start timestamp for the data
 * @param endTime end timestamp for the data
 * @returns formatted data based on the time range between @startTime & @endTime
 */
export const seriesDataFormatter = (
  data: [number, string][],
  startTime: number,
  endTime: number
): [number, null | number][] => {
  const formattedArray: StatWithDummyPoint[] = [];
  if (data && data.length > 0) {
    data?.forEach((element: [number, string]) => {
      const formattedPoint: StatWithDummyPoint = {
        x: Number(element[0]),
        y: element[1] ? Number(element[1]) : null,
      };
      formattedArray.push(formattedPoint);
    });
    return convertData(formattedArray, startTime, endTime);
  }

  return [];
};

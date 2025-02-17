import type { CPU, StatWithDummyPoint } from '../request.types';

// This formatting is from Classic
export const formatCPU = (n: number) => {
  // Have to safety check because LV API is unreliable
  if (typeof n !== 'number') {
    return 'No data';
  }
  const numDigits = n >= 1 || n <= 0.01 ? 0 : 2;
  return n.toFixed(numDigits) + '%';
};

/*
  The LV API does not provide proper time series data;
  only times for which the agent was collecting data
  have entries in the response (so if your Linode is 3 days
  old and you ask for graphs for the past year, the response
  will only have 3 days of data). We therefore need to pad the
  front of the response with an extra data point to force the x
  axis of each graph to show the requested time span.
  Using null as the y value makes the intervening section of the
  graph blank, which is the behavior we need.

  In order to determine whether or not we should add this dummy
  point, we calculate based on a 5 minute interval, since that
  is the interval at which Longview stats are returned (see below).

  EXAMPLE 1:

  I installed LV on my Linode 10 minutes ago. I ask for 30 minutes of data.
  The data series will look something like:
  [[<9 minutes ago>, Y], [<4 minutes ago>, Y]]
  So we add the [<30 minutes ago>, null] point at the beginning to
  force the X axis to start in the right place.

  EXAMPLE 2:

  My Linode has been turned on for 2 hours.
  If I request 30 minutes of data, I see a series like this:
  [[<27 minutes ago, Y], [<22 minutes ago, Y], [<17 minutes ago, Y], [<12 minutes ago, Y], [<7 minutes ago, Y], [<2 minutes ago, Y]]
  If I were to request an hour of data, I’d see that the next point is from 32 minutes ago.
  Without the check, we’d stick a null at 30 minutes ago, so it’d look like there was no data during that time.

  NOTE: The calculation below is using 5 minutes as the increment,
  since this seems to be the normal behavior, even when using
  an account with a Longview Pro subscription. If this
  check isn't done, we can end up with a gap at the
  front of the graph.

  This interval may not work in
  all cases, since data resolution is supposed to be 1/minute for Pro.
  We may have to adjust for this here, though on my test account this
  causes a break in the graph.
 */

/**
 *
 * @param data Object that matches with some Longview API Data. LongviewCPU for example
 * @param selectedStartTimeInSeconds epoch time in seconds *not milliseconds*
 * @param pathsToAddDataPointTo array of pathnames that you want to append a past datetime to
 *
 * @example
 *
 * pathMaybeAddDataInThePast<LongviewCPU>(
 *    { CPU: { cpu1: { user: [{x: 123, y: 123}], wait: [], system: [] } } },
 *    1572357700,
 *    [
 *      ['CPU', 'cpu1', 'user'],
 *      ['CPU', 'cpu1', 'wait'],
 *      ['CPU', 'cpu1', 'system']
 *    ]
 * )
 */
export const pathMaybeAddDataInThePast = <T extends CPU<'' | 'yAsNull'>>(
  data: T,
  selectedStartTimeInSeconds: number,
  pathsToAddDataPointTo: Array<keyof T>
): T => {
  /*
  iterate over all the paths and maybe add a dummy data point to the
  data set specified
  */
  const _data = structuredClone(data);

  pathsToAddDataPointTo.forEach((eachPath: keyof CPU) => {
    const arrayOfStats = data[eachPath] ?? [];
    const updatedData = maybeAddPastData(
      arrayOfStats,
      selectedStartTimeInSeconds
    );
    _data[eachPath] = updatedData;
  });

  return _data;
};

export const maybeAddPastData = (
  arrayOfStats: StatWithDummyPoint[],
  startTime: number
): StatWithDummyPoint[] => {
  const _data = structuredClone(arrayOfStats) as StatWithDummyPoint[];
  if ((arrayOfStats[0]?.x ?? 0) - startTime > 60 * 5) {
    _data.unshift({ x: startTime, y: null });
  }
  return _data;
};

export const convertData = (
  d: StatWithDummyPoint[],
  startTime: number,
  endTime: number,
  formatter?: (pt: null | number) => null | number
) => {
  /**
   * For any empty data series, instead of an empty array
   * (which would trigger default values for x axis ticks)
   * add dummy points at the start and end, so that the x axis
   * is displayed according to the selected time range.
   *
   * This is helpful for empty and loading states.
   */
  if (d.length === 0) {
    return [
      [startTime * 1000, null],
      [endTime * 1000, null],
    ] as [number, null | number][];
  }
  return maybeAddPastData(d, startTime).map(
    (thisPoint) =>
      [
        thisPoint.x * 1000,
        formatter ? formatter(thisPoint.y) : thisPoint.y,
      ] as [number, null | number]
  );
};

/**
 * Scale of memory data will vary, so we use this function
 * to run the data through readableBytes to determine
 * whether to show MB, KB, or GB.
 * @param value
 */
export const formatMemory = (value: null | number) => {
  if (value === null) {
    return value;
  }
  // x1024 bc the API returns data in KB
  return value * 1024;
};

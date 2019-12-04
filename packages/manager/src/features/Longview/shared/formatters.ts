import { clone, pathOr } from 'ramda';

import { Stat } from '../request.types';

// This formatting is from Classic
export const formatCPU = (n: number) => {
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
 * maybeAddDataPointInThePast(
 *    { CPU: { cpu1: { user: [{x: 123, y: 123}], wait: [], system: [] } } },
 *    1572357700,
 *    [
 *      ['CPU', 'cpu1', 'user'],
 *      ['CPU', 'cpu1', 'wait'],
 *      ['CPU', 'cpu1', 'system']
 *    ]
 * )
 */
export const maybeAddDataPointInThePast = <T extends {}>(
  data: T,
  selectedStartTimeInSeconds: number,
  pathsToAddDataPointTo: (string | number)[][]
): T => {
  const _data = clone(data);

  /*
    iterate over all the paths and maybe add a dummy data point to the
    data set specified
  */
  pathsToAddDataPointTo.forEach(eachPath => {
    const arrayOfStats = pathOr<Stat[]>([], eachPath, _data);

    if (
      pathOr(0, [0, 'x'], arrayOfStats) - selectedStartTimeInSeconds >
      60 * 5000
    ) {
      arrayOfStats.unshift({ x: selectedStartTimeInSeconds, y: null });
    }
  });

  return _data;
};

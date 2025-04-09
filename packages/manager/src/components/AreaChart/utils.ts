import { DateTime } from 'luxon';

import { roundTo } from 'src/utilities/roundTo';

import type { DataSet } from './AreaChart';
import type { LinodeNetworkTimeData } from './types';

export const getAccessibleTimestamp = (timestamp: number, timezone: string) =>
  DateTime.fromMillis(timestamp, { zone: timezone }).toLocaleString(
    DateTime.DATETIME_SHORT
  );

export const tooltipLabelFormatter = (timestamp: number, timezone: string) =>
  DateTime.fromMillis(timestamp, { zone: timezone }).toLocaleString(
    DateTime.DATETIME_MED
  );

export const tooltipValueFormatter = (value: number, unit: string) =>
  `${roundTo(value)} ${unit}`;

export const humanizeLargeData = (value: number) => {
  if (value >= 1000000000000) {
    return +(value / 1000000000000).toFixed(1) + 'T';
  }
  if (value >= 1000000000) {
    return +(value / 1000000000).toFixed(1) + 'B';
  }
  if (value >= 1000000) {
    return +(value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 100000) {
    return +(value / 1000).toFixed(0) + 'K';
  }
  if (value >= 1000) {
    return +(value / 1000).toFixed(1) + 'K';
  }
  return `${value}`;
};

/**
 *
 * @param data dataset for which ticks should be generated
 * @param timezone timezone applicable to timestamp in the dataset
 * @param tickCount number of ticks to be generated
 * @returns list of tickCount number of x-axis ticks
 */
export const generate12HourTicks = (
  data: DataSet[],
  timezone: string,
  tickCount: number
) => {
  if (data.length === 0) {
    return [];
  }

  // Get start and end time from data
  const startTime = data[0].timestamp;
  const endTime = data[data.length - 1].timestamp;

  if (tickCount === 1) {
    return [(startTime + endTime) / 2];
  }

  // Calculate duration in hours
  const duration = DateTime.fromMillis(endTime, { zone: timezone }).diff(
    DateTime.fromMillis(startTime, { zone: timezone }),
    'hours'
  ).hours;

  // Generate fixed number of ticks across the 12-hour period
  // Use 7 ticks (every 2 hours) to prevent overcrowding
  const interval = duration / (tickCount - 1);

  return Array.from({ length: tickCount }, (_, i) => {
    return DateTime.fromMillis(startTime, { zone: timezone })
      .plus({ hours: i * interval })
      .toMillis();
  });
};

export const timeData: LinodeNetworkTimeData[] = [
  {
    'Public Outbound Traffic': 5.434939999999999,
    timestamp: 1703304000000,
  },
  {
    'Public Outbound Traffic': 5.48299,
    timestamp: 1703311200000,
  },
  {
    'Public Outbound Traffic': 5.65558,
    timestamp: 1703318400000,
  },
  {
    'Public Outbound Traffic': 4.76884,
    timestamp: 1703325600000,
  },
  {
    'Public Outbound Traffic': 6.4184399999999995,
    timestamp: 1703332800000,
  },
  {
    'Public Outbound Traffic': 5.62116,
    timestamp: 1703340000000,
  },
  {
    'Public Outbound Traffic': 5.07858,
    timestamp: 1703347200000,
  },
  {
    'Public Outbound Traffic': 5.00401,
    timestamp: 1703354400000,
  },
  {
    'Public Outbound Traffic': 6.556310000000001,
    timestamp: 1703361600000,
  },
  {
    'Public Outbound Traffic': 5.0976300000000005,
    timestamp: 1703368800000,
  },
  {
    'Public Outbound Traffic': 4.8704,
    timestamp: 1703376000000,
  },
  {
    'Public Outbound Traffic': 5.489439999999999,
    timestamp: 1703383200000,
  },
  {
    'Public Outbound Traffic': 4.55057,
    timestamp: 1703390400000,
  },
  {
    'Public Outbound Traffic': 5.61529,
    timestamp: 1703397600000,
  },
  {
    'Public Outbound Traffic': 5.217,
    timestamp: 1703404800000,
  },
  {
    'Public Outbound Traffic': 5.11331,
    timestamp: 1703412000000,
  },
  {
    'Public Outbound Traffic': 5.46411,
    timestamp: 1703419200000,
  },
  {
    'Public Outbound Traffic': 4.7774399999999995,
    timestamp: 1703426400000,
  },
  {
    'Public Outbound Traffic': 5.02865,
    timestamp: 1703433600000,
  },
  {
    'Public Outbound Traffic': 6.32617,
    timestamp: 1703440800000,
  },
  {
    'Public Outbound Traffic': 4.93639,
    timestamp: 1703448000000,
  },
  {
    'Public Outbound Traffic': 5.915970000000001,
    timestamp: 1703455200000,
  },
  {
    'Public Outbound Traffic': 5.27855,
    timestamp: 1703462400000,
  },
  {
    'Public Outbound Traffic': 4.93147,
    timestamp: 1703469600000,
  },
  {
    'Public Outbound Traffic': 5.0265699999999995,
    timestamp: 1703476800000,
  },
  {
    'Public Outbound Traffic': 4.87472,
    timestamp: 1703484000000,
  },
  {
    'Public Outbound Traffic': 4.92317,
    timestamp: 1703491200000,
  },
  {
    'Public Outbound Traffic': 5.582979999999999,
    timestamp: 1703498400000,
  },
  {
    'Public Outbound Traffic': 4.59687,
    timestamp: 1703505600000,
  },
  {
    'Public Outbound Traffic': 5.0703000000000005,
    timestamp: 1703512800000,
  },
  {
    'Public Outbound Traffic': 5.48172,
    timestamp: 1703520000000,
  },
  {
    'Public Outbound Traffic': 5.71833,
    timestamp: 1703527200000,
  },
  {
    'Public Outbound Traffic': 5.80666,
    timestamp: 1703534400000,
  },
  {
    'Public Outbound Traffic': 7.650729999999999,
    timestamp: 1703541600000,
  },
  {
    'Public Outbound Traffic': 6.09863,
    timestamp: 1703548800000,
  },
  {
    'Public Outbound Traffic': 4.88399,
    timestamp: 1703556000000,
  },
  {
    'Public Outbound Traffic': 6.38346,
    timestamp: 1703563200000,
  },
  {
    'Public Outbound Traffic': 5.52181,
    timestamp: 1703570400000,
  },
  {
    'Public Outbound Traffic': 6.409890000000001,
    timestamp: 1703577600000,
  },
  {
    'Public Outbound Traffic': 6.24504,
    timestamp: 1703584800000,
  },
  {
    'Public Outbound Traffic': 6.706390000000001,
    timestamp: 1703592000000,
  },
  {
    'Public Outbound Traffic': 6.55377,
    timestamp: 1703599200000,
  },
  {
    'Public Outbound Traffic': 5.45406,
    timestamp: 1703606400000,
  },
  {
    'Public Outbound Traffic': 5.48203,
    timestamp: 1703613600000,
  },
  {
    'Public Outbound Traffic': 6.31843,
    timestamp: 1703620800000,
  },
  {
    'Public Outbound Traffic': 5.257149999999999,
    timestamp: 1703628000000,
  },
  {
    'Public Outbound Traffic': 5.693689999999999,
    timestamp: 1703635200000,
  },
  {
    'Public Outbound Traffic': 6.15741,
    timestamp: 1703642400000,
  },
  {
    'Public Outbound Traffic': 6.1616,
    timestamp: 1703649600000,
  },
  {
    'Public Outbound Traffic': 5.59863,
    timestamp: 1703656800000,
  },
  {
    'Public Outbound Traffic': 5.09122,
    timestamp: 1703664000000,
  },
  {
    'Public Outbound Traffic': 5.93977,
    timestamp: 1703671200000,
  },
  {
    'Public Outbound Traffic': 5.08668,
    timestamp: 1703678400000,
  },
  {
    'Public Outbound Traffic': 6.441350000000001,
    timestamp: 1703685600000,
  },
  {
    'Public Outbound Traffic': 5.36822,
    timestamp: 1703692800000,
  },
  {
    'Public Outbound Traffic': 28.10246,
    timestamp: 1703700000000,
  },
  {
    'Public Outbound Traffic': 5.84647,
    timestamp: 1703707200000,
  },
  {
    'Public Outbound Traffic': 5.9009,
    timestamp: 1703714400000,
  },
  {
    'Public Outbound Traffic': 5.97372,
    timestamp: 1703721600000,
  },
  {
    'Public Outbound Traffic': 7.28458,
    timestamp: 1703728800000,
  },
  {
    'Public Outbound Traffic': 6.96537,
    timestamp: 1703736000000,
  },
  {
    'Public Outbound Traffic': 4.5504,
    timestamp: 1703743200000,
  },
  {
    'Public Outbound Traffic': 4.5921,
    timestamp: 1703750400000,
  },
  {
    'Public Outbound Traffic': 6.516850000000001,
    timestamp: 1703757600000,
  },
  {
    'Public Outbound Traffic': 5.257359999999999,
    timestamp: 1703764800000,
  },
  {
    'Public Outbound Traffic': 5.79805,
    timestamp: 1703772000000,
  },
  {
    'Public Outbound Traffic': 5.2665,
    timestamp: 1703779200000,
  },
  {
    'Public Outbound Traffic': 6.34178,
    timestamp: 1703786400000,
  },
  {
    'Public Outbound Traffic': 5.37263,
    timestamp: 1703793600000,
  },
  {
    'Public Outbound Traffic': 6.46444,
    timestamp: 1703800800000,
  },
  {
    'Public Outbound Traffic': 5.16033,
    timestamp: 1703808000000,
  },
  {
    'Public Outbound Traffic': 4.85757,
    timestamp: 1703815200000,
  },
  {
    'Public Outbound Traffic': 6.5664299999999995,
    timestamp: 1703822400000,
  },
  {
    'Public Outbound Traffic': 6.73556,
    timestamp: 1703829600000,
  },
  {
    'Public Outbound Traffic': 5.29416,
    timestamp: 1703836800000,
  },
  {
    'Public Outbound Traffic': 5.54825,
    timestamp: 1703844000000,
  },
  {
    'Public Outbound Traffic': 5.0805,
    timestamp: 1703851200000,
  },
  {
    'Public Outbound Traffic': 6.29611,
    timestamp: 1703858400000,
  },
  {
    'Public Outbound Traffic': 5.98415,
    timestamp: 1703865600000,
  },
  {
    'Public Outbound Traffic': 6.11128,
    timestamp: 1703872800000,
  },
  {
    'Public Outbound Traffic': 6.23872,
    timestamp: 1703880000000,
  },
  {
    'Public Outbound Traffic': 5.773029999999999,
    timestamp: 1703887200000,
  },
  {
    'Public Outbound Traffic': 6.229100000000001,
    timestamp: 1703894400000,
  },
  {
    'Public Outbound Traffic': 7.26283,
    timestamp: 1703901600000,
  },
  {
    'Public Outbound Traffic': 4.83416,
    timestamp: 1703908800000,
  },
  {
    'Public Outbound Traffic': 6.2334700000000005,
    timestamp: 1703916000000,
  },
  {
    'Public Outbound Traffic': 5.019939999999999,
    timestamp: 1703923200000,
  },
  {
    'Public Outbound Traffic': 5.516310000000001,
    timestamp: 1703930400000,
  },
  {
    'Public Outbound Traffic': 6.84012,
    timestamp: 1703937600000,
  },
  {
    'Public Outbound Traffic': 4.83355,
    timestamp: 1703944800000,
  },
  {
    'Public Outbound Traffic': 5.28805,
    timestamp: 1703952000000,
  },
  {
    'Public Outbound Traffic': 5.223,
    timestamp: 1703959200000,
  },
  {
    'Public Outbound Traffic': 5.01722,
    timestamp: 1703966400000,
  },
  {
    'Public Outbound Traffic': 4.8092299999999994,
    timestamp: 1703973600000,
  },
  {
    'Public Outbound Traffic': 5.91444,
    timestamp: 1703980800000,
  },
  {
    'Public Outbound Traffic': 5.9965399999999995,
    timestamp: 1703988000000,
  },
  {
    'Public Outbound Traffic': 5.3739799999999995,
    timestamp: 1703995200000,
  },
  {
    'Public Outbound Traffic': 5.932720000000001,
    timestamp: 1704002400000,
  },
  {
    'Public Outbound Traffic': 5.38283,
    timestamp: 1704009600000,
  },
  {
    'Public Outbound Traffic': 6.44168,
    timestamp: 1704016800000,
  },
  {
    'Public Outbound Traffic': 4.90296,
    timestamp: 1704024000000,
  },
  {
    'Public Outbound Traffic': 4.883109999999999,
    timestamp: 1704031200000,
  },
  {
    'Public Outbound Traffic': 5.21804,
    timestamp: 1704038400000,
  },
  {
    'Public Outbound Traffic': 5.63115,
    timestamp: 1704045600000,
  },
  {
    'Public Outbound Traffic': 6.74491,
    timestamp: 1704052800000,
  },
  {
    'Public Outbound Traffic': 5.04914,
    timestamp: 1704060000000,
  },
  {
    'Public Outbound Traffic': 5.44395,
    timestamp: 1704067200000,
  },
  {
    'Public Outbound Traffic': 4.781350000000001,
    timestamp: 1704074400000,
  },
  {
    'Public Outbound Traffic': 5.3388100000000005,
    timestamp: 1704081600000,
  },
  {
    'Public Outbound Traffic': 5.9689499999999995,
    timestamp: 1704088800000,
  },
  {
    'Public Outbound Traffic': 5.15655,
    timestamp: 1704096000000,
  },
  {
    'Public Outbound Traffic': 6.12438,
    timestamp: 1704103200000,
  },
  {
    'Public Outbound Traffic': 4.669560000000001,
    timestamp: 1704110400000,
  },
  {
    'Public Outbound Traffic': 4.63611,
    timestamp: 1704117600000,
  },
  {
    'Public Outbound Traffic': 5.66633,
    timestamp: 1704124800000,
  },
  {
    'Public Outbound Traffic': 5.86619,
    timestamp: 1704132000000,
  },
  {
    'Public Outbound Traffic': 5.7318500000000006,
    timestamp: 1704139200000,
  },
  {
    'Public Outbound Traffic': 5.75463,
    timestamp: 1704146400000,
  },
  {
    'Public Outbound Traffic': 5.652810000000001,
    timestamp: 1704153600000,
  },
  {
    'Public Outbound Traffic': 5.0788400000000005,
    timestamp: 1704160800000,
  },
  {
    'Public Outbound Traffic': 6.32605,
    timestamp: 1704168000000,
  },
  {
    'Public Outbound Traffic': 9.19674,
    timestamp: 1704175200000,
  },
  {
    'Public Outbound Traffic': 10.7236,
    timestamp: 1704182400000,
  },
  {
    'Public Outbound Traffic': 11.021540000000002,
    timestamp: 1704189600000,
  },
  {
    'Public Outbound Traffic': 8.08084,
    timestamp: 1704196800000,
  },
  {
    'Public Outbound Traffic': 5.6375,
    timestamp: 1704204000000,
  },
];

export const customLegendData = [
  [1703304000000, 5.434939999999999],
  [1703311200000, 5.48299],
  [1703318400000, 5.65558],
  [1703325600000, 4.76884],
  [1703332800000, 6.4184399999999995],
  [1703340000000, 5.62116],
  [1703347200000, 5.07858],
  [1703354400000, 5.00401],
  [1703361600000, 6.556310000000001],
  [1703368800000, 5.0976300000000005],
  [1703376000000, 4.8704],
  [1703383200000, 5.489439999999999],
  [1703390400000, 4.55057],
  [1703397600000, 5.61529],
  [1703404800000, 5.217],
  [1703412000000, 5.11331],
  [1703419200000, 5.46411],
  [1703426400000, 4.7774399999999995],
  [1703433600000, 5.02865],
  [1703440800000, 6.32617],
  [1703448000000, 4.93639],
  [1703455200000, 5.915970000000001],
  [1703462400000, 5.27855],
  [1703469600000, 4.93147],
  [1703476800000, 5.0265699999999995],
  [1703484000000, 4.87472],
  [1703491200000, 4.92317],
  [1703498400000, 5.582979999999999],
  [1703505600000, 4.59687],
  [1703512800000, 5.0703000000000005],
  [1703520000000, 5.48172],
  [1703527200000, 5.71833],
  [1703534400000, 5.80666],
  [1703541600000, 7.650729999999999],
  [1703548800000, 6.09863],
  [1703556000000, 4.88399],
  [1703563200000, 6.38346],
  [1703570400000, 5.52181],
  [1703577600000, 6.409890000000001],
  [1703584800000, 6.24504],
  [1703592000000, 6.706390000000001],
  [1703599200000, 6.55377],
  [1703606400000, 5.45406],
  [1703613600000, 5.48203],
  [1703620800000, 6.31843],
  [1703628000000, 5.257149999999999],
  [1703635200000, 5.693689999999999],
  [1703642400000, 6.15741],
  [1703649600000, 6.1616],
  [1703656800000, 5.59863],
  [1703664000000, 5.09122],
  [1703671200000, 5.93977],
  [1703678400000, 5.08668],
  [1703685600000, 6.441350000000001],
  [1703692800000, 5.36822],
  [1703700000000, 28.10246],
  [1703707200000, 5.84647],
  [1703714400000, 5.9009],
  [1703721600000, 5.97372],
  [1703728800000, 7.28458],
  [1703736000000, 6.96537],
  [1703743200000, 4.5504],
  [1703750400000, 4.5921],
  [1703757600000, 6.516850000000001],
  [1703764800000, 5.257359999999999],
  [1703772000000, 5.79805],
  [1703779200000, 5.2665],
  [1703786400000, 6.34178],
  [1703793600000, 5.37263],
  [1703800800000, 6.46444],
  [1703808000000, 5.16033],
  [1703815200000, 4.85757],
  [1703822400000, 6.5664299999999995],
  [1703829600000, 6.73556],
  [1703836800000, 5.29416],
  [1703844000000, 5.54825],
  [1703851200000, 5.0805],
  [1703858400000, 6.29611],
  [1703865600000, 5.98415],
  [1703872800000, 6.11128],
  [1703880000000, 6.23872],
  [1703887200000, 5.773029999999999],
  [1703894400000, 6.229100000000001],
  [1703901600000, 7.26283],
  [1703908800000, 4.83416],
  [1703916000000, 6.2334700000000005],
  [1703923200000, 5.019939999999999],
  [1703930400000, 5.516310000000001],
  [1703937600000, 6.84012],
  [1703944800000, 4.83355],
  [1703952000000, 5.28805],
  [1703959200000, 5.223],
  [1703966400000, 5.01722],
  [1703973600000, 4.8092299999999994],
  [1703980800000, 5.91444],
  [1703988000000, 5.9965399999999995],
  [1703995200000, 5.3739799999999995],
  [1704002400000, 5.932720000000001],
  [1704009600000, 5.38283],
  [1704016800000, 6.44168],
  [1704024000000, 4.90296],
  [1704031200000, 4.883109999999999],
  [1704038400000, 5.21804],
  [1704045600000, 5.63115],
  [1704052800000, 6.74491],
  [1704060000000, 5.04914],
  [1704067200000, 5.44395],
  [1704074400000, 4.781350000000001],
  [1704081600000, 5.3388100000000005],
  [1704088800000, 5.9689499999999995],
  [1704096000000, 5.15655],
  [1704103200000, 6.12438],
  [1704110400000, 4.669560000000001],
  [1704117600000, 4.63611],
  [1704124800000, 5.66633],
  [1704132000000, 5.86619],
  [1704139200000, 5.7318500000000006],
  [1704146400000, 5.75463],
  [1704153600000, 5.652810000000001],
  [1704160800000, 5.0788400000000005],
  [1704168000000, 6.32605],
  [1704175200000, 9.19674],
  [1704182400000, 10.7236],
  [1704189600000, 11.021540000000002],
  [1704196800000, 8.08084],
  [1704204000000, 5.6375],
];

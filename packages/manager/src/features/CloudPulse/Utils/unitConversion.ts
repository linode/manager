import { roundTo } from 'src/utilities/roundTo';

const supportedUnits = {
  B: 'Bytes',
  Bps: 'Bps',
  GB: 'GB',
  GBps: 'GBps',
  Gb: 'Gb',
  Gbps: 'Gbps',
  KB: 'KB',
  KBps: 'KBps',
  Kb: 'Kb',
  Kbps: 'Kbps',
  MB: 'MB',
  MBps: 'MBps',
  Mb: 'Mb',
  Mbps: 'Mbps',
  PB: 'PB',
  PBps: 'PBps',
  Pb: 'Pb',
  Pbps: 'Pbps',
  TB: 'TB',
  TBps: 'TBps',
  Tb: 'Tb',
  Tbps: 'Tbps',
  b: 'bits',
  bps: 'bps',
  d: 'd',
  h: 'h',
  m: 'mo',
  min: 'min',
  ms: 'ms',
  s: 's',
  w: 'wk',
  y: 'yr',
};

const timeUnits = ['d', 'h', 'm', 'min', 'ms', 's', 'w', 'y'];

/**
 * Multipliers to convert the value of particular unit type to its minimum possible unit.
 * Ex: For time unit, minimum unit is ms (millisecond) & if value is in minutes then will multiply by 60000 to convert into ms or vice-versa
 */
const multiplier: { [label: string]: number } = {
  B: 1,
  Bps: 1,
  GB: Math.pow(2, 30),
  GBps: Math.pow(2, 30),
  Gb: 1e9,
  Gbps: 1e9,
  KB: Math.pow(2, 10),
  KBps: Math.pow(2, 10),
  Kb: 1e3,
  Kbps: 1e3,
  MB: Math.pow(2, 20),
  MBps: Math.pow(2, 20),
  Mb: 1e6,
  Mbps: 1e6,
  PB: Math.pow(2, 50),
  PBps: Math.pow(2, 50),
  Pb: 1e15,
  Pbps: 1e15,
  TB: Math.pow(2, 40),
  TBps: Math.pow(2, 40),
  Tb: 1e12,
  Tbps: 1e12,
  b: 1,
  bps: 1,
  d: 86400000,
  h: 36000000,
  m: 2592000000,
  min: 60000,
  ms: 1,
  s: 1000,
  w: 604800000,
  y: 31536000000,
};

/**
 *
 * @param value bit value based on which maximum possible unit will be generated
 * @returns maximum possible rolled up unit for the input bit value
 */
export const generateUnitByBitValue = (value: number): string => {
  if (value < multiplier.Kb) {
    return 'b';
  }
  if (value < multiplier.Mb) {
    return 'Kb';
  }
  if (value < multiplier.Gb) {
    return 'Mb';
  }
  if (value < multiplier.Tb) {
    return 'Gb';
  }
  if (value < multiplier.Pb) {
    return 'Tb';
  }
  return 'Pb';
};

/**
 *
 * @param value byte value based on which maximum possible unit will be generated
 * @returns maximum possible rolled up unit for the input byte value
 */
export const generateUnitByByteValue = (value: number): string => {
  if (value < multiplier.KB) {
    return 'B';
  }
  if (value < multiplier.MB) {
    return 'KB';
  }
  if (value < multiplier.GB) {
    return 'MB';
  }
  if (value < multiplier.TB) {
    return 'GB';
  }
  if (value < multiplier.PB) {
    return 'TB';
  }
  return 'PB';
};

/**
 *
 * @param value time value based on which maximum possible unit will be generated
 * @returns maximum possible rolled up unit for the input time value
 */
export const generateUnitByTimeValue = (value: number): string => {
  if (value < multiplier.s) {
    return 'ms';
  }
  if (value < multiplier.min) {
    return 's';
  }
  if (value < multiplier.h) {
    return 'min';
  }
  if (value < multiplier.d) {
    return 'h';
  }
  if (value < multiplier.w) {
    return 'd';
  }
  if (value < multiplier.m) {
    return 'w';
  }
  if (value < multiplier.y) {
    return 'm';
  }
  return 'y';
};

/**
 *
 * @param value bit value to be rolled up based on maxUnit
 * @param maxUnit maximum possible unit based on which value will be rolled up
 * @returns rolled up value based on maxUnit
 */
export const convertValueToUnit = (value: number, maxUnit: string) => {
  const convertingValue = multiplier[maxUnit] ?? 1;

  if (convertingValue === 1) {
    return roundTo(value);
  }
  return roundTo(value / convertingValue);
};

/**
 *
 * @param value bits or bytes value to be rolled up to highest possible unit according to base unit.
 * @param baseUnit bits or bytes unit depends on which unit will be generated for value.
 * @returns formatted string for the value rolled up to higher possible unit according to base unit.
 */
export const formatToolTip = (value: number, baseUnit: string): string => {
  const unit = generateCurrentUnit(baseUnit);
  let generatedUnit = baseUnit;
  if (unit.endsWith('b') || unit.endsWith('bps')) {
    generatedUnit = generateUnitByBitValue(value);
  } else if (unit.endsWith('B') || unit.endsWith('Bps')) {
    generatedUnit = generateUnitByByteValue(value);
  } else if (timeUnits.includes(unit)) {
    generatedUnit = generateUnitByTimeValue(value);
  }
  const convertedValue = convertValueToUnit(value, generatedUnit);

  return `${roundTo(convertedValue)} ${generatedUnit}${
    unit.endsWith('ps') ? '/s' : ''
  }`;
};

/**
 *
 * @param value bits or bytes value for which unit to be generate
 * @param baseUnit bits or bytes unit depends on which unit will be generated for value
 * @returns Unit object if base unit is bits or bytes otherwise undefined
 */
export const generateUnitByBaseUnit = (
  value: number,
  baseUnit: string
): string => {
  const unit = generateCurrentUnit(baseUnit);
  let generatedUnit = baseUnit;
  if (unit.endsWith('b') || unit.endsWith('bps')) {
    generatedUnit = generateUnitByBitValue(value);
  } else if (unit.endsWith('B') || unit.endsWith('Bps')) {
    generatedUnit = generateUnitByByteValue(value);
  } else if (timeUnits.includes(unit)) {
    generatedUnit = generateUnitByTimeValue(value);
  }
  return generatedUnit;
};

/**
 *
 * @param baseUnit unit received from configuration
 * @returns current unit based on the supported units mapping
 */
export const generateCurrentUnit = (baseUnit: string): string => {
  let unit: string = baseUnit;

  for (const [key, value] of Object.entries(supportedUnits)) {
    if (value === baseUnit) {
      unit = key;
      break;
    }
  }

  return unit;
};

/**
 *
 * @param data data that is to be transformed based on baseUnit
 * @param baseUnit baseUnit for the data
 * @returns transformed data based on the base unit
 */
export const transformData = (
  data: [number, string][],
  baseUnit: string
): [number, number][] => {
  const unit: string = generateCurrentUnit(baseUnit);

  return data.map((d) => [
    d[0],
    d[1] !== null ? Number(d[1]) * (multiplier[unit] ?? 1) : d[1],
  ]);
};

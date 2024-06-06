export type Unit = 'Gb' | 'Kb' | 'Mb' | 'b';

/**
 * converts bytes to either Kb (Kilobits) or Mb (Megabits) or Gb (Gigabits)
 * depending on if the Kilobit conversion exceeds 1000.
 *
 * @param networkUsedInBytes inbound and outbound traffic in bytes
 */
export const generateUnitByByteValue = (networkUsedInBytes: number): Unit => {
  const networkUsedToKilobits = (networkUsedInBytes * 8) / 1000;
  if (networkUsedToKilobits <= 1) {
    return 'b';
  } else if (networkUsedToKilobits <= 1000) {
    return 'Kb';
  } else if (networkUsedToKilobits <= 1000000) {
    return 'Mb';
  } else {
    return 'Gb';
  }
};

export const convertBytesToUnit = (valueInBits: number, maxUnit: Unit) => {
  if (maxUnit === 'Gb') {
    return valueInBits / Math.pow(1000, 3);
  } else if (maxUnit === 'Mb') {
    return valueInBits / Math.pow(1000, 2);
  } else if (maxUnit === 'Kb') {
    return valueInBits / 1000;
  } else {
    return Math.round(valueInBits);
  }
};

export const formatToolTip = (valueInBytes: number) => {
  const _unit = generateUnitByByteValue(valueInBytes);

  const converted = convertBytesToUnit(valueInBytes * 8, _unit);

  return `${Math.round(converted * 100) / 100} ${_unit}`;
};

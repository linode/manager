export type NetworkUnit = 'b' | 'Kb' | 'Mb' | 'Gb'

/**
 * converts bytes to either Kb (Kilobits) or Mb (Megabits) or Gb (Gigabits)
 * depending on if the Kilobit conversion exceeds 1000.
 *
 * @param networkUsedInBytes inbound and outbound traffic in bytes
 */
export const generateNetworkUnits = (
    networkUsedInBytes: number
  ): NetworkUnit => {
    const networkUsedToKilobits = (networkUsedInBytes * 8) / 1000;
    if (networkUsedToKilobits <= 1) {
      return 'b';
    } else if (networkUsedToKilobits <= 1000) {
      return 'Kb';
    } else if(networkUsedToKilobits <= 1000000) {
      return 'Mb';
    }else{
        return 'Gb';
    }
  };



export const convertNetworkToUnit = (
    valueInBits: number,
    maxUnit: NetworkUnit
  ) => {
    if(maxUnit === "Gb"){
        return valueInBits/Math.pow(1000, 3);
    }
    else if (maxUnit === 'Mb') {
      // If the unit we're using for the graph is Mb, return the output in Mb.
      // eslint-disable-next-line
       return valueInBits / Math.pow(1000, 2);
    } else if (maxUnit === 'Kb') {
      // If the unit we're using for the graph is Kb, return the output in Kb.
      // eslint-disable-next-line
      return valueInBits / 1000;

    } else {
      // Unit is 'b' so just return the unformatted value, rounded to the nearest bit.
      return Math.round(valueInBits);
    }
  };


  export const formatNetworkTooltip = (valueInBytes: number) => {
    const _unit = generateNetworkUnits(valueInBytes);
    const converted = convertNetworkToUnit(valueInBytes * 8, _unit);
    return `${Math.round(converted * 100) / 100} ${_unit}`;
  };
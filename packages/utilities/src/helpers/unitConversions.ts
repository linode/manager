export const convertMegabytesTo = (data: number, removeDecimals?: boolean) => {
  // API v4 always returns nodebalancer transfer in MB, so we want to clean it up if it's too
  // big or too small
  const gb = 1073741824;
  const mb = 1048576;
  const kb = 1024;
  const totalToBytes = data * 1024 * 1024; // convert the MB to Bytes
  if (totalToBytes >= gb) {
    // convert bytes to GB
    return removeDecimals
      ? `${totalToBytes / gb} GB`
      : `${(totalToBytes / gb).toFixed(2)} GB`;
  }
  if (totalToBytes >= mb) {
    // convert bytes to MB
    return `${(((totalToBytes / mb) * 100) / 100).toFixed(2)} MB`;
  }
  if (totalToBytes >= kb) {
    // convert bytes to KB
    return `${(((totalToBytes / kb) * 100) / 100).toFixed(2)} KB`;
  }
  return `${totalToBytes} bytes`;
};

/**
 * readableBytes()
 *
 * Returns a human-readable version of the byte value passed in.
 *
 * Example: readableBytes(2097152) --> { value: 2, unit: 'MB', formatted: '2 MB }
 *
 * Value and unit are returned separately for flexibility of use.
 *
 * Example options:
 * { round: 2 } // always round to 2 places
 * { round: { MB: 1, GB: 2 } } // if the return value is in MB, round to 1 place, otherwise round to 2 places.
 * { unit: 'MB' } // give the return value in GB
 * { maxUnit: 'GB' } // return values up to GB, i.e. never return TB or higher
 * { unitLabels: { bytes: 'B' } } // use "B" instead of the default "bytes" unit label
 */
export interface ReadableBytesOptions {
  base10?: boolean;
  handleNegatives?: boolean;
  maxUnit?: StorageSymbol;
  round?: number | Partial<Record<StorageSymbol, number>>;
  unit?: StorageSymbol;
  unitLabels?: Partial<Record<StorageSymbol, string>>;
}

export type StorageSymbol = 'byte' | 'bytes' | 'GB' | 'KB' | 'MB' | 'TB';

// This code inspired by: https://ourcodeworld.com/articles/read/713/converting-bytes-to-human-readable-values-kb-mb-gb-tb-pb-eb-zb-yb-with-javascript

/**
 * Converts raw bytes to human-readable format using base2 calculations (1024-based)
 * while displaying using common units (KB/MB/GB/TB).
 *
 * IMPORTANT: We intentionally use base2 calculations (1024 bytes = 1 KB) even though
 * we display using traditional storage units. This aligns with industry practice. Internally these represent GiB, TiB, PiB values
 * despite the displayed labels.
 *
 * To use base10 calculations (1000-based), set the base10 option to true.
 * By default, calculations use base2 (1024-based).
 *
 * See: https://techdocs.akamai.com/cloud-computing/docs/understanding-how-billing-works#storage-units
 *
 * @param num - The number of bytes to convert.
 * @param options - Options for the conversion.
 * @returns An object containing the formatted value, unit, and value.
 */
export const readableBytes = (
  num: number,
  options: ReadableBytesOptions = {},
) => {
  // These are the units Classic uses. This can easily be extended –
  // just keep adding to this array and the corresponding interface.
  const storageUnits: StorageSymbol[] = ['bytes', 'KB', 'MB', 'GB', 'TB'];

  // If we've been given custom unit labels, make the substitution here.
  if (options.unitLabels) {
    Object.keys(options.unitLabels).forEach((originalLabel) => {
      const label = originalLabel as StorageSymbol;
      const idx = storageUnits.indexOf(label);
      if (idx > -1) {
        // The TS compiler wasn't aware of the null check above, so I added
        // the non-null assertion operator on options.unitLabels.
        storageUnits[idx] = options.unitLabels![label] as StorageSymbol;
      }
    });
  }

  // If the value is 0 or invalid, go ahead and return because the subsequent math won't work out
  if (
    num === 0 ||
    (options.handleNegatives === false && num < 0) ||
    typeof num !== 'number'
  ) {
    return {
      formatted: `0 ${storageUnits[0]}`,
      unit: storageUnits[0],
      value: 0,
    };
  }

  // If the value is a negative number, we're going to need flip
  // the sign, do the math, then add the sign back at the end.
  const isNegative = num < 0;
  if (isNegative) {
    num = -num;
  }

  // If no maxUnit is provided, default to the highest unit
  const power = determinePower(num, storageUnits, {
    ...options,
    maxUnit: options.maxUnit ?? storageUnits[storageUnits.length - 1],
  });

  const multiplier = options.base10 ? 1000 : 1024;

  // Some other magic to get the human-readable version
  const result = num / Math.max(Math.pow(multiplier, power), 1);
  const unit = storageUnits[power] || storageUnits[0];
  const decimalPlaces = determineDecimalPlaces(result, unit, options);

  const value = parseFloat(result.toFixed(decimalPlaces));

  // Special case to account for pluralization.
  if ((value === 1 || value === -1) && unit === 'bytes') {
    return {
      formatted: (isNegative ? '-' : '') + value + ' byte',
      unit: 'byte' as StorageSymbol,
      value: isNegative ? -value : value,
    };
  }

  return {
    formatted: (isNegative ? '-' : '') + value + ' ' + unit,
    unit,
    value: isNegative ? -value : value,
  };
};

// `power` corresponds to storageUnits.indexOf(<UNIT WE WANT TO USE>)
export const determinePower = (
  num: number,
  storageUnits: StorageSymbol[],
  options: ReadableBytesOptions,
) => {
  // If maxUnit has been supplied, use that
  if (options.unit) {
    return storageUnits.indexOf(options.unit);
  } else {
    const multiplier = options.base10 ? 1000 : 1024;

    // Otherwise, we need to do some magic, which I don't 100% understand
    const magicallyCalculatedPower = Math.floor(
      Math.log(num) / Math.log(multiplier),
    );

    // If the magically calculated power/unit is higher than the
    // provided maxUnit, use maxUnit instead.
    return options.maxUnit &&
      storageUnits.indexOf(options.maxUnit) < magicallyCalculatedPower
      ? storageUnits.indexOf(options.maxUnit)
      : magicallyCalculatedPower;
  }
};

// Determine the number of decimal places to use.
// This could be specified with an option, or we fallback
// to the rounding rules that Classic Manager uses.
const determineDecimalPlaces = (
  num: number,
  unit: StorageSymbol,
  options: ReadableBytesOptions = {},
) => {
  if (typeof options.round === 'number') {
    return options.round;
  } else if (
    typeof options.round === 'object' &&
    // If rounding rules for the unit we're using have been specified
    typeof options.round[unit] === 'number'
  ) {
    return options.round[unit];
  } else if (num > 0 && num < 10) {
    return 2;
  } else if (num >= 10 && num < 100) {
    return 1;
  } else {
    return 0;
  }
};

export const convertBytesToTarget = (
  unit: StorageSymbol | StorageUnitExponentKey,
  value: number,
) => {
  switch (unit) {
    case 'B':
    case 'byte':
    case 'bytes':
      return value;
    default:
      return convertStorageUnit('B', value, unit);
  }
};

export enum StorageUnitExponents {
  B = 0,
  GB = 3,
  KB = 1,
  MB = 2,
  TB = 4,
}

type StorageUnitExponentKey = keyof typeof StorageUnitExponents;

/**
 * Converts from one storage unit to another.
 *
 * @param sourceUnit - The storage unit to convert the quantity from
 * @param sourceQuantity - The quantity to covert
 * @param targetUnit - The storage unit to convert the quantity to
 */
export const convertStorageUnit = (
  sourceUnit: StorageUnitExponentKey,
  sourceQuantity: number | undefined,
  targetUnit: StorageUnitExponentKey,
) => {
  if (sourceQuantity === undefined) {
    return 0;
  }

  if (sourceUnit === targetUnit) {
    return sourceQuantity;
  }

  const BASE = 1024;

  const exponent =
    StorageUnitExponents[sourceUnit] - StorageUnitExponents[targetUnit];
  return sourceQuantity * Math.pow(BASE, exponent);
};

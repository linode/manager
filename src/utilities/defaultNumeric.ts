// import { compose, curry, defaultTo, isEmpty, not, when } from 'ramda';

/**
 * LEGACY IMPLEMENTATION.
 *
 * Leaving just in case something breaks later down the line
 * but I'm 99% sure the function below is doing the same thing as
 * this
 */
// export default curry((defaultValue: number, v?: null | string | number) =>
//   compose(
//     defaultTo(defaultValue),
//     when(
//       compose(
//         not,
//         isEmpty
//       ),
//       (value: string) => +value
//     )
//   )(v)
// );

/**
 * function useful for parsing user input and defaulting to a specified value
 * when the user input is blank
 */
const defaultNumeric = (
  defaultValue: number,
  value?: null | string | number
) => {
  /** convert value to number if it's not undefined or null */
  const valueToNumber = !!value ? +value : value;

  /** return value only if it exists and is a number */
  return !!valueToNumber && valueToNumber !== 'NaN'
    ? valueToNumber
    : defaultValue;
};

export default defaultNumeric;

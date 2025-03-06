/**
 * Specify props to shallowly compare.
 *
 * @param prevProps
 * @param nextProps
 */
export const arePropsEqual = <T extends {}>(
  props: (keyof T)[],
  prevProps: T,
  nextProps: T
): boolean => {
  let areEqual = true;
  props.forEach((prop) => {
    if (prevProps[prop] !== nextProps[prop]) {
      areEqual = false;
    }
  });
  return areEqual;
};

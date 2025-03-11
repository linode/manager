export const isNullOrUndefined = (
  value: unknown
): value is null | undefined => {
  return value === null || value === undefined;
};

export const isNotNullOrUndefined = <T>(el: T | null | undefined): el is T =>
  !isNullOrUndefined(el);

export const isNullOrUndefined = (value: any): value is null | undefined => {
  return value === null || value === undefined;
};

export const isNotNullOrUndefined = <T>(el: T | null | undefined): el is T =>
  !isNullOrUndefined(el);

export const cleanArray = <T>(array: (T | null | undefined)[]): T[] =>
  array.filter(isNotNullOrUndefined);

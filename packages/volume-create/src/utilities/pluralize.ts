export const pluralize = (
  single: string,
  plural: string,
  value: number | string
) => {
  return value === 1 ? `${value} ${single}` : `${value} ${plural}`;
};

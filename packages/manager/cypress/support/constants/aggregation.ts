export enum aggregation {
  Avg = 'avg',
  Max = 'max',
  Min = 'min',
  Sum = 'sum',
}

export const aggregationConfig = {
  all: [aggregation.Avg, aggregation.Max, aggregation.Min, aggregation.Sum],
  basic: [aggregation.Avg, aggregation.Max, aggregation.Min],
};

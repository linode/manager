// Transform keys for the dimension filter value transform function
export type TransformKey = 'capitalize' | 'lowercase' | 'uppercase';

export type TransformFunction = (value: string) => string;

export type TransformFunctionMap = Record<TransformKey, TransformFunction>;

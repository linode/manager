type QueryKeys<T, P extends unknown[] = []> = {
  queryKey: [...P];
} & (T extends (
  ...args: any[]
) => {
  queryFn: (...args: any[]) => any;
}
  ? (
      ...args: Parameters<T>
    ) => Omit<ReturnType<T>, 'queryFn' | 'queryKey'> & {
      queryFn: () => ReturnType<ReturnType<T>['queryFn']>;
      queryKey: [...P, ...Parameters<T>];
    }
  : T extends (...args: any[]) => any
  ? (
      ...args: Parameters<T>
    ) => { queryKey: [...P, ...Parameters<T>] } & {
      [K in keyof ReturnType<T>]: QueryKeys<
        ReturnType<T>[K],
        [...P, ...Parameters<T>, K]
      >;
    }
  : T extends
      | {
          queryFn: (...args: any[]) => any;
          queryKey: any[];
        }
      | {
          queryFn: (...args: any[]) => any;
        }
  ? T
  : { [K in keyof T]: QueryKeys<T[K], [...P, K]> });

type QueryDef = { queryFn: (...args: any[]) => any; queryKey?: unknown[] };

type FactoryDef = {
  [key: string]:
    | QueryDef
    | ((...params: unknown[]) => QueryDef | FactoryDef)
    | FactoryDef;
};

export function getQueryKeys<T extends FactoryDef>(
  input: T,
  path: string[] = []
): QueryKeys<T> {
  const result = { queryKey: path };

  for (const key in input) {
    const newPath = [...path, key];

    if (typeof input[key] === 'function' && key === 'queryFn') {
      // @ts-expect-error todo
      return { ...input, queryFn: input[key], queryKey: path };
    }

    // @ts-expect-error todo
    if (typeof input[key] === 'function' && !input[key]()['queryFn']) {
      // @ts-expect-error todo
      result[key] = (...args) =>
        // @ts-expect-error todo
        getQueryKeys(input[key](...args), [...path, key, ...args]);
    } else if (typeof input[key] === 'function') {
      // @ts-expect-error todo
      const fn = (...args) => {
        // @ts-expect-error todo
        return getQueryKeys(input[key](...args), [
          ...newPath,
          // @ts-expect-error todo
          ...input[key](...args)?.['queryKey'] ?? [...args],
        ]);
      }
      fn.queryKey = newPath;
      // @ts-expect-error todo
      result[key] = fn;
    } else if (typeof input[key] === 'object') {
      // Recursively convert nested structures
      // @ts-expect-error todo
      result[key] = getQueryKeys(input[key], newPath);
    }
  }

  // @ts-expect-error todo
  return result;
}

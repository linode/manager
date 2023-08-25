export interface APIError {
  field?: string;
  reason: string;
}

export interface APIWarning {
  title: string;
  detail: string;
}

export interface ConfigOverride {
  baseURL?: string;
}

export interface ResourcePage<T> {
  data: T[];
  page: number;
  pages: number;
  results: number;
}

// Credit: https://stackoverflow.com/a/47914643
//
// Allows consumer to apply Partial to each key in a nested interface.
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface Params {
  page?: number;
  page_size?: number;
}

interface FilterConditionTypes {
  '+and'?: Filter[];
  '+or'?: Filter[] | string[];
  '+order_by'?: string;
  '+order'?: 'asc' | 'desc';
  '+gt'?: number;
  '+gte'?: number;
  '+lt'?: number;
  '+lte'?: number;
  '+contains'?: string;
  '+neq'?: string;
}

export type Filter = LinodeFilter | LinodeFilter[];

type LinodeFilter =
  | {
      [key in keyof FilterConditionTypes]: FilterConditionTypes[key];
    }
  | { [key: string]: string | number | boolean | Filter | null | undefined };

// const filter: Filter = {
//   '+or': [{ vcpus: 1 }, { class: 'standard' }],
// };

// const f1: Filter = {
//   '+and': [{ label: 'test' }, { id: 'odk' }],
// };

// const f: Filter = {
//   '+or': [
//     {
//       '+or': [
//         {
//           class: 'standard',
//         },
//         {
//           class: 'highmem',
//         },
//       ],
//     },
//     {
//       '+and': [
//         {
//           vcpus: {
//             '+gte': 12,
//           },
//         },
//         {
//           vcpus: {
//             '+lte': 20,
//           },
//         },
//       ],
//     },
//   ],
// };

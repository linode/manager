import type { PriceObject, RegionPriceObject } from './linodes/types';

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

export interface RequestOptions {
  params?: Params;
  filter?: Filter;
  headers?: RequestHeaders;
}

export interface FilterConditionTypes {
  '+and'?: Filter[];
  '+or'?: Filter[] | string[];
  '+order_by'?: string;
  '+order'?: 'asc' | 'desc';
  '+eq'?: string | number;
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

type RequestHeaderValue = string | string[] | number | boolean | null;

type RequestContentType =
  | RequestHeaderValue
  | 'application/json'
  | 'application/octet-stream'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/html'
  | 'text/plain';

export interface RequestHeaders {
  [key: string]: RequestHeaderValue | undefined;
  Accept?: string;
  Authorization?: string;
  'Content-Encoding'?: string;
  'Content-Length'?: number;
  'User-Agent'?: string;
  'Content-Type'?: RequestContentType;
}

export interface PriceType {
  id: string;
  label: string;
  price: PriceObject;
  region_prices: RegionPriceObject[];
  transfer: number;
}

import type { PriceObject, RegionPriceObject } from './linodes/types';

export interface APIError {
  field?: string;
  reason: string;
}

export interface APIWarning {
  detail: string;
  title: string;
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
  filter?: Filter;
  headers?: RequestHeaders;
  params?: Params;
}

export interface FilterConditionTypes {
  '+and'?: Filter[];
  '+contains'?: string;
  '+eq'?: number | string;
  '+gt'?: number;
  '+gte'?: number;
  '+lt'?: number;
  '+lte'?: number;
  '+neq'?: string;
  '+or'?: Filter[] | string[];
  '+order'?: 'asc' | 'desc';
  '+order_by'?: string;
}

export type Filter = LinodeFilter | LinodeFilter[];

type LinodeFilter =
  | { [key: string]: boolean | Filter | null | number | string | undefined }
  | {
      [key in keyof FilterConditionTypes]: FilterConditionTypes[key];
    };

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

type RequestHeaderValue = boolean | null | number | string | string[];

type RequestContentType =
  | 'application/json'
  | 'application/octet-stream'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/html'
  | 'text/plain'
  | RequestHeaderValue;

export interface RequestHeaders {
  [key: string]: RequestHeaderValue | undefined;
  Accept?: string;
  Authorization?: string;
  'Content-Encoding'?: string;
  'Content-Length'?: number;
  'Content-Type'?: RequestContentType;
  'User-Agent'?: string;
}

export interface PriceType {
  id: string;
  label: string;
  price: PriceObject;
  region_prices: RegionPriceObject[];
  transfer: number;
}

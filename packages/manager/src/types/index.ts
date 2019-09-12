/**
 * Necessary for ES6 import of svg/png files, else we would have to require() them.
 *
 * @see https://github.com/Microsoft/TypeScript-React-Starter/issues/12#issuecomment-326370098
 */
declare module '*.svg';
declare module '*.png';

declare module 'react-csv';

namespace Linode {
  export type TodoAny = any;

  export type NullableString = string | null;

  export type Hypervisor = 'kvm' | 'zen';

  export interface ResourcePage<T> {
    data: T[];
    page: number;
    pages: number;
    results: number;
  }

  export interface LinodeSpecs {
    disk: number;
    memory: number;
    vcpus: number;
    transfer: number;
  }

  export interface PriceObject {
    monthly: number;
    hourly: number;
  }

  export interface ApiFieldError {
    field?: string;
    reason: string;
  }

  export interface PaginationOptions {
    page?: number;
    page_size?: number;
  }
}

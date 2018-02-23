/// <reference path="Disk.ts" />
/// <reference path="Image.ts" />
/// <reference path="Linode.ts" />
/// <reference path="LinodeType.ts" />

/**
 * Necessary for ES6 import of svg/png files, else we would have to require() them.
 *
 * @see https://github.com/Microsoft/TypeScript-React-Starter/issues/12#issuecomment-326370098
 */
declare module '*.svg';
declare module '*.png';


namespace Linode {
  export type TodoAny = any;

  export type Hypervisor = 'kvm' | 'zen';

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
}

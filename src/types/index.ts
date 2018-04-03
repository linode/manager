/**
 * Necessary for ES6 import of svg/png files, else we would have to require() them.
 *
 * @see https://github.com/Microsoft/TypeScript-React-Starter/issues/12#issuecomment-326370098
 */
declare module '*.svg';
declare module '*.png';

namespace Linode {
  export type TodoAny = any;

  export type Theme = TodoAny;

  export type NullableString = string | null;

  export type Hypervisor = 'kvm' | 'zen';

  export interface ManyResourceState<T> {
    data: T[];
    page: number;
    pages: number;
    results: number;
  }

  export interface ApiState {
    linodes?: ManyResourceState<Linode.Linode>;
    linodeTypes?: ManyResourceState<Linode.LinodeType>;
    images?: ManyResourceState<Linode.Image>;
  }

  interface AuthState {
    token: NullableString;
    scopes: NullableString;
  }

  export interface ResourcesState {
    types?: ManyResourceState<Linode.LinodeType>;
  }

  export interface AppState {
    authentication: AuthState;
    resources: ResourcesState;
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

  export interface EventEntity {
    id: number;
    label: string;
    type: string;
    url: string;
  }

  export interface Event {
    id: number;
    seen: Boolean;
    created: string;
    status: 'scheduled' | 'started' | 'finished' | 'failed' | 'notification';
    percent_complete: number | null;
    entity: EventEntity | null;
    action: string;
  }

  export interface ApiFieldError {
    field: string;
    reason: string;
  }
}

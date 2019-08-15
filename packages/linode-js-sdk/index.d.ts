declare module 'linode-js-sdk/account/account' {
  import { ConfigOverride } from 'linode-js-sdk/types';
  import { Account } from 'linode-js-sdk/account/types';
  /**
   * getAccountInfo
   *
   * Return account information,
   * including contact and billing info.
   *
   */
  export const getAccountInfo: (config?: ConfigOverride) => Promise<Account>;

}
declare module 'linode-js-sdk/account/index' {
  export * from 'linode-js-sdk/account/account';
  export * from 'linode-js-sdk/account/types';
  export * from 'linode-js-sdk/account/schema';

}
declare module 'linode-js-sdk/account/schema' {
  export const updateAccountSchema: import("yup").ObjectSchema<{
      email: string;
      address_1: string;
      city: string;
      company: string;
      country: string;
      first_name: string;
      last_name: string;
      address_2: string;
      phone: string;
      state: string;
      tax_id: string;
      zip: string;
  }>;
  export const createOAuthClientSchema: import("yup").ObjectSchema<{
      label: string;
      redirect_uri: string;
  }>;
  export const updateOAuthClientSchema: import("yup").ObjectSchema<{
      label: string;
      redirect_uri: string;
  }>;
  export const StagePaypalPaymentSchema: import("yup").ObjectSchema<{
      cancel_url: string;
      redirect_url: string;
      usd: string;
  }>;
  export const ExecutePaypalPaymentSchema: import("yup").ObjectSchema<{
      payer_id: string;
      payment_id: string;
  }>;
  export const PaymentSchema: import("yup").ObjectSchema<{
      usd: string;
  }>;
  export const CreditCardSchema: import("yup").ObjectSchema<{
      card_number: string;
      expiry_year: number;
      expiry_month: number;
  }>;
  export const CreateUserSchema: import("yup").ObjectSchema<{
      username: string;
      email: string;
      restricted: boolean;
  }>;
  export const UpdateUserSchema: import("yup").ObjectSchema<{
      username: string;
      email: string;
      restricted: boolean;
  }>;
  export const UpdateGrantSchema: import("yup").ObjectSchema<{
      global: import("yup").Ref;
      linode: {
          id: any;
          permissions: any;
      }[];
      domain: {
          id: any;
          permissions: any;
      }[];
      nodebalancer: {
          id: any;
          permissions: any;
      }[];
      image: {
          id: any;
          permissions: any;
      }[];
      longview: {
          id: any;
          permissions: any;
      }[];
      stackscript: {
          id: any;
          permissions: any;
      }[];
      volume: {
          id: any;
          permissions: any;
      }[];
  }>;
  export const UpdateAccountSettingsSchema: import("yup").ObjectSchema<{
      network_helper: boolean;
      backups_enabled: boolean;
      managed: boolean;
  }>;

}
declare module 'linode-js-sdk/account/types' {
  interface CreditCard {
      expiry: string;
      last_four: string;
      cvv?: string;
  }
  export interface Account {
      active_since: string;
      address_2: string;
      email: string;
      first_name: string;
      tax_id: string;
      credit_card: CreditCard;
      state: string;
      zip: string;
      address_1: string;
      country: string;
      last_name: string;
      balance: number;
      balance_uninvoiced: number;
      city: string;
      phone: string;
      company: string;
  }
  export {};

}
declare module 'linode-js-sdk/constants' {
  export const API_ROOT = "https://api.linode.com/v4/";

}
declare module 'linode-js-sdk/index' {
  export * from 'linode-js-sdk/account/index';
  export { baseRequest } from 'linode-js-sdk/request';

}
declare module 'linode-js-sdk/request' {
  import { AxiosError, AxiosPromise } from 'axios';
  import { ObjectSchema } from 'yup';
  import { APIError } from 'linode-js-sdk/types';
  export const baseRequest: import("axios").AxiosInstance;
  /** URL */
  export const setURL: (url: string) => <T>(obj: T) => T;
  /** METHOD */
  export const setMethod: (method: "GET" | "DELETE" | "POST" | "PUT") => <T>(obj: T) => T;
  /** Param */
  export const setParams: (params?: any) => <T>(obj: T) => T;
  export const setHeaders: (headers?: any) => <T>(obj: T) => T;
  /**
   * Validate and set data in the request configuration object.
   */
  export const setData: <T extends {}>(data: T, schema?: ObjectSchema<T> | undefined, postValidationTransform?: ((v: any) => any) | undefined) => (<T>(obj: T) => T) | (() => APIError[]);
  /** X-Filter */
  export const setXFilter: (xFilter: any) => <T>(obj: T) => T;
  /** Generator */
  export const requestGenerator: <T>(...fns: Function[]) => AxiosPromise<T>;
  /**
   * Mock Error Function
   *
   * Use this function in place of your API request to mock errors. This returns the same
   * same response body as an Axios error.
   *
   * @example getLinodes = () => mockAPIError();
   * @example getLinode = () => mockAPIError(404, 'Not Found');
   * @example getLinodes = () => mockAPIError(404, 'Not Found');
   */
  export const mockAPIError: (status?: number, statusText?: string, data?: any) => Promise<AxiosError<any>>;
  /**
   *
   * Helper method to easily generate APIFieldError[] for a number of fields and a general error.
   */
  export const mockAPIFieldErrors: (fields: string[]) => APIError[];
  /**
   * POC * POC * POC * POC * POC * POC * POC *
   */
  interface CancellableRequest<T> {
      request: () => Promise<T>;
      cancel: () => void;
  }
  export const CancellableRequest: <T>(...fns: Function[]) => CancellableRequest<T>;
  export default requestGenerator;

}
declare module 'linode-js-sdk/types' {
  export interface APIError {
      field?: string;
      reason: string;
  }
  export interface ConfigOverride {
      baseURL?: string;
  }

}
declare module 'linode-js-sdk' {
  import main = require('linode-js-sdk/index');
  export = main;
}
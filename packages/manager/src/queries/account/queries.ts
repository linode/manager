import {
  getAccountAgreements,
  getAccountInfo,
  getAccountLogins,
  getAccountSettings,
  getChildAccounts,
  getClientToken,
  getGrants,
  getNetworkUtilization,
  getOAuthClients,
  getUser,
  getUsers,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getAllNotifications, getAllPaymentMethodsRequest } from './requests';

import type { Filter, Params, RequestOptions } from '@linode/api-v4';

export const accountQueries = createQueryKeys('account', {
  account: {
    queryFn: getAccountInfo,
    queryKey: null,
  },
  agreements: {
    queryFn: getAccountAgreements,
    queryKey: null,
  },
  childAccounts: (options: RequestOptions) => ({
    queryFn: ({ pageParam }) =>
      getChildAccounts({
        filter: options.filter,
        headers: options.headers,
        params: {
          page: pageParam,
          page_size: 25,
        },
      }),
    queryKey: [options],
  }),
  clientToken: {
    queryFn: getClientToken,
    queryKey: null,
  },
  logins: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAccountLogins(params, filter),
    queryKey: [params, filter],
  }),
  notifications: {
    queryFn: getAllNotifications,
    queryKey: null,
  },
  oauthClients: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getOAuthClients(params, filter),
    queryKey: [params, filter],
  }),
  paymentMethods: {
    queryFn: getAllPaymentMethodsRequest,
    queryKey: null,
  },
  settings: {
    queryFn: getAccountSettings,
    queryKey: null,
  },
  transfer: {
    queryFn: getNetworkUtilization,
    queryKey: null,
  },
  users: {
    contextQueries: {
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getUsers(params, filter),
        queryKey: [params, filter],
      }),
      user: (username: string) => ({
        contextQueries: {
          grants: {
            queryFn: () => getGrants(username),
            queryKey: null,
          },
        },
        queryFn: () => getUser(username),
        queryKey: [username],
      }),
    },
    queryKey: null,
  },
});

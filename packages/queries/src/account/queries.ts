import {
  getAccountAgreements,
  getAccountBeta,
  getAccountBetas,
  getAccountInfo,
  getAccountLogins,
  getAccountMaintenance,
  getAccountSettings,
  getChildAccounts,
  getClientToken,
  getGrants,
  getMaintenancePolicies,
  getNetworkUtilization,
  getOAuthClients,
  getUser,
  getUsers,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import {
  getAllAccountAvailabilitiesRequest,
  getAllAccountInvoices,
  getAllAccountMaintenance,
  getAllAccountPayments,
  getAllNotifications,
  getAllPaymentMethodsRequest,
} from './requests';

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
  availability: {
    queryFn: getAllAccountAvailabilitiesRequest,
    queryKey: null,
  },
  betas: {
    contextQueries: {
      beta: (id: string) => ({
        queryFn: () => getAccountBeta(id),
        queryKey: [id],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAccountBetas(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  childAccounts: (options: RequestOptions) => ({
    queryFn: ({ pageParam }) =>
      getChildAccounts({
        filter: options.filter,
        headers: options.headers,
        params: {
          page: pageParam as number,
          page_size: 25,
        },
      }),
    queryKey: [options],
  }),
  clientToken: {
    queryFn: getClientToken,
    queryKey: null,
  },
  invoices: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAllAccountInvoices(params, filter),
    queryKey: [params, filter],
  }),
  logins: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAccountLogins(params, filter),
    queryKey: [params, filter],
  }),
  maintenance: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllAccountMaintenance(params, filter),
        queryKey: [params, filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAccountMaintenance(params, filter),
        queryKey: [params, filter],
      }),
      policies: {
        queryFn: getMaintenancePolicies,
        queryKey: null,
      },
    },
    queryKey: null,
  },
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
  payments: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAllAccountPayments(params, filter),
    queryKey: [params, filter],
  }),
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

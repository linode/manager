import {
  createContact,
  createCredential,
  createServiceMonitor,
  deleteContact,
  deleteCredential,
  deleteServiceMonitor,
  disableServiceMonitor,
  enableServiceMonitor,
  getCredential,
  getCredentials,
  getLinodeSettings,
  getManagedContacts,
  getManagedIssues,
  getManagedStats,
  getSSHPubKey,
  getServiceMonitor,
  getServices,
  updateContact,
  updateCredential,
  updateLinodeSettings,
  updatePassword,
  updateServiceMonitor,
} from '@linode/api-v4';
import {
  itemInListCreationHandler,
  itemInListDeletionHandler,
  itemInListMutationHandler,
  queryPresets,
} from '@linode/queries';
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { extendIssues } from './helpers';

import type { ExtendedIssue } from './types';
import type {
  APIError,
  ContactPayload,
  CredentialPayload,
  ManagedContact,
  ManagedCredential,
  ManagedIssue,
  ManagedLinodeSetting,
  ManagedSSHPubKey,
  ManagedSSHSetting,
  ManagedServiceMonitor,
  ManagedServicePayload,
  ManagedStats,
  UpdateCredentialPayload,
  UpdatePasswordPayload,
} from '@linode/api-v4';

// We need to "Get All" on this request in order to handle Groups
// as a quasi-independent entity.
const getAllContacts = () =>
  getAll<ManagedContact>(getManagedContacts)().then((res) => res.data);

const getAllCredentials = () =>
  getAll<ManagedCredential>(getCredentials)().then((res) => res.data);

const getAllMonitors = () =>
  getAll<ManagedServiceMonitor>(getServices)().then((res) => res.data);

const getAllLinodeSettings = () =>
  getAll<ManagedLinodeSetting>(getLinodeSettings)().then((res) => res.data);

const _getAllIssues = () =>
  getAll<ManagedIssue>(getManagedIssues)().then((res) => res.data);

const getAllIssues = () => _getAllIssues().then((data) => extendIssues(data));

const managedQueries = createQueryKeys('managed', {
  contacts: {
    queryFn: getAllContacts,
    queryKey: null,
  },
  credential: (id: number) => ({
    queryFn: () => getCredential(id),
    queryKey: [id],
  }),
  credentials: {
    queryFn: getAllCredentials,
    queryKey: null,
  },
  issues: {
    queryFn: getAllIssues,
    queryKey: null,
  },
  linodeSettings: {
    queryFn: getAllLinodeSettings,
    queryKey: null,
  },
  monitor: (id: number) => ({
    queryFn: () => getServiceMonitor(id),
    queryKey: [id],
  }),
  monitors: {
    queryFn: getAllMonitors,
    queryKey: null,
  },
  sshKey: {
    queryFn: getSSHPubKey,
    queryKey: null,
  },
  stats: {
    queryFn: getManagedStats,
    queryKey: null,
  },
});

export const useManagedSSHKey = () =>
  useQuery<ManagedSSHPubKey, APIError[]>({
    ...managedQueries.sshKey,
    ...queryPresets.oneTimeFetch,
  });

export const useManagedCredentialQuery = (
  id: number,
  enabled: boolean = true
) =>
  useQuery<ManagedCredential, APIError[]>({
    ...managedQueries.credential(id),
    enabled,
  });

export const useAllLinodeSettingsQuery = () =>
  useQuery<ManagedLinodeSetting[], APIError[]>({
    ...managedQueries.linodeSettings,
    // A Linode may have been created or deleted since the last visit.
    refetchOnMount: 'always',
  });

export const useAllManagedCredentialsQuery = () =>
  useQuery<ManagedCredential[], APIError[]>(managedQueries.credentials);

export const useAllManagedContactsQuery = () =>
  useQuery<ManagedContact[], APIError[]>(managedQueries.contacts);

export const useAllManagedIssuesQuery = (primaryId?: number | string) =>
  useQuery<ExtendedIssue[], APIError[]>({
    ...managedQueries.issues,
    enabled: Boolean(primaryId),
    refetchInterval: 20000,
  });

export const useGetMonitorQuery = (id: number, enabled: boolean = true) =>
  useQuery<ManagedServiceMonitor, APIError[]>({
    ...managedQueries.monitor(id),
    enabled,
    refetchInterval: 20000,
  });

export const useAllManagedMonitorsQuery = () =>
  useQuery<ManagedServiceMonitor[], APIError[]>({
    ...managedQueries.monitors,
    refetchInterval: 20000,
  });

export const useManagedStatsQuery = () =>
  useQuery<ManagedStats, APIError[]>({
    ...managedQueries.stats,
    ...queryPresets.shortLived,
    retry: false,
  });

export const useDeleteMonitorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>({
    mutationFn: ({ id }) => deleteServiceMonitor(id),
    ...itemInListDeletionHandler(managedQueries.monitors.queryKey, queryClient),
  });
};

export const useCreateMonitorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ManagedServiceMonitor, APIError[], ManagedServicePayload>({
    mutationFn: createServiceMonitor,
    ...itemInListCreationHandler(managedQueries.monitors.queryKey, queryClient),
  });
};

export const useUpdateMonitorMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    ManagedServiceMonitor,
    APIError[],
    Partial<ManagedServicePayload>
  >({
    mutationFn: (data) => updateServiceMonitor(id, data),
    ...itemInListMutationHandler(managedQueries.monitors.queryKey, queryClient),
  });
};

export const useCreateCredentialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ManagedCredential, APIError[], CredentialPayload>({
    mutationFn: createCredential,
    ...itemInListCreationHandler(
      managedQueries.credentials.queryKey,
      queryClient
    ),
  });
};

export const useUpdateCredentialPasswordMutation = (id: number) =>
  useMutation<{}, APIError[], UpdatePasswordPayload>({
    mutationFn: (data) => updatePassword(id, data),
  });

export const useUpdateCredentialMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<ManagedCredential, APIError[], UpdateCredentialPayload>({
    mutationFn: (data) => updateCredential(id, data),
    ...itemInListMutationHandler(
      managedQueries.credentials.queryKey,
      queryClient
    ),
  });
};

export const useDeleteCredentialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>({
    mutationFn: ({ id }) => deleteCredential(id),
    ...itemInListDeletionHandler(
      managedQueries.credentials.queryKey,
      queryClient
    ),
  });
};

export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ManagedContact, APIError[], ContactPayload>({
    mutationFn: createContact,
    ...itemInListCreationHandler(managedQueries.contacts.queryKey, queryClient),
  });
};

export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>({
    mutationFn: ({ id }) => deleteContact(id),
    ...itemInListDeletionHandler(managedQueries.contacts.queryKey, queryClient),
  });
};

export const useUpdateContactMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<ManagedContact, APIError[], Partial<ContactPayload>>({
    mutationFn: (data) => updateContact(id, data),
    ...itemInListMutationHandler(managedQueries.contacts.queryKey, queryClient),
  });
};

export const useUpdateLinodeSettingsMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    ManagedLinodeSetting,
    APIError[],
    { ssh: Partial<ManagedSSHSetting> }
  >({
    mutationFn: (data) => updateLinodeSettings(id, data),
    ...itemInListMutationHandler(
      managedQueries.linodeSettings.queryKey,
      queryClient
    ),
  });
};

export const useEnableMonitorMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<ManagedServiceMonitor, APIError[]>({
    mutationFn: () => enableServiceMonitor(id),
    ...itemInListMutationHandler(managedQueries.monitors.queryKey, queryClient),
  });
};

export const useDisableMonitorMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<ManagedServiceMonitor, APIError[]>({
    mutationFn: () => disableServiceMonitor(id),
    ...itemInListMutationHandler(managedQueries.monitors.queryKey, queryClient),
  });
};

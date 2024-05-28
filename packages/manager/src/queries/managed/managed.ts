import {
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
  createContact,
  createCredential,
  createServiceMonitor,
  deleteContact,
  deleteCredential,
  deleteServiceMonitor,
  disableServiceMonitor,
  enableServiceMonitor,
  getCredentials,
  getLinodeSettings,
  getManagedContacts,
  getManagedIssues,
  getManagedStats,
  getSSHPubKey,
  getServices,
  updateContact,
  updateCredential,
  updateLinodeSettings,
  updatePassword,
  updateServiceMonitor,
} from '@linode/api-v4/lib/managed';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import {
  itemInListCreationHandler,
  itemInListDeletionHandler,
  itemInListMutationHandler,
  queryPresets,
} from '../base';
import { extendIssues } from './helpers';
import { ExtendedIssue } from './types';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const queryKey = 'managed';

export const useManagedSSHKey = () =>
  useQuery<ManagedSSHPubKey, FormattedAPIError[]>(
    [queryKey, 'public-ssh-key'],
    getSSHPubKey,
    queryPresets.oneTimeFetch
  );

export const useAllLinodeSettingsQuery = () =>
  useQuery<ManagedLinodeSetting[], FormattedAPIError[]>(
    [queryKey, 'linode-settings'],
    getAllLinodeSettings,
    {
      // A Linode may have been created or deleted since the last visit.
      refetchOnMount: 'always',
    }
  );

export const useAllManagedCredentialsQuery = () =>
  useQuery<ManagedCredential[], FormattedAPIError[]>(
    [queryKey, 'credentials'],
    getAllCredentials,
    queryPresets.oneTimeFetch
  );

export const useAllManagedContactsQuery = () =>
  useQuery<ManagedContact[], FormattedAPIError[]>(
    [queryKey, 'contacts'],
    getAllContacts,
    queryPresets.oneTimeFetch
  );

export const useAllManagedIssuesQuery = () =>
  useQuery<ExtendedIssue[], FormattedAPIError[]>(
    [queryKey, 'issues'],
    getAllIssues,
    {
      refetchInterval: 20000,
    }
  );

export const useAllManagedMonitorsQuery = () =>
  useQuery<ManagedServiceMonitor[], FormattedAPIError[]>(
    [queryKey, 'monitors'],
    getAllMonitors,
    {
      refetchInterval: 20000,
    }
  );

export const useManagedStatsQuery = () =>
  useQuery<ManagedStats, FormattedAPIError[]>(
    [queryKey, 'stats'],
    getManagedStats,
    {
      ...queryPresets.shortLived,
      retry: false,
    }
  );

export const useDeleteMonitorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[], { id: number }>(
    ({ id }) => deleteServiceMonitor(id),
    itemInListDeletionHandler([queryKey, 'monitors'], queryClient)
  );
};

export const useCreateMonitorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ManagedServiceMonitor,
    FormattedAPIError[],
    ManagedServicePayload
  >(
    createServiceMonitor,
    itemInListCreationHandler([queryKey, 'monitors'], queryClient)
  );
};

export const useUpdateMonitorMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    ManagedServiceMonitor,
    FormattedAPIError[],
    Partial<ManagedServicePayload>
  >(
    (data) => updateServiceMonitor(id, data),
    itemInListMutationHandler([queryKey, 'monitors'], queryClient)
  );
};

export const useCreateCredentialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ManagedCredential, FormattedAPIError[], CredentialPayload>(
    createCredential,
    itemInListCreationHandler([queryKey, 'credentials'], queryClient)
  );
};

export const useUpdateCredentialPasswordMutation = (id: number) =>
  useMutation<{}, FormattedAPIError[], UpdatePasswordPayload>((data) =>
    updatePassword(id, data)
  );

export const useUpdateCredentialMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    ManagedCredential,
    FormattedAPIError[],
    UpdateCredentialPayload
  >(
    (data) => updateCredential(id, data),
    itemInListMutationHandler([queryKey, 'credentials'], queryClient)
  );
};

export const useDeleteCredentialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[], { id: number }>(
    ({ id }) => deleteCredential(id),
    itemInListDeletionHandler([queryKey, 'credentials'], queryClient)
  );
};

export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ManagedContact, FormattedAPIError[], ContactPayload>(
    createContact,
    itemInListCreationHandler([queryKey, 'contacts'], queryClient)
  );
};

export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[], { id: number }>(
    ({ id }) => deleteContact(id),
    itemInListDeletionHandler([queryKey, 'contacts'], queryClient)
  );
};

export const useUpdateContactMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    ManagedContact,
    FormattedAPIError[],
    Partial<ContactPayload>
  >(
    (data) => updateContact(id, data),
    itemInListMutationHandler([queryKey, 'contacts'], queryClient)
  );
};

export const useUpdateLinodeSettingsMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    ManagedLinodeSetting,
    FormattedAPIError[],
    { ssh: Partial<ManagedSSHSetting> }
  >(
    (data) => updateLinodeSettings(id, data),
    itemInListMutationHandler([queryKey, 'linode-settings'], queryClient)
  );
};

export const useEnableMonitorMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<ManagedServiceMonitor, FormattedAPIError[]>(
    () => enableServiceMonitor(id),
    itemInListMutationHandler([queryKey, 'monitors'], queryClient)
  );
};

export const useDisableMonitorMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<ManagedServiceMonitor, FormattedAPIError[]>(
    () => disableServiceMonitor(id),
    itemInListMutationHandler([queryKey, 'monitors'], queryClient)
  );
};

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

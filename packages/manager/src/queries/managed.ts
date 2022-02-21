import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';
import {
  ContactPayload,
  createContact,
  createCredential,
  createServiceMonitor,
  CredentialPayload,
  deleteContact,
  deleteCredential,
  deleteServiceMonitor,
  getCredentials,
  getLinodeSettings,
  getManagedContacts,
  getManagedIssues,
  getManagedStats,
  getServices,
  getSSHPubKey,
  ManagedContact,
  ManagedCredential,
  ManagedIssue,
  ManagedLinodeSetting,
  ManagedServiceMonitor,
  ManagedServicePayload,
  ManagedSSHPubKey,
  ManagedSSHSetting,
  ManagedStats,
  updateContact,
  updateCredential,
  UpdateCredentialPayload,
  updateLinodeSettings,
  updatePassword,
  UpdatePasswordPayload,
  updateServiceMonitor,
} from '@linode/api-v4/lib/managed';

const queryKey = 'managed';

export const useManagedSSHKey = () =>
  useQuery<ManagedSSHPubKey, APIError[]>(
    `${queryKey}-ssh-key`,
    getSSHPubKey,
    queryPresets.oneTimeFetch
  );

export const useAllLinodeSettingsQuery = () =>
  useQuery<ManagedLinodeSetting[], APIError[]>(
    `${queryKey}-linode-settings`,
    getAllLinodeSettings,
    queryPresets.oneTimeFetch
  );

export const useAllManagedCredentialsQuery = () =>
  useQuery<ManagedCredential[], APIError[]>(
    `${queryKey}-credentials`,
    getAllCredentials,
    queryPresets.oneTimeFetch
  );

export const useAllManagedContactsQuery = () =>
  useQuery<ManagedContact[], APIError[]>(
    `${queryKey}-contacts`,
    getAllContacts,
    queryPresets.oneTimeFetch
  );

export const useAllManagedIssuesQuery = () =>
  useQuery<ManagedIssue[], APIError[]>(
    `${queryKey}-issues`,
    getAllIssues,
    queryPresets.oneTimeFetch
  );

export const useAllManagedMonitorsQuery = () =>
  useQuery<ManagedServiceMonitor[], APIError[]>(
    `${queryKey}-monitors`,
    getAllMonitors,
    queryPresets.oneTimeFetch
  );

export const useManagedStatsQuery = () =>
  useQuery<ManagedStats, APIError[]>(
    `${queryKey}-stats`,
    getManagedStats,
    queryPresets.shortLived
  );

// @TODO update store
export const useDeleteMonitorMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) =>
    deleteServiceMonitor(id)
  );

// @TODO update store
export const useCreateMonitorMutation = () =>
  useMutation<ManagedServiceMonitor, APIError[], ManagedServicePayload>(
    createServiceMonitor
  );

// @TODO update store
export const useUpdateMonitorMutation = (id: number) =>
  useMutation<
    ManagedServiceMonitor,
    APIError[],
    Partial<ManagedServicePayload>
  >((data) => updateServiceMonitor(id, data));

// @TODO update store
export const useCreateCredentialMutation = () =>
  useMutation<ManagedCredential, APIError[], CredentialPayload>(
    createCredential
  );

// @TODO update store
export const useUpdateCredentialPasswordMutation = (id: number) =>
  useMutation<{}, APIError[], UpdatePasswordPayload>((data) =>
    updatePassword(id, data)
  );

// @TODO update store
export const useUpdateCredentialMutation = (id: number) =>
  useMutation<ManagedCredential, APIError[], UpdateCredentialPayload>((data) =>
    updateCredential(id, data)
  );

// @TODO update store
export const useDeleteCredentialMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => deleteCredential(id));

// @TODO update store
export const useCreateContactMutation = () =>
  useMutation<ManagedContact, APIError[], ContactPayload>(createContact);

// @TODO update store
export const useDeleteContactMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => deleteContact(id));

// @TODO update store
export const useUpdateContactMutation = (id: number) =>
  useMutation<ManagedContact, APIError[], Partial<ContactPayload>>((data) =>
    updateContact(id, data)
  );

// @TODO update store
export const useUpdateLinodeSettingsMutation = (id: number) =>
  useMutation<
    ManagedLinodeSetting,
    APIError[],
    { ssh: Partial<ManagedSSHSetting> }
  >((data) => updateLinodeSettings(id, data));

const getAllCredentials = () =>
  getAll<ManagedCredential>(getCredentials)().then((res) => res.data);

// We need to "Get All" on this request in order to handle Groups
// as a quasi-independent entity.
const getAllContacts = () =>
  getAll<ManagedContact>(getManagedContacts)().then((res) => res.data);

const getAllIssues = () =>
  getAll<ManagedIssue>(getManagedIssues)().then((res) => res.data);

const getAllMonitors = () =>
  getAll<ManagedServiceMonitor>(getServices)().then((res) => res.data);

const getAllLinodeSettings = () =>
  getAll<ManagedLinodeSetting>(getLinodeSettings)().then((res) => res.data);

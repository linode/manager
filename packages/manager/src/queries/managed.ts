import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import {
  itemInListCreationHandler,
  itemInListDeletionHandler,
  itemInListMutationHandler,
  queryPresets,
} from './base';
import {
  ContactPayload,
  createContact,
  createCredential,
  createServiceMonitor,
  CredentialPayload,
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
import { getTicket } from '@linode/api-v4';
import Bluebird from 'bluebird';
import { DateTime } from 'luxon';
import { parseAPIDate } from 'src/utilities/date';

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
  useQuery<ExtendedIssue[], APIError[]>(
    `${queryKey}-issues`,
    getAllIssues,
    queryPresets.oneTimeFetch
  );

export const useAllManagedMonitorsQuery = () =>
  useQuery<ManagedServiceMonitor[], APIError[]>(
    `${queryKey}-monitors`,
    getAllMonitors,
    { refetchInterval: 20000 }
  );

export const useManagedStatsQuery = () =>
  useQuery<ManagedStats, APIError[]>(
    `${queryKey}-stats`,
    getManagedStats,
    queryPresets.shortLived
  );

export const useDeleteMonitorMutation = () =>
  useMutation<{}, APIError[], { id: number }>(
    ({ id }) => deleteServiceMonitor(id),
    itemInListDeletionHandler(`${queryKey}-monitors`)
  );

export const useCreateMonitorMutation = () =>
  useMutation<ManagedServiceMonitor, APIError[], ManagedServicePayload>(
    createServiceMonitor,
    itemInListCreationHandler(`${queryKey}-monitors`)
  );

export const useUpdateMonitorMutation = (id: number) =>
  useMutation<
    ManagedServiceMonitor,
    APIError[],
    Partial<ManagedServicePayload>
  >(
    (data) => updateServiceMonitor(id, data),
    itemInListMutationHandler(`${queryKey}-monitors`)
  );

export const useCreateCredentialMutation = () =>
  useMutation<ManagedCredential, APIError[], CredentialPayload>(
    createCredential,
    itemInListCreationHandler(`${queryKey}-credentials`)
  );

export const useUpdateCredentialPasswordMutation = (id: number) =>
  useMutation<{}, APIError[], UpdatePasswordPayload>(
    (data) => updatePassword(id, data),
    itemInListMutationHandler(`${queryKey}-credentials`)
  );

export const useUpdateCredentialMutation = (id: number) =>
  useMutation<ManagedCredential, APIError[], UpdateCredentialPayload>(
    (data) => updateCredential(id, data),
    itemInListMutationHandler(`${queryKey}-credentials`)
  );

export const useDeleteCredentialMutation = () =>
  useMutation<{}, APIError[], { id: number }>(
    ({ id }) => deleteCredential(id),
    itemInListDeletionHandler(`${queryKey}-credentials`)
  );

export const useCreateContactMutation = () =>
  useMutation<ManagedContact, APIError[], ContactPayload>(
    createContact,
    itemInListCreationHandler(`${queryKey}-contacts`)
  );

export const useDeleteContactMutation = () =>
  useMutation<{}, APIError[], { id: number }>(
    ({ id }) => deleteContact(id),
    itemInListDeletionHandler(`${queryKey}-contacts`)
  );

export const useUpdateContactMutation = (id: number) =>
  useMutation<ManagedContact, APIError[], Partial<ContactPayload>>(
    (data) => updateContact(id, data),
    itemInListMutationHandler(`${queryKey}-contacts`)
  );

export const useUpdateLinodeSettingsMutation = (id: number) =>
  useMutation<
    ManagedLinodeSetting,
    APIError[],
    { ssh: Partial<ManagedSSHSetting> }
  >(
    (data) => updateLinodeSettings(id, data),
    itemInListMutationHandler(`${queryKey}-linode-settings`)
  );

export const useEnableMonitorMutation = (id: number) =>
  useMutation<ManagedServiceMonitor, APIError[]>(
    () => enableServiceMonitor(id),
    itemInListMutationHandler(`${queryKey}-monitors`)
  );

export const useDisableMonitorMutation = (id: number) =>
  useMutation<ManagedServiceMonitor, APIError[]>(
    () => disableServiceMonitor(id),
    itemInListMutationHandler(`${queryKey}-monitors`)
  );

const getAllCredentials = () =>
  getAll<ManagedCredential>(getCredentials)().then((res) => res.data);

// We need to "Get All" on this request in order to handle Groups
// as a quasi-independent entity.
const getAllContacts = () =>
  getAll<ManagedContact>(getManagedContacts)().then((res) => res.data);

const getAllMonitors = () =>
  getAll<ManagedServiceMonitor>(getServices)().then((res) => res.data);

const getAllLinodeSettings = () =>
  getAll<ManagedLinodeSetting>(getLinodeSettings)().then((res) => res.data);

export interface ExtendedIssue extends ManagedIssue {
  status?: 'open' | 'closed' | 'new';
  dateClosed?: string;
}

const _getAllIssues = () =>
  getAll<ManagedIssue>(getManagedIssues)().then((res) => res.data);

const getAllIssues = () => _getAllIssues().then((data) => extendIssues(data));

export const extendIssues = async (issues: ManagedIssue[]) => {
  /**
   * Issues live forever, but we only care about recent and/or open issues.
   * To avoid pummeling the API for Support tickets for a list of ancient issues,
   * we're doing the filtering here. (The API doesn't allow you to filter on date created.)
   *
   * It might be better to just get the first page of results (page size of ~50), which in almost
   * every case will be enough. Did it this way to be safe.
   */
  const recentIssues = issues.filter(
    (thisIssue) =>
      parseAPIDate(thisIssue.created).diff(DateTime.local()).days < 30
  );
  return await Bluebird.map(recentIssues, (thisIssue) => {
    /**
     * Get the associated ticket for each issue, since the API response
     * does not include the status or date closed.
     */
    return (
      getTicket(thisIssue.id)
        .then((ticket) => {
          return {
            ...thisIssue,
            status: ticket.status,
            dateClosed: ticket.closed,
          } as ExtendedIssue;
        })
        // If this fails, we'll just use a normal issue
        .catch((_) => thisIssue as ExtendedIssue)
    );
  });
};

import {
  getCredentials,
  getManagedContacts,
  ManagedContact,
  ManagedCredential
} from '@linode/api-v4/lib/managed';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import LandingHeader from 'src/components/LandingHeader';
import NavTabs from 'src/components/NavTabs';
import { NavTab } from 'src/components/NavTabs/NavTabs';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import ManagedDashboardCard from './ManagedDashboardCard';
import SupportWidget from './SupportWidget';

const Contacts = React.lazy(() => import('./Contacts/Contacts'));
const Monitors = React.lazy(() => import('./Monitors'));
const SSHAccess = React.lazy(() => import('./SSHAccess'));
const CredentialList = React.lazy(() => import('./Credentials/CredentialList'));

export type CombinedProps = {} & RouteComponentProps<{}>;

const getAllCredentials = () =>
  getAll<ManagedCredential>(getCredentials)().then(response => response.data);

// We need to "Get All" on this request in order to handle Groups
// as a quasi-independent entity.
const getAllContacts = () =>
  getAll<ManagedContact>(getManagedContacts)().then(res => res.data);

export const ManagedLandingContent: React.FC<CombinedProps> = props => {
  const credentials = useAPIRequest<ManagedCredential[]>(getAllCredentials, []);

  const contacts = useAPIRequest<ManagedContact[]>(getAllContacts, []);

  const groups = React.useMemo(() => {
    const _groups: string[] = [];
    let i = 0;
    for (i; i < contacts.data.length; i++) {
      if (
        contacts.data[i].group !== null &&
        !_groups.includes(contacts.data[i].group!)
      ) {
        _groups.push(contacts.data[i].group as string);
      }
    }
    return _groups;
  }, [contacts.data]);

  const credentialsError = credentials.error
    ? getAPIErrorOrDefault(
        credentials.error,
        'Error retrieving your credentials.'
      )
    : undefined;

  const tabs: NavTab[] = [
    {
      title: 'Summary',
      routeName: `${props.match.url}/summary`,
      component: ManagedDashboardCard
    },
    {
      title: 'Monitors',
      routeName: `${props.match.url}/monitors`,
      render: (
        <Monitors
          credentials={credentials.data}
          loading={
            (credentials.loading && contacts.lastUpdated === 0) ||
            (contacts.loading && contacts.lastUpdated === 0)
          }
          groups={groups}
          errorFromProps={credentials.error || contacts.error || undefined}
        />
      )
    },
    {
      title: 'SSH Access',
      routeName: `${props.match.url}/ssh-access`,
      component: SSHAccess
    },
    {
      title: 'Credentials',
      routeName: `${props.match.url}/credentials`,
      render: (
        <CredentialList
          loading={credentials.loading && credentials.lastUpdated === 0}
          error={credentialsError}
          credentials={credentials.data}
          update={credentials.update}
        />
      )
    },
    {
      title: 'Contacts',
      routeName: `${props.match.url}/contacts`,
      render: (
        <Contacts
          contacts={contacts.data}
          loading={contacts.loading && contacts.lastUpdated === 0}
          error={contacts.error}
          lastUpdated={contacts.lastUpdated}
          transformData={contacts.transformData}
          update={contacts.update}
        />
      )
    }
  ];

  return (
    <>
      <LandingHeader
        title="Managed"
        entity="Managed"
        docsLink="https://www.linode.com/docs/platform/linode-managed/"
        extraActions={<SupportWidget />}
        removeCrumbX={1}
      />
      <NavTabs tabs={tabs} />
    </>
  );
};

export default ManagedLandingContent;

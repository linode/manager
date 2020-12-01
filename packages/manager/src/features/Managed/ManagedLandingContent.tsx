import {
  getCredentials,
  getManagedContacts,
  ManagedContact,
  ManagedCredential
} from '@linode/api-v4/lib/managed';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import DocumentationButton from 'src/components/DocumentationButton';
import Grid from 'src/components/Grid';
import NavTabs from 'src/components/NavTabs';
import { NavTab } from 'src/components/NavTabs/NavTabs';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import useFlags from 'src/hooks/useFlags';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import ManagedDashboardCard_CMR from '../Dashboard/ManagedDashboardCard/ManagedDashboardCard_CMR';
import SupportWidget from './SupportWidget';

const Contacts = React.lazy(() => import('./Contacts'));
const Contacts_CMR = React.lazy(() => import('./Contacts/Contacts_CMR'));
const Monitors = React.lazy(() => import('./Monitors'));
const SSHAccess = React.lazy(() => import('./SSHAccess'));
const CredentialList = React.lazy(() => import('./Credentials'));
const CredentialList_CMR = React.lazy(() =>
  import('./Credentials/CredentialList_CMR')
);

const useStyles = makeStyles((theme: Theme) => ({
  cmrSpacing: {
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing()
    }
  }
}));

export type CombinedProps = {} & RouteComponentProps<{}>;

const getAllCredentials = () =>
  getAll<ManagedCredential>(getCredentials)().then(response => response.data);

// We need to "Get All" on this request in order to handle Groups
// as a quasi-independent entity.
const getAllContacts = () =>
  getAll<ManagedContact>(getManagedContacts)().then(res => res.data);

export const ManagedLandingContent: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const flags = useFlags();

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

  const ContactsTable = flags.cmr ? Contacts_CMR : Contacts;
  const Credentials = flags.cmr ? CredentialList_CMR : CredentialList;

  const tabs: NavTab[] = [
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
        <Credentials
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
        <ContactsTable
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

  if (flags.cmr) {
    tabs.unshift({
      title: 'Summary',
      routeName: `${props.match.url}/summary`,
      component: ManagedDashboardCard_CMR
    });
  }

  return (
    <React.Fragment>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb
          pathname={props.location.pathname}
          labelTitle="Managed"
          removeCrumbX={1}
        />
        <Grid
          container
          item
          direction="row"
          justify="flex-end"
          alignItems="center"
          xs={8}
        >
          <Grid item className={flags.cmr ? classes.cmrSpacing : ''}>
            <SupportWidget />
          </Grid>
          <Grid item>
            <DocumentationButton href="https://www.linode.com/docs/platform/linode-managed/" />
          </Grid>
        </Grid>
      </Box>
      <NavTabs tabs={tabs} />
    </React.Fragment>
  );
};

export default ManagedLandingContent;

import {
  getCredentials,
  getManagedContacts,
  ManagedContact,
  ManagedCredential
} from 'linode-js-sdk/lib/managed';
import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import Tabs from 'src/components/core/Tabs';
import TabList from 'src/components/core/TabList';
import TabPanels from 'src/components/core/TabPanels';
import TabPanel from 'src/components/core/TabPanel';
import Tab from 'src/components/core/Tab';
import DefaultLoader from 'src/components/DefaultLoader';
import DocumentationButton from 'src/components/DocumentationButton';
import Grid from 'src/components/Grid';
import TabLink from 'src/components/TabLink';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import SupportWidget from './SupportWidget';

const Monitors = DefaultLoader({
  loader: () => import('./Monitors')
});

const SSHAccess = DefaultLoader({
  loader: () => import('./SSHAccess')
});

const Credentials = DefaultLoader({
  loader: () => import('./Credentials')
});

const Contacts = DefaultLoader({
  loader: () => import('./Contacts')
});

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

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Monitors',
      routeName: `${props.match.url}/monitors`
    },
    {
      title: 'SSH Access',
      routeName: `${props.match.url}/ssh-access`
    },
    {
      title: 'Credentials',
      routeName: `${props.match.url}/credentials`
    },
    {
      title: 'Contacts',
      routeName: `${props.match.url}/contacts`
    }
  ];

  const credentialsError = credentials.error
    ? getAPIErrorOrDefault(
        credentials.error,
        'Error retrieving your credentials.'
      )
    : undefined;

  const handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = props;
    const routeName = tabs[value].routeName;
    history.push(`${routeName}`);
  };

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

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
          <Grid item>
            <SupportWidget />
          </Grid>
          <Grid item>
            <DocumentationButton href="https://www.linode.com/docs/platform/linode-managed/" />
          </Grid>
        </Grid>
      </Box>
      <Tabs
      // value={tabs.findIndex(tab => matches(tab.routeName))}
      // onChange={handleTabChange}
      // indicatorColor="primary"
      // textColor="primary"
      // variant="scrollable"
      // scrollButtons="on"
      >
        <TabList>
          {tabs.map(tab => (
            <Tab key={tab.title} data-qa-tab={tab.title}>
              <TabLink to={tab.routeName} title={tab.title} />
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          <TabPanel>
            <Monitors
              credentials={credentials.data}
              loading={
                (credentials.loading && contacts.lastUpdated === 0) ||
                (contacts.loading && contacts.lastUpdated === 0)
              }
              groups={groups}
              errorFromProps={credentials.error || contacts.error || undefined}
            />
          </TabPanel>
          <TabPanel>
            <SSHAccess />
          </TabPanel>
          <TabPanel>
            <Credentials
              loading={credentials.loading && credentials.lastUpdated === 0}
              error={credentialsError}
              credentials={credentials.data}
              update={credentials.update}
            />
          </TabPanel>

          <TabPanel>
            <Contacts
              contacts={contacts.data}
              loading={contacts.loading && contacts.lastUpdated === 0}
              error={contacts.error}
              lastUpdated={contacts.lastUpdated}
              transformData={contacts.transformData}
              update={contacts.update}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </React.Fragment>
  );
};

export default ManagedLandingContent;

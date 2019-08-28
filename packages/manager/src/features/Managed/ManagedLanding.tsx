import * as React from 'react';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import AppBar from 'src/components/core/AppBar';
import Box from 'src/components/core/Box';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import DefaultLoader from 'src/components/DefaultLoader';
import setDocs from 'src/components/DocsSidebar/setDocs';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import TabLink from 'src/components/TabLink';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import useFlags from 'src/hooks/useFlags';
import { getCredentials, getManagedContacts } from 'src/services/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import EnableManagedPlaceholder from './EnableManagedPlaceholder';
import ManagedPlaceholder from './ManagedPlaceholder';
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

export type CombinedProps = RouteComponentProps<{}>;

const docs: Linode.Doc[] = [
  {
    title: 'Linode Managed',
    src: 'https://linode.com/docs/platform/linode-managed/',
    body: `How to configure service monitoring with Linode Managed.`
  }
];

const getAllCredentials = () =>
  getAll<Linode.ManagedCredential>(getCredentials)().then(
    response => response.data
  );

// We need to "Get All" on this request in order to handle Groups
// as a quasi-independent entity.
const getAllContacts = () =>
  getAll<Linode.ManagedContact>(getManagedContacts)().then(res => res.data);

export const ManagedLanding: React.FunctionComponent<CombinedProps> = props => {
  const credentials = useAPIRequest<Linode.ManagedCredential[]>(
    getAllCredentials,
    []
  );

  const contacts = useAPIRequest<Linode.ManagedContact[]>(getAllContacts, []);

  const credentialsError = credentials.error
    ? getAPIErrorOrDefault(
        credentials.error,
        'Error retrieving your credentials.'
      )
    : undefined;

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'Monitors', routeName: `${props.match.url}/monitors` },
    { title: 'SSH Access', routeName: `${props.match.url}/ssh-access` },
    { title: 'Credentials', routeName: `${props.match.url}/credentials` },
    { title: 'Contacts', routeName: `${props.match.url}/contacts` }
  ];

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

  const flags = useFlags();
  const isManaged = true;

  /**
   * Temporary logic since we currently have 3 states:
   * 1. User is Managed but feature flag is off -> show existing placeholder to point them to Classic
   * 2. User is not Managed -> show new placeholder to enable Managed
   * 3. User is Managed & flag is on -> show ManagedLanding page
   */

  const renderContent = () => {
    if (!flags.managed) {
      return <ManagedPlaceholder />;
    } else if (flags.managed && !isManaged) {
      // Eventually we can rename this to ManagedPlaceholder and delete the existing one
      return <EnableManagedPlaceholder />;
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
            <Grid item>
              <SupportWidget />
            </Grid>
            <Grid item>
              <DocumentationButton href="https://www.linode.com/docs/platform/linode-managed/" />
            </Grid>
          </Grid>
        </Box>
        <AppBar position="static" color="default">
          <Tabs
            value={tabs.findIndex(tab => matches(tab.routeName))}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="on"
          >
            {tabs.map(tab => (
              <Tab
                key={tab.title}
                data-qa-tab={tab.title}
                component={React.forwardRef((forwardedProps, ref) => (
                  <TabLink
                    to={tab.routeName}
                    title={tab.title}
                    {...forwardedProps}
                    ref={ref}
                  />
                ))}
              />
            ))}
          </Tabs>
        </AppBar>
        <Switch>
          <Route
            exact
            strict
            path={`${props.match.path}/monitors`}
            component={Monitors}
          />
          <Route
            exact
            strict
            path={`${props.match.path}/ssh-access`}
            component={SSHAccess}
          />
          <Route
            exact
            strict
            path={`${props.match.path}/credentials`}
            render={() => (
              <Credentials
                loading={credentials.loading && credentials.lastUpdated === 0}
                error={credentialsError}
                credentials={credentials.data}
                update={credentials.update}
              />
            )}
          />
          <Route
            exact
            strict
            path={`${props.match.path}/contacts`}
            render={() => (
              <Contacts
                contacts={contacts.data}
                loading={contacts.loading && contacts.lastUpdated === 0}
                error={contacts.error}
                lastUpdated={contacts.lastUpdated}
                transformData={contacts.transformData}
                update={contacts.update}
              />
            )}
          />
          <Redirect to={`${props.match.path}/monitors`} />
        </Switch>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Managed" />
      {renderContent()}
    </React.Fragment>
  );
};

const enhanced = compose<CombinedProps, {}>(setDocs(docs));

export default enhanced(ManagedLanding);

import * as React from 'react';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
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
import withFeatureFlagConsumer, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
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

export type CombinedProps = RouteComponentProps<{}> & FeatureFlagConsumerProps;

export class ManagedLanding extends React.Component<CombinedProps, {}> {
  static docs: Linode.Doc[] = [
    {
      title: 'Linode Managed',
      src: 'https://linode.com/docs/platform/linode-managed/',
      body: `How to configure service monitoring with Linode Managed.`
    }
  ];

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'Monitors', routeName: `${this.props.match.url}/monitors` },
    { title: 'SSH Access', routeName: `${this.props.match.url}/ssh-access` },
    { title: 'Credentials', routeName: `${this.props.match.url}/credentials` },
    { title: 'Contacts', routeName: `${this.props.match.url}/contacts` }
  ];

  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  };

  matches = (p: string) => {
    return Boolean(matchPath(p, { path: this.props.location.pathname }));
  };

  render() {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Managed" />
        {/* If the feature isn't enabled, just display the placeholder */}
        {!this.props.flags.managed ? (
          <ManagedPlaceholder />
        ) : (
          <React.Fragment>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
            >
              <Breadcrumb
                pathname={this.props.location.pathname}
                labelTitle="Managed"
                removeCrumbX={1}
              />
              <Grid
                container
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
                value={this.tabs.findIndex(tab => this.matches(tab.routeName))}
                onChange={this.handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="on"
              >
                {this.tabs.map(tab => (
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
                path={`${this.props.match.path}/monitors`}
                component={Monitors}
              />
              <Route
                exact
                strict
                path={`${this.props.match.path}/ssh-access`}
                component={SSHAccess}
              />
              <Route
                exact
                strict
                path={`${this.props.match.path}/credentials`}
                component={Credentials}
              />
              <Route
                exact
                strict
                path={`${this.props.match.path}/contacts`}
                component={Contacts}
              />
              <Redirect to={`${this.props.match.path}/monitors`} />
            </Switch>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const enhanced = compose<{}, {}>(
  setDocs(ManagedLanding.docs),
  withFeatureFlagConsumer,
  withRouter
);

export default enhanced(ManagedLanding);

import * as React from 'react';
import {
  matchPath,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import AppBar from 'src/components/core/AppBar';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import TabLink from 'src/components/TabLink';
import AccessKeyLanding from './AccessKeys/AccessKeyLanding';
import BucketLanding from './Buckets/BucketLanding';

type Props = RouteComponentProps<{}>;

export const ObjectStorageLanding: React.StatelessComponent<Props> = props => {
  const { match } = props;

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'Buckets', routeName: `${match.url}/buckets` },
    { title: 'Access Keys', routeName: `${match.url}/access-keys` }
  ];

  const handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = props;
    const routeName = tabs[value].routeName;
    history.push(`${routeName}`);
  };

  const {
    match: { url }
  } = props;
  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Object Storage" />
      <Typography variant="h1" data-qa-profile-header>
        Object Storage
      </Typography>
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
              component={() => <TabLink to={tab.routeName} title={tab.title} />}
            />
          ))}
        </Tabs>
      </AppBar>
      <Switch>
        <Route exact path={`${url}/buckets`} component={BucketLanding} />
        <Route exact path={`${url}/access-keys`} component={AccessKeyLanding} />
        <Route exact path={`${url}`} component={BucketLanding} />
      </Switch>
    </React.Fragment>
  );
};

export default withRouter(ObjectStorageLanding);

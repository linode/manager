import { getLongviewSubscriptions } from 'linode-js-sdk/lib/longview';
import { LongviewSubscription } from 'linode-js-sdk/lib/longview/types';
import * as React from 'react';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import AppBar from 'src/components/core/AppBar';
import Box from 'src/components/core/Box';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import DefaultLoader from 'src/components/DefaultLoader';
import DocumentationButton from 'src/components/DocumentationButton';
import TabLink from 'src/components/TabLink';
import { useAPIRequest } from 'src/hooks/useAPIRequest';

const LongviewClients = DefaultLoader({
  loader: () => import('./LongviewClients')
});

const LongviewPlans = DefaultLoader({
  loader: () => import('./LongviewPlans')
});

type CombinedProps = RouteComponentProps<{}>;

export const LongviewLanding: React.FunctionComponent<
  CombinedProps
> = props => {
  const subscriptionRequestHook = useAPIRequest<LongviewSubscription[]>(
    () => getLongviewSubscriptions().then(response => response.data),
    []
  );

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'Clients', routeName: `${props.match.url}/clients` },
    { title: 'Plan Details', routeName: `${props.match.url}/plan-details` }
  ];

  const handleTabChange = (
    _: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const routeName = tabs[value].routeName;
    props.history.push(`${routeName}`);
  };

  const url = props.match.url;
  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  return (
    <React.Fragment>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb
          pathname={props.location.pathname}
          labelTitle="Longview"
          removeCrumbX={1}
        />
        <DocumentationButton
          /** This URL points to the old guide until the update is live */
          href={'https://www.linode.com/docs/platform/longview/longview/'}
        />
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
          path={`${url}/clients`}
          render={() => <LongviewClients {...props} />}
        />
        <Route
          exact
          strict
          path={`${url}/plan-details`}
          render={() => (
            <LongviewPlans subscriptionRequestHook={subscriptionRequestHook} />
          )}
        />
        <Redirect to={`${url}/clients`} />
      </Switch>
    </React.Fragment>
  );
};

export default LongviewLanding;

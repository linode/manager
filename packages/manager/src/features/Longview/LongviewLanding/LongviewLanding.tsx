import { getLongviewSubscriptions } from 'linode-js-sdk/lib/longview';
import { LongviewSubscription } from 'linode-js-sdk/lib/longview/types';
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
import TabLink from 'src/components/TabLink';
import { useAPIRequest } from 'src/hooks/useAPIRequest';

const LongviewClients = DefaultLoader({
  loader: () => import('./LongviewClients')
});

const LongviewPlans = DefaultLoader({
  loader: () => import('./LongviewPlans')
});

type CombinedProps = RouteComponentProps<{}>;

export const LongviewLanding: React.FunctionComponent<CombinedProps> = props => {
  const subscriptionRequestHook = useAPIRequest<LongviewSubscription[]>(
    () => getLongviewSubscriptions().then(response => response.data),
    []
  );

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Clients',
      routeName: `${props.match.url}/clients`
    },
    {
      title: 'Plan Details',
      routeName: `${props.match.url}/plan-details`
    }
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
          href={'https://www.linode.com/docs/platform/longview/longview/'}
        />
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
            <LongviewClients
              subscriptionsData={subscriptionRequestHook.data || []}
              {...props}
            />
          </TabPanel>

          <TabPanel>
            <LongviewPlans subscriptionRequestHook={subscriptionRequestHook} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </React.Fragment>
  );
};

export default LongviewLanding;

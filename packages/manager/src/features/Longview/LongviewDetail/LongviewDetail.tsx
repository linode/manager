import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import Breadcrumb from 'src/components/Breadcrumb';
import AppBar from 'src/components/core/AppBar';
import Box from 'src/components/core/Box';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';

import DocumentationButton from 'src/components/DocumentationButton';

import { safeGetTabRender } from 'src/utilities/safeGetTabRender';
import Overview from './LongviewDetailOverview';

import withLongviewClients, {
  DispatchProps,
  Props as LVProps
} from 'src/containers/longview.container';

interface Props {
  clients: LVProps['longviewClientsData'];
  longviewClientsLastUpdated: number;
}

type CombinedProps = RouteComponentProps<{ id: string }> &
  Props &
  DispatchProps;

const LongviewDetail: React.FC<CombinedProps> = props => {
  const {
    match: {
      params: { id }
    },
    clients,
    longviewClientsLastUpdated
  } = props;

  React.useEffect(() => {
    /** request clients if they haven't already been requested */
    if (longviewClientsLastUpdated === 0) {
      props.getLongviewClients();
    }
  }, []);

  const client = clients[id];

  const tabOptions = [
    {
      title: 'Overview',
      display: true,
      render: () => {
        return <Overview />;
      }
    },
    {
      title: 'Processes',
      display: true,
      render: () => {
        // return <Overview />;
      }
    },
    {
      title: 'Network',
      display: true,
      render: () => {
        // return <Overview />;
      }
    },
    {
      title: 'Disks',
      display: true,
      render: () => {
        // return <Overview />;
      }
    },
    {
      title: 'Apache',
      display: client.apps.apache,
      render: () => {
        // return <Overview />;
      }
    },
    {
      title: 'Nginx',
      display: client.apps.nginx,
      render: () => {
        // return <Overview />;
      }
    },
    {
      title: 'MySQL',
      display: client.apps.mysql,
      render: () => {
        // return <Overview />;
      }
    },
    {
      title: 'Installation',
      display: true,
      render: () => {
        // return <Overview />;
      }
    }
  ];

  const tabs = tabOptions.filter(tab => tab.display === true);

  const tabRender = safeGetTabRender(tabs, 0);

  return (
    <React.Fragment>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb
          pathname={props.location.pathname}
          removeCrumbX={2}
          labelTitle={client.label}
        />
        <DocumentationButton href={'https://google.com'} />
      </Box>
      <AppBar position="static" color="default">
        {/* TODO make this functional */}
        <Tabs
          value={0}
          // onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
        >
          {tabs.map(tab => (
            <Tab key={tab.title} label={tab.title} data-qa-tab={tab.title} />
          ))}
        </Tabs>
      </AppBar>
      {tabRender()}
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withLongviewClients<Props, {}>(
    (own, { longviewClientsData, longviewClientsLastUpdated }) => ({
      clients: longviewClientsData,
      longviewClientsLastUpdated
    })
  )
)(LongviewDetail);

import * as React from 'react';
import { matchPath } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tabs from 'src/components/core/Tabs';
import TabList from 'src/components/core/TabList';
import TabPanels from 'src/components/core/TabPanels';
import TabPanel from 'src/components/core/TabPanel';
import Tab from 'src/components/core/Tab';
import DefaultLoader from 'src/components/DefaultLoader';
import TabLink from 'src/components/TabLink';
import { ResizeProps } from './ResizeCluster';

const useStyles = makeStyles((theme: Theme) => ({
  tabBar: {
    marginTop: 0
  }
}));

const Details = DefaultLoader({
  loader: () => import('./Details')
});

const Resize = DefaultLoader({
  loader: () => import('./ResizeCluster')
});

export const DetailNavigation: React.FC<ResizeProps> = props => {
  const classes = useStyles();
  const {
    match: { url }
  } = props;

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      routeName: `${url}/details`,
      title: 'Details'
    },
    { routeName: `${url}/resize`, title: 'Resize' }
  ];

  const handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = props;
    const routeName = tabs[value].routeName;
    history.push(`${routeName}`);
  };

  return (
    <Tabs
    // value={tabs.findIndex(tab => matches(tab.routeName)) || 0}
    // onChange={handleTabChange}
    // indicatorColor="primary"
    // textColor="primary"
    // variant="scrollable"
    // scrollButtons="on"
    // className={classes.tabBar}
    >
      <TabList>
        {tabs.map(tab => (
          <Tab key={tab.title} label={tab.title} data-qa-tab={tab.title}>
            <TabLink to={tab.routeName} title={tab.title} />
          </Tab>
        ))}
      </TabList>

      <TabPanels>
        <TabPanel>
          <Resize {...props} />
        </TabPanel>

        <TabPanel>
          <Details {...props} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

const matches = (p: string) => {
  return Boolean(matchPath(p, { path: location.pathname }));
};

export default DetailNavigation;

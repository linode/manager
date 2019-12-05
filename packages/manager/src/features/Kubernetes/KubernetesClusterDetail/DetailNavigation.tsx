import * as React from 'react';
import { matchPath, Redirect, Route, Switch } from 'react-router-dom';
import AppBar from 'src/components/core/AppBar';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
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
      title: 'Details',
      name: 'lke-cluster-details'
    },
    { routeName: `${url}/resize`, title: 'Resize', name: 'lke-cluster-resize' }
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
    <>
      <AppBar position="static" color="default" role="tablist">
        <Tabs
          value={tabs.findIndex(tab => matches(tab.routeName)) || 0}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
          className={classes.tabBar}
        >
          {tabs.map(tab => (
            <Tab
              key={tab.title}
              label={tab.title}
              data-qa-tab={tab.title}
              component={React.forwardRef((tabProps, ref) => (
                <TabLink
                  to={tab.routeName}
                  title={tab.title}
                  idName={tab.name}
                  {...tabProps}
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
          path={`${url}/resize`}
          render={() => <Resize {...props} />}
        />
        <Route
          exact
          path={`${url}/details`}
          render={() => <Details {...props} />}
        />
        <Redirect to={`${url}/details`} />
      </Switch>
    </>
  );
};

const matches = (p: string) => {
  return Boolean(matchPath(p, { path: location.pathname }));
};

export default DetailNavigation;

import * as React from 'react';
import {
  matchPath,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import AppBar from 'src/components/core/AppBar';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import DefaultLoader from 'src/components/DefaultLoader';
import TabLink from 'src/components/TabLink';

const Details = DefaultLoader({
  loader: () => import('./Details')
});

const Resize = DefaultLoader({
  loader: () => import('./ResizeCluster')
});

interface Props {}

type CombinedProps = Props & RouteComponentProps<{}>;

export const DetailNavigation: React.FC<CombinedProps> = props => {
  const {
    match: { url }
  } = props;

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { routeName: `${url}/details`, title: 'Details' },
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
    <>
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
              label={tab.title}
              data-qa-tab={tab.title}
              component={React.forwardRef((tabProps, ref) => (
                <TabLink
                  to={tab.routeName}
                  title={tab.title}
                  {...tabProps}
                  ref={ref}
                />
              ))}
            />
          ))}
        </Tabs>
      </AppBar>
      <Switch>
        <Route exact path={`${url}/details`} component={Details} />
        <Route exact path={`${url}/resize`} component={Resize} />
      </Switch>
    </>
  );
};

const matches = (p: string) => {
  return Boolean(matchPath(p, { path: location.pathname }));
};

export default DetailNavigation;

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
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import TabLink from 'src/components/TabLink';

export const MultipleLinodes: React.FC<RouteComponentProps> = props => {
  const tabs = [
    /* NB: These must correspond to the routes, inside the Switch */
    {
      title: 'Linodes',
      routeName: `${props.match.url}/linodes`
    },
    {
      title: 'Domains',
      routeName: `${props.match.url}/domains`
    },
    {
      title: 'Volumes',
      routeName: `${props.match.url}/volumes`
    },
    {
      title: 'Object Storage',
      routeName: `${props.match.url}/object-storage`
    }
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const handleTabChange = (
    _: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const routeName = tabs[value].routeName;
    props.history.push(`${routeName}`);
  };

  const url = props.match.url;

  return (
    <>
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
      <Switch>
        <Route
          exact
          strict
          path={`${url}/linodes`}
          render={() => <div>Linodes Table</div>}
        />
        <Route
          exact
          strict
          path={`${url}/domains`}
          render={() => <div>Domains Table</div>}
        />
        <Route
          exact
          strict
          path={`${url}/volumes`}
          render={() => <div>Volumes Table</div>}
        />
        <Route
          exact
          strict
          path={`${url}/object-storage`}
          render={() => <div>Buckets Table</div>}
        />
        <Redirect to={`${url}/linodes`} />
      </Switch>
    </>
  );
};

const enhanced = compose<RouteComponentProps, {}>(
  React.memo,
  withRouter
)(MultipleLinodes);
export default React.memo(enhanced);

import * as React from 'react';
import { matchPath, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

import Placeholder from 'src/components/Placeholder';

import TicketList from './TicketList';

type Props = RouteComponentProps<{}>;

class Profile extends React.Component<Props> {
  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'Open Tickets', routeName: `${this.props.match.url}/open` },
    { title: 'Closed Tickets', routeName: `${this.props.match.url}/closed` },
  ];

  render() {
    const { match: { url } } = this.props;
    const matches = (p: string) => {
      return Boolean(matchPath(p, { path: this.props.location.pathname }));
    };

    return (
      <React.Fragment>
        <Typography variant="headline" data-qa-profile-header>
          Customer Support
        </Typography>
        <AppBar position="static" color="default">
          <Tabs
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            {this.tabs
              .map(tab => <Tab key={tab.title} label={tab.title} data-qa-tab={tab.title}
            />)}
          </Tabs>
        </AppBar>
        <Switch>
          <Route exact path={`${url}/open`} component={TicketList} />
          <Route exact path={`${url}/closed`} render={() => <Placeholder title="something" />} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default withRouter(Profile);

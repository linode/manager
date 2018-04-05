import * as React from 'react';
import * as moment from 'moment';
import Axios from 'axios';
import {
  matchPath,
  withRouter,
  Route,
  Switch,
  RouteComponentProps,
  Redirect,
} from 'react-router-dom';
import { Subscription } from 'rxjs/Rx';

import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import { events$ } from 'src/events';
import { newLinodeEvents } from 'src/features/linodes/events';
import { API_ROOT } from 'src/constants';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import LinodeSummary from './LinodeSummary';

type Props = RouteComponentProps<{ linodeId?: number }>;

interface State {
  linode: Linode.Linode & { recentEvent?: Linode.Event };
}

interface PreloadedProps {
  linode: PromiseLoaderResponse<Linode.SingleResourceState<Linode.Linode>>;
}

const preloaded = PromiseLoader<Props>({
  linode: ((props) => {
    const { match: { params: { linodeId } } } = props;
    return Axios.get(`${API_ROOT}/linode/instances/${linodeId}`);
  }),
});

type CombinedProps = Props & PreloadedProps;

class LinodeDetail extends React.Component<CombinedProps, State> {
  subscription: Subscription;

  state = { linode: this.props.linode.response.data };

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  componentDidMount() {
    const mountTime = moment().subtract(5, 'seconds');
    this.subscription = events$
      /* TODO: factor out this filter using a higher-order function that
         takes mountTime */
      .filter(newLinodeEvents(mountTime))
      .subscribe((linodeEvent) => {
        Axios.get(`${API_ROOT}/linode/instances/${(linodeEvent.entity as Linode.Entity).id}`)
          .then(response => response.data)
          .then(linode => this.setState(() => {
            linode.recentEvent = linodeEvent;
            return { linode };
          }));
      });
  }

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { routeName: `${this.props.match.url}/summary`, title: 'Summary' },
  ];

  render() {
    const { match: { path, url } } = this.props;
    const { linode } = this.state;
    const matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));

    return (
      <div>
        <Typography variant="headline">
          {linode.label}
        </Typography>
        <AppBar position="static" color="default">
          <Tabs
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            {this.tabs.map(tab => <Tab key={tab.title} label={tab.title} />)}
          </Tabs>
        </AppBar>
        <Switch>
          <Route exact path={`${url}/summary`} render={() => (<LinodeSummary linode={linode} />)} />
          <Route exact path={`${path}/`} render={() => (<Redirect to={`${url}/summary`} />)} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(preloaded(LinodeDetail));

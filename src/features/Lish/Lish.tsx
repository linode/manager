import * as React from 'react';
import { matchPath, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import NotFound from 'src/components/NotFound';
import linodeRequestsContainer, { LinodeRequests } from 'src/containers/linodeRequests.container';
import { getLinodeLishToken } from 'src/services/linodes';
import Glish from './Glish';
import Weblish from './Weblish';

type ClassNames = 'tabs' | 'tabRoot' | 'progress' | 'notFound';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  tabs: {
    backgroundColor: theme.bg.offWhite,
    margin: 0,
  },
  tabRoot: {
    minWidth: '50%',
  },
  progress: {
    height: 'auto',
  },
  notFound: {
    color: '#f4f4f4 !important',
    '& h1': {
      color: '#f4f4f4 !important',
    },
  }
});

interface State {
  loading: boolean;
  linode?: Linode.Linode;
  token?: string;
}

interface RouteParams { linodeId?: number }

type CombinedProps =
  & LinodeRequests
  & WithStyles<ClassNames>
  & RouteComponentProps<RouteParams>;

class Lish extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
  };

  mounted: boolean;

  componentDidMount() {
    this.mounted = true;
    const { match: { params: { linodeId } }, getLinode } = this.props;

    const webLishCss = import('' + '../../assets/weblish/weblish.css');
    const xtermCss = import('' + '../../assets/weblish/xterm.css');
    Promise.all([webLishCss, xtermCss]);

    if (!linodeId) {
      this.setState({ loading: false });
      return;
    }

    getLinode({ id: linodeId })
      .then((data) => {
        if (!this.mounted) { return; }
        this.setState({
          linode: data,
          loading: false,
        });
      })
      .catch(() => {
        if (!this.mounted) { return; }
        this.setState({ loading: false });
      });

    this.refreshToken();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  refreshToken = () => {
    const { match: { params: { linodeId } } } = this.props;

    if (!linodeId) {
      this.setState({ loading: false });
      return;
    }

    return getLinodeLishToken(linodeId)
      .then((response) => {
        const { data: { lish_token: token } } = response;
        if (!this.mounted) { return; }
        this.setState({
          token,
          loading: false,
        });
      })
      .catch(() => {
        if (!this.mounted) { return; }
        this.setState({ loading: false });
      });
  }

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { routeName: `${this.props.match.url}/weblish`, title: 'Weblish' },
    { routeName: `${this.props.match.url}/glish`, title: 'Glish' },
  ];

  matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));

  renderWeblish = () => {
    const { linode, token } = this.state;
    if (linode && token) {
      return <Weblish token={token} linode={linode} refreshToken={this.refreshToken} />;
    }
    return null;
  }

  renderGlish = () => {
    const { linode, token } = this.state;
    if (linode && token) {
      return <Glish token={token} linode={linode} refreshToken={this.refreshToken} />;
    }
    return null;
  }

  render() {
    const { classes, match: { path } } = this.props;
    const { loading, linode, token } = this.state;

    return (
      <React.Fragment>
        <Tabs
          value={this.tabs.findIndex(tab => this.matches(tab.routeName))}
          onChange={this.handleTabChange}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary"
          scrollable
          scrollButtons="on"
        >
          {this.tabs.map(tab =>
            <Tab
              classes={{
                root: classes.tabRoot,
              }}
              key={tab.title}
              label={tab.title}
              data-qa-tab={tab.title}
            />)}
        </Tabs>
        {loading &&
          <CircleProgress noInner className={classes.progress} />
        }
        {/* Only show 404 component if we are missing _both_ linode and token */}
        {(!loading && !linode && !token) &&
          <NotFound className={classes.notFound} />
        }
        {(!loading && token && linode) &&
          <Switch>
            <Route exact path={`${path}/weblish`} render={this.renderWeblish} />
            <Route exact path={`${path}/glish`} render={this.renderGlish} />
          </Switch>
        }
      </React.Fragment>
    );
  }
}


const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  withRouter,
  linodeRequestsContainer,
);

export default enhanced(Lish);

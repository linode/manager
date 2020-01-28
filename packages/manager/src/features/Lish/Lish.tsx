import {
  getLinode,
  getLinodeLishToken,
  Linode
} from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import {
  matchPath,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import { convertForAria } from 'src/components/TabLink/TabLink';
import Glish from './Glish';
import Weblish from './Weblish';

type ClassNames = 'tabs' | 'tabRoot' | 'progress' | 'notFound';

const styles = (theme: Theme) =>
  createStyles({
    tabs: {
      backgroundColor: theme.bg.offWhite,
      margin: 0
    },
    tabRoot: {
      margin: 0,
      flexBasis: '50%',
      transition: theme.transitions.create('background-color'),
      '&[aria-selected="true"]': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        '&:hover': {
          backgroundColor: theme.palette.primary.light,
          color: 'white'
        }
      }
    },
    progress: {
      height: 'auto'
    },
    notFound: {
      color: '#f4f4f4 !important',
      '& h1': {
        color: '#f4f4f4 !important'
      }
    }
  });

interface State {
  loading: boolean;
  authenticated: boolean;
  linode?: Linode;
  token?: string;
}

type CombinedProps = WithStyles<ClassNames> &
  RouteComponentProps<{ linodeId?: string }>;

class Lish extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
    authenticated: true
  };

  interval: number;
  mounted: boolean;

  componentDidMount() {
    this.mounted = true;
    const {
      match: {
        params: { linodeId }
      }
    } = this.props;

    const webLishCss = import('' + '../../assets/weblish/weblish.css');
    const xtermCss = import('' + '../../assets/weblish/xterm.css');
    Promise.all([webLishCss, xtermCss]);

    if (!linodeId) {
      this.setState({ loading: false });
      return;
    }

    getLinode(+linodeId)
      .then(response => {
        const { data: linode } = response;
        if (!this.mounted) {
          return;
        }
        this.setState({
          linode,
          loading: false
        });
      })
      .catch(() => {
        if (!this.mounted) {
          return;
        }
        this.setState({ loading: false });
      });

    this.refreshToken();
    // If the user signs out in another window, we want to close this session
    this.interval = window.setInterval(() => {
      const token = localStorage.getItem('authentication/token');

      if (!token && !!this.state.authenticated) {
        try {
          window.close();
        } catch (e) {
          /**
           * window.close() will only work if the window was opened
           * with window.open() or similar. If a user bookmarks a
           * Lish url and navigates there directly, this will fail.
           * Failure is ok here--there's no real way we can close a
           * tab if a user opened
           */
        }
        if (this.mounted) {
          this.setState({ authenticated: false });
        }
      }
    }, 2000);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.clearInterval(this.interval);
  }

  refreshToken = () => {
    const {
      match: {
        params: { linodeId }
      }
    } = this.props;

    if (!linodeId) {
      this.setState({ loading: false });
      return;
    }

    return getLinodeLishToken(+linodeId)
      .then(response => {
        const {
          data: { lish_token: token }
        } = response;
        if (!this.mounted) {
          return;
        }
        this.setState({
          token,
          loading: false
        });
      })
      .catch(() => {
        if (!this.mounted) {
          return;
        }
        this.setState({ loading: false });
      });
  };

  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  };

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { routeName: `${this.props.match.url}/weblish`, title: 'Weblish' },
    { routeName: `${this.props.match.url}/glish`, title: 'Glish' }
  ];

  matches = (p: string) =>
    Boolean(matchPath(p, { path: this.props.location.pathname }));

  renderWeblish = () => {
    const { linode, token } = this.state;
    if (linode && token) {
      return (
        <Weblish
          token={token}
          linode={linode}
          refreshToken={this.refreshToken}
        />
      );
    }
    return null;
  };

  renderGlish = () => {
    const { linode, token } = this.state;
    if (linode && token) {
      return (
        <Glish token={token} linode={linode} refreshToken={this.refreshToken} />
      );
    }
    return null;
  };

  render() {
    const {
      classes,
      match: { path }
    } = this.props;
    const { authenticated, loading, linode, token } = this.state;

    // If the window.close() logic above fails, we render an error state as a fallback
    if (!authenticated) {
      return (
        <ErrorState
          errorText={
            <Typography style={{ color: 'white' }}>
              You have been logged out in another window. Please log in again to
              continue using Lish.
            </Typography>
          }
        />
      );
    }

    const tabA11yProps = (idName: string) => {
      const ariaVal = convertForAria(idName);

      return {
        id: `tab-${ariaVal}`,
        role: 'tab',
        'aria-controls': `tabpanel-${ariaVal}`
      };
    };

    return (
      <React.Fragment>
        <Tabs
          value={this.tabs.findIndex(tab => this.matches(tab.routeName))}
          onChange={this.handleTabChange}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="off"
        >
          {this.tabs.map(tab => (
            <Tab
              classes={{
                root: classes.tabRoot
              }}
              key={tab.title}
              label={tab.title}
              data-qa-tab={tab.title}
              {...tabA11yProps(tab.title)}
            />
          ))}
        </Tabs>
        {loading && <CircleProgress noInner className={classes.progress} />}
        {/* Only show 404 component if we are missing _both_ linode and token */}
        {!loading && !linode && !token && (
          <NotFound className={classes.notFound} />
        )}
        {!loading && token && linode && (
          <Switch>
            <Route exact path={`${path}/weblish`} render={this.renderWeblish} />
            <Route exact path={`${path}/glish`} render={this.renderGlish} />
          </Switch>
        )}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(withRouter(Lish));

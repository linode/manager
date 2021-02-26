import {
  getLinode,
  getLinodeLishToken,
  Linode,
} from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import Glish from './Glish';
import Weblish from './Weblish';

type ClassNames = 'tabs' | 'progress' | 'notFound' | 'lish';

const AUTH_POLLING_INTERVAL = 2000;

const styles = (theme: Theme) =>
  createStyles({
    tabs: {
      backgroundColor: 'black',
      margin: 0,
      '& [role="tablist"]': {
        display: 'flex',
        backgroundColor: theme.bg.offWhite,
        margin: 0,
        overflow: 'hidden',
      },
      '& [role="tab"]': {
        backgroundColor: theme.bg.offWhite,
        color: theme.color.tableHeaderText,
        flexBasis: '50%',
        margin: 0,
        maxWidth: 'none !important',
        '&[aria-selected="true"]': {
          backgroundColor: theme.palette.primary.main,
          borderBottom: 'none !important',
          color: 'white !important',
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
            color: 'white',
          },
        },
      },
    },
    progress: {
      height: 'auto',
    },
    notFound: {
      color: '#f4f4f4 !important',
      '& h1': {
        color: '#f4f4f4 !important',
      },
    },
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
    authenticated: true,
  };

  interval: number;
  mounted: boolean;

  componentDidMount() {
    this.mounted = true;
    const {
      match: {
        params: { linodeId },
      },
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
        const linode = response;
        if (!this.mounted) {
          return;
        }
        this.setState({
          linode,
          loading: false,
        });
      })
      .catch(() => {
        if (!this.mounted) {
          return;
        }
        this.setState({ loading: false });
      });

    this.refreshToken();
    /**
     * If the user signs out in another window, we want to close this session.
     * We're using window.localStorage directly here because of closures, and
     * because using Redux state won't work since a Lish window will have its
     * independent store that will be unaffected by logouts in other tabs/windows.
     */

    this.interval = window.setInterval(
      this.checkAuthentication,
      AUTH_POLLING_INTERVAL
    );
  }

  componentWillUnmount() {
    this.mounted = false;
    window.clearInterval(this.interval);
  }

  checkAuthentication = () => {
    const token = window.localStorage.getItem('authentication/token');
    if (!token && !!this.state.authenticated) {
      try {
        window.close();
      } catch (e) {
        /**
         * window.close() will only work if the window was opened
         * with window.open() or similar. If a user bookmarks a
         * Lish url and navigates there directly, this will fail.
         * Failure is ok here--there's no real way we can close a
         * tab if a user opened it directly.
         */
      }
      if (this.mounted) {
        // In case the above didn't work, we'll render an error state based on this flag.
        this.setState({ authenticated: false });
      }
    }
  };

  refreshToken = () => {
    const {
      match: {
        params: { linodeId },
      },
    } = this.props;

    if (!linodeId) {
      this.setState({ loading: false });
      return;
    }

    return getLinodeLishToken(+linodeId)
      .then(response => {
        const { lish_token: token } = response;
        if (!this.mounted) {
          return;
        }
        this.setState({
          token,
          loading: false,
        });
      })
      .catch(() => {
        if (!this.mounted) {
          return;
        }
        this.setState({ loading: false });
      });
  };

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Weblish',
      routeName: `${this.props.match.url}/weblish`,
    },
    {
      title: 'Glish',
      routeName: `${this.props.match.url}/glish`,
    },
  ];

  matches = (p: string) =>
    Boolean(matchPath(p, { path: this.props.location.pathname }));

  render() {
    const { classes } = this.props;
    const { authenticated, loading, linode, token } = this.state;

    const navToURL = (index: number) => {
      this.props.history.push(this.tabs[index].routeName);
    };

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

    return (
      <React.Fragment>
        <Tabs className={classes.tabs} onChange={navToURL}>
          <TabLinkList className={classes.lish} tabs={this.tabs} />
          <TabPanels>
            {linode && token && (
              <SafeTabPanel index={0} data-qa-tab="Weblish">
                <Weblish
                  token={token}
                  linode={linode}
                  refreshToken={this.refreshToken}
                />
              </SafeTabPanel>
            )}
            {linode && token && (
              <SafeTabPanel index={1} data-qa-tab="Glish">
                <Glish
                  token={token}
                  linode={linode}
                  refreshToken={this.refreshToken}
                />
              </SafeTabPanel>
            )}
          </TabPanels>
        </Tabs>
        {loading && <CircleProgress noInner className={classes.progress} />}
        {/* Only show 404 component if we are missing _both_ linode and token */}
        {!loading && !linode && !token && (
          <NotFound className={classes.notFound} />
        )}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(withRouter(Lish));

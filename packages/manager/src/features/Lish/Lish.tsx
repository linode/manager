import {
  getLinode,
  getLinodeLishToken,
  Linode
} from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import { convertForAria } from 'src/components/TabLink/TabLink';
import Glish from './Glish';
import Weblish from './Weblish';

type ClassNames = 'tabs' | 'progress' | 'notFound';

const AUTH_POLLING_INTERVAL = 2000;

const styles = (theme: Theme) =>
  createStyles({
    tabs: {
      backgroundColor: 'black',
      margin: 0
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
    {
      title: 'Weblish',
      routeName: `${this.props.match.url}/weblish`
    },
    {
      title: 'Glish',
      routeName: `${this.props.match.url}/glish`
    }
  ];

  matches = (p: string) =>
    Boolean(matchPath(p, { path: this.props.location.pathname }));

  render() {
    const { classes } = this.props;
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
          className={classes.tabs}
          defaultIndex={this.tabs.findIndex(tab => this.matches(tab.routeName))}
        >
          <TabLinkList lish tabs={this.tabs} />
          <TabPanels>
            <TabPanel data-qa-tab="Weblish" {...tabA11yProps('Weblish')}>
              {linode && token && (
                <Weblish
                  token={token}
                  linode={linode}
                  refreshToken={this.refreshToken}
                />
              )}
            </TabPanel>
            <TabPanel data-qa-tab={'Glish'} {...tabA11yProps('Glish')}>
              {linode && token && (
                <Glish
                  token={token}
                  linode={linode}
                  refreshToken={this.refreshToken}
                />
              )}
            </TabPanel>
            ))}
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

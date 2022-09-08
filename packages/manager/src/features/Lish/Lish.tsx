import * as React from 'react';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { Theme, makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import { Tab } from 'src/components/TabLinkList/TabLinkList';
import { useLinodeLishTokenQuery, useLinodeQuery } from 'src/queries/linodes';
import Glish from './Glish';
import Weblish from './Weblish';

const AUTH_POLLING_INTERVAL = 2000;

const useStyles = makeStyles((theme: Theme) => ({
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
      flex: 'auto',
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
}));

const Lish = () => {
  const classes = useStyles();
  const history = useHistory();
  const match = useRouteMatch();
  const { linodeId } = useParams<{ linodeId?: string }>();
  const id = Number(linodeId);
  const { data: linode, isLoading: isLinodeLoading } = useLinodeQuery(id);
  const { data, isLoading } = useLinodeLishTokenQuery(id);

  const [authenticated, setAuthenticated] = React.useState(true);

  const token = data?.lish_token;

  React.useEffect(() => {
    const webLishCss = import('' + '../../assets/weblish/weblish.css');
    const xtermCss = import('' + '../../assets/weblish/xterm.css');

    Promise.all([webLishCss, xtermCss]);

    /**
     * If the user signs out in another window, we want to close this session.
     * We're using window.localStorage directly here because of closures, and
     * because using Redux state won't work since a Lish window will have its
     * independent store that will be unaffected by logouts in other tabs/windows.
     */
    const interval = window.setInterval(
      checkAuthentication,
      AUTH_POLLING_INTERVAL
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const checkAuthentication = () => {
    const token = window.localStorage.getItem('authentication/token');
    if (!token && authenticated) {
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
      setAuthenticated(false);
    }
  };

  const isBareMetal = linode && linode.type && linode.type.includes('metal');

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Weblish',
      routeName: `${match.url}/weblish`,
    },
    !isBareMetal
      ? {
          title: 'Glish',
          routeName: `${match.url}/glish`,
        }
      : null,
  ].filter(Boolean) as Tab[];

  const navToURL = (index: number) => {
    history.push(tabs[index].routeName);
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

  // if we're loading show circular spinner
  if (isLoading || isLinodeLoading) {
    return <CircleProgress className={classes.progress} noInner />;
  }

  // Only show 404 component if we are missing _both_ linode and token
  if (!linode && !token) {
    return <NotFound className={classes.notFound} />;
  }

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <React.Fragment>
      {linode && token && (
        <Tabs className={classes.tabs} onChange={navToURL}>
          <TabLinkList tabs={tabs} />
          <TabPanels>
            <SafeTabPanel index={0} data-qa-tab="Weblish">
              <Weblish token={token} linode={linode} />
            </SafeTabPanel>
            {!isBareMetal && (
              <SafeTabPanel index={1} data-qa-tab="Glish">
                <Glish token={token} linode={linode} />
              </SafeTabPanel>
            )}
          </TabPanels>
        </Tabs>
      )}
    </React.Fragment>
  );
};

export default Lish;

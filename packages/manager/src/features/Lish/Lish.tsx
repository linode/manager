import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { Theme, makeStyles } from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
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

  const { linodeId, type } = useParams<{ linodeId: string; type: string }>();
  const id = Number(linodeId);

  const {
    data: linode,
    isLoading: isLinodeLoading,
    error: linodeError,
  } = useLinodeQuery(id);

  const {
    data,
    isLoading: isTokenLoading,
    error: tokenError,
    refetch,
  } = useLinodeLishTokenQuery(id);

  const isLoading = isLinodeLoading || isTokenLoading;

  const token = data?.lish_token;

  React.useEffect(() => {
    const webLishCss = import('' + '../../assets/weblish/weblish.css');
    const xtermCss = import('' + '../../assets/weblish/xterm.css');
    Promise.all([webLishCss, xtermCss]);

    const interval = setInterval(checkAuthentication, AUTH_POLLING_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const checkAuthentication = () => {
    const token = window.localStorage.getItem('authentication/token');

    if (!token) {
      window.close();
    }
  };

  const isBareMetal = linode && linode.type && linode.type.includes('metal');

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Weblish',
      routeName: `/linodes/${id}/lish/weblish`,
    },
    !isBareMetal
      ? {
          title: 'Glish',
          routeName: `/linodes/${id}/lish/glish`,
        }
      : null,
  ].filter(Boolean) as Tab[];

  const navToURL = (index: number) => {
    history.replace(`/linodes/${id}/lish/${tabs[index].title.toLowerCase()}`);
  };

  const refreshToken = async () => {
    await refetch();
  };

  if (isLoading) {
    return <CircleProgress className={classes.progress} noInner />;
  }

  if (linodeError) {
    return (
      <ErrorState
        errorText={linodeError?.[0]?.reason ?? 'Unable to load this Linode'}
      />
    );
  }

  if (tokenError) {
    return (
      <ErrorState
        errorText={
          tokenError?.[0]?.reason ??
          'Unable to load a Lish token for this Linode'
        }
      />
    );
  }

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <React.Fragment>
      {linode && token && (
        <Tabs
          className={classes.tabs}
          onChange={navToURL}
          index={
            type &&
            tabs.findIndex((tab) => tab.title.toLocaleLowerCase() === type) !==
              -1
              ? tabs.findIndex((tab) => tab.title.toLocaleLowerCase() === type)
              : 0
          }
        >
          <TabLinkList tabs={tabs} />
          <TabPanels>
            <SafeTabPanel index={0} data-qa-tab="Weblish">
              <Weblish
                token={token}
                linode={linode}
                refreshToken={refreshToken}
              />
            </SafeTabPanel>
            {!isBareMetal && (
              <SafeTabPanel index={1} data-qa-tab="Glish">
                <Glish
                  token={token}
                  linode={linode}
                  refreshToken={refreshToken}
                />
              </SafeTabPanel>
            )}
          </TabPanels>
        </Tabs>
      )}
    </React.Fragment>
  );
};

export default Lish;

import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { Tab } from 'src/components/TabLinkList/TabLinkList';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import {
  useLinodeLishTokenQuery,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';

import Glish from './Glish';
import Weblish from './Weblish';

const AUTH_POLLING_INTERVAL = 2000;

const useStyles = makeStyles((theme: Theme) => ({
  notFound: {
    '& h1': {
      color: '#f4f4f4 !important',
    },
    color: '#f4f4f4 !important',
  },
  progress: {
    height: 'auto',
  },
  tabs: {
    '& [role="tab"]': {
      '&[aria-selected="true"]': {
        '&:hover': {
          backgroundColor: theme.palette.primary.light,
          color: 'white',
        },
        backgroundColor: theme.palette.primary.main,
        borderBottom: 'none !important',
        color: 'white !important',
      },
      backgroundColor: theme.bg.offWhite,
      color: theme.color.tableHeaderText,
      flex: 'auto',
      margin: 0,
      maxWidth: 'none !important',
    },
    '& [role="tablist"]': {
      backgroundColor: theme.bg.offWhite,
      display: 'flex',
      margin: 0,
      overflow: 'hidden',
    },
    backgroundColor: 'black',
    margin: 0,
  },
}));

const Lish = () => {
  const classes = useStyles();
  const history = useHistory();

  const { linodeId, type } = useParams<{ linodeId: string; type: string }>();
  const id = Number(linodeId);

  const {
    data: linode,
    error: linodeError,
    isLoading: isLinodeLoading,
  } = useLinodeQuery(id);

  const {
    data,
    error: tokenError,
    isLoading: isTokenLoading,
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
      routeName: `/linodes/${id}/lish/weblish`,
      title: 'Weblish',
    },
    !isBareMetal
      ? {
          routeName: `/linodes/${id}/lish/glish`,
          title: 'Glish',
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
          index={
            type &&
            tabs.findIndex((tab) => tab.title.toLocaleLowerCase() === type) !==
              -1
              ? tabs.findIndex((tab) => tab.title.toLocaleLowerCase() === type)
              : 0
          }
          className={classes.tabs}
          onChange={navToURL}
        >
          <TabLinkList tabs={tabs} />
          <TabPanels>
            <SafeTabPanel data-qa-tab="Weblish" index={0}>
              <Weblish
                linode={linode}
                refreshToken={refreshToken}
                token={token}
              />
            </SafeTabPanel>
            {!isBareMetal && (
              <SafeTabPanel data-qa-tab="Glish" index={1}>
                <Glish
                  linode={linode}
                  refreshToken={refreshToken}
                  token={token}
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

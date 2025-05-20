import { useLinodeLishQuery, useLinodeQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useInitialRequests } from 'src/hooks/useInitialRequests';

import '../../assets/weblish/weblish.css';
import '../../assets/weblish/xterm.css';
import Glish from './Glish';
import Weblish from './Weblish';

import type { Tab } from 'src/components/Tabs/TabLinkList';

const AUTH_POLLING_INTERVAL = 2000;

export interface RetryLimiterInterface {
  reset: () => void;
  retryAllowed: () => boolean;
}

export const RetryLimiter = (
  maxTries: number,
  perTimeWindowMs: number
): RetryLimiterInterface => {
  let retryTimes: number[] = [];

  return {
    reset: (): void => {
      retryTimes = [];
    },
    retryAllowed: (): boolean => {
      const now = Date.now();
      retryTimes.push(now);
      const cutOffTime = now - perTimeWindowMs;
      while (retryTimes.length && retryTimes[0] < cutOffTime) {
        retryTimes.shift();
      }
      return retryTimes.length < maxTries;
    },
  };
};

export interface LishErrorInterface {
  formatted: string;
  grn: string;
  isExpired: boolean;
  reason: string;
}

export const ParsePotentialLishErrorString = (
  s: null | string
): LishErrorInterface | null => {
  if (!s) {
    return null;
  }

  let parsed = null;
  try {
    parsed = JSON.parse(s);
  } catch {
    return null;
  }

  const grn = typeof parsed?.grn === 'string' ? parsed?.grn : '';
  const grnFormatted = grn ? ` (${grn})` : '';

  {
    const reason = parsed?.reason;
    if (parsed?.type === 'error' && typeof reason === 'string') {
      const formattedPrefix = reason.indexOf(' ') >= 0 ? '' : 'Error code: ';
      return {
        formatted: formattedPrefix + reason + grnFormatted,
        grn,
        isExpired: reason.toLowerCase() === 'your session has expired.',
        reason,
      };
    }
  }
  return null;
};

const Lish = () => {
  const history = useHistory();

  const { isLoading: isMakingInitialRequests } = useInitialRequests();

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
  } = useLinodeLishQuery(id);

  const isLoading =
    isLinodeLoading || isTokenLoading || isMakingInitialRequests;

  React.useEffect(() => {
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

  if (isLoading || !linode || !data) {
    return <CircleProgress />;
  }

  if (linodeError) {
    return (
      <ErrorState
        errorText={linodeError?.[0]?.reason ?? 'Unable to load this Linode'}
        typographySx={(theme) => ({ color: theme.palette.common.white })}
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
        typographySx={(theme) => ({ color: theme.palette.common.white })}
      />
    );
  }

  return (
    <StyledTabs
      index={
        type &&
        tabs.findIndex((tab) => tab.title.toLocaleLowerCase() === type) !== -1
          ? tabs.findIndex((tab) => tab.title.toLocaleLowerCase() === type)
          : 0
      }
      onChange={navToURL}
    >
      <TabLinkList tabs={tabs} />
      <TabPanels>
        <SafeTabPanel data-qa-tab="Weblish" index={0}>
          <Weblish linode={linode} refreshToken={refreshToken} {...data} />
        </SafeTabPanel>
        {!isBareMetal && (
          <SafeTabPanel data-qa-tab="Glish" index={1}>
            <Glish linode={linode} refreshToken={refreshToken} {...data} />
          </SafeTabPanel>
        )}
      </TabPanels>
    </StyledTabs>
  );
};

export default Lish;

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& [data-reach-tab][role="tab"]': {
    '&[aria-selected="true"]': {
      '&:hover': {
        backgroundColor: theme.palette.primary.light,
        color: theme.name === 'light' ? theme.color.white : theme.color.black,
      },
      backgroundColor: theme.palette.primary.main,
      borderBottom: 'none !important',
      color: theme.name === 'light' ? theme.color.white : theme.color.black,
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
    marginBottom: '0 !important',
    overflow: 'hidden',
  },
}));

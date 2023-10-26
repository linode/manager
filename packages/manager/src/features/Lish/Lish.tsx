import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { Tab } from 'src/components/TabLinkList/TabLinkList';
import {
  useLinodeLishTokenQuery,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';

import '../../assets/weblish/weblish.css';
import '../../assets/weblish/xterm.css';
import Glish from './Glish';
import Weblish from './Weblish';
import { useInitialRequests } from 'src/components/AuthenticationWrapper/AuthenticationWrapper';

const AUTH_POLLING_INTERVAL = 2000;

const Lish = () => {
  const history = useHistory();

  const { isLoading: isMakingInitalRequests } = useInitialRequests();

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

  const isLoading = isLinodeLoading || isTokenLoading || isMakingInitalRequests;

  const token = data?.lish_token;

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

  if (isLoading) {
    return <StyledCircleProgress />;
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

  return linode && token ? (
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
          <Weblish linode={linode} refreshToken={refreshToken} token={token} />
        </SafeTabPanel>
        {!isBareMetal && (
          <SafeTabPanel data-qa-tab="Glish" index={1}>
            <Glish linode={linode} refreshToken={refreshToken} token={token} />
          </SafeTabPanel>
        )}
      </TabPanels>
    </StyledTabs>
  ) : null;
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
    margin: 0,
    overflow: 'hidden',
  },
  backgroundColor: 'black',
  margin: 0,
}));

export const StyledCircleProgress = styled(CircleProgress)(() => ({
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
}));

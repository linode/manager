import { Image } from '@linode/api-v4/lib/images';
import { Linode } from '@linode/api-v4/lib/linodes';
import { StackScript } from '@linode/api-v4/lib/stackscripts';
import { ResourcePage } from '@linode/api-v4/lib/types';
import { parse, stringify } from 'qs';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import NavTabs from 'src/components/NavTabs';
import { NavTab } from 'src/components/NavTabs/NavTabs';
import RenderGuard from 'src/components/RenderGuard';
import { MapState } from 'src/store/types';
import { getQueryParam } from 'src/utilities/queryParams';
import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts
} from '../stackScriptUtils';

const StackScriptPanelContent = React.lazy(() =>
  import('./StackScriptPanelContent')
);

export interface ExtendedLinode extends Linode {
  heading: string;
  subHeadings: string[];
}

interface Props {
  error?: string;
  publicImages: Record<string, Image>;
  queryString: string;
  history: RouteComponentProps<{}>['history'];
  location: RouteComponentProps<{}>['location'];
}

type CombinedProps = Props & StateProps & RouteComponentProps<{}>;

const SelectStackScriptPanel: React.FC<CombinedProps> = props => {
  const { publicImages, queryString, username } = props;

  const [, setMounted] = React.useState<boolean>(false);

  // If a user gives an invalid tab type in the query string, replace it with
  // the default. The default tab will be given to the <TabbedPanel /> component
  // anyway, but replacing the query string ensures that the correct tab is
  // bookmark-able.
  const replaceTypeIfInvalid = React.useCallback(() => {
    // The leading '?' is present on the react-router `search` prop, so remove
    // it before parsing the query string.
    const prevQueryString = props.location.search.slice(1);
    const parsedPrevQueryString = parse(prevQueryString);

    const validTabTypes = StackScriptTabs.map(thisTab => thisTab.category);

    if (!validTabTypes.includes(parsedPrevQueryString.type)) {
      const newQueryString = stringify({
        type: StackScriptTabs[0].category,
        // Retain the `query` query param.
        query: parsedPrevQueryString.query
      });
      // Replace current history instead of pushing a new item.
      props.history.replace({
        search: newQueryString
      });
    }
  }, [props.history, props.location.search]);

  React.useEffect(() => {
    setMounted(true);
    replaceTypeIfInvalid();

    return () => {
      setMounted(false);
    };
  }, [replaceTypeIfInvalid]);

  const createTabs = StackScriptTabs.map(tab => ({
    title: tab.title,
    routeName: tab.routeName
  }));

  // When the user clicks on a Tab, update the query string so a specific type
  // of StackScript can be bookmarked.
  const handleTabChange = (value: number = 0) => {
    // Don't do anything if `value` isn't in range of the Tabs array. This is
    // impossible unless the implementation changes.
    if (value < 0 || value > StackScriptTabs.length - 1) {
      return;
    }

    const category = StackScriptTabs[value].category;

    const queryString = stringify({ type: category });

    // Push a new item of browser history here containing the StackScript type.
    // It's OK to clear out the "query" QS param from a UX perspective.
    props.history.push({
      search: queryString
    });
  };

  const tabValue = getTabValueFromQueryString(queryString, StackScriptTabs);

  const tabs: NavTab[] = [
    {
      title: 'Account StackScripts',
      routeName: `/stackscripts?type=account`,
      render: (
        <StackScriptPanelContent
          category="account"
          key="account-tab"
          publicImages={publicImages}
          currentUser={username}
          request={getMineAndAccountStackScripts}
        />
      )
    },
    {
      title: 'Community StackScripts',
      routeName: `/stackscripts?type=community`,
      render: (
        <StackScriptPanelContent
          category="community"
          key="community-tab"
          publicImages={publicImages}
          currentUser={username}
          request={getCommunityStackscripts}
        />
      )
    }
  ];

  return (
    <NavTabs tabs={tabs} />
    // <Tabs defaultIndex={tabValue} onChange={handleTabChange}>
    //   <TabLinkList tabs={createTabs} />
    //   <TabPanels>
    //     <SafeTabPanel index={0}>
    //       <StackScriptPanelContent
    //         publicImages={publicImages}
    //         currentUser={username}
    //         request={getMineAndAccountStackScripts}
    //         key="account-tab"
    //         category="account"
    //       />
    //     </SafeTabPanel>
    //     <SafeTabPanel index={1}>
    //       <StackScriptPanelContent
    //         publicImages={publicImages}
    //         currentUser={username}
    //         request={getCommunityStackscripts}
    //         key="community-tab"
    //         category="community"
    //       />
    //     </SafeTabPanel>
    //   </TabPanels>
    // </Tabs>
  );
};

export interface StackScriptTab {
  title: string;
  request: (
    currentUser: string,
    params?: any,
    filter?: any
  ) => Promise<ResourcePage<StackScript>>;
  category: 'account' | 'community';
  routeName: string;
}

export const StackScriptTabs: StackScriptTab[] = [
  {
    title: 'Account StackScripts',
    request: getMineAndAccountStackScripts,
    category: 'account',
    routeName: '/stackscripts?type=account'
  },
  {
    title: 'Community StackScripts',
    request: getCommunityStackscripts,
    category: 'community',
    routeName: '/stackscripts?type=community'
  }
];

// Returns the index of the desired tab based on a query string. If no type (or
// an unknown type) is specified in the query string, return the default.
export const getTabValueFromQueryString = (
  queryString: string,
  tabs: StackScriptTab[],
  defaultTab: number = 0
) => {
  // Grab the desired type from the query string.
  const stackScriptType = getQueryParam(queryString, 'type');

  // Find the index of the tab whose category matches the desired type.
  const tabIndex = tabs.findIndex(tab => tab.category === stackScriptType);

  // Return the default if the desired type isn't found.
  if (tabIndex === -1) {
    return defaultTab;
  }

  return tabIndex;
};

interface StateProps {
  username: string;
}

const mapStateToProps: MapState<StateProps, Props> = state => ({
  username: state.__resources.profile?.data?.username ?? ''
});

const connected = connect(mapStateToProps);

export default compose<CombinedProps, Props>(
  connected,
  RenderGuard
)(SelectStackScriptPanel);

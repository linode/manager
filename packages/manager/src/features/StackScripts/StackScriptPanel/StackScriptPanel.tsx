import { Image } from '@linode/api-v4/lib/images';
import { Linode } from '@linode/api-v4/lib/linodes';
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
  const { publicImages, username } = props;

  const tabs: NavTab[] = [
    {
      title: 'Account StackScripts',
      category: 'account',
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
      category: 'community',
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

  return <NavTabs tabs={tabs} />;
};

// Returns the index of the desired tab based on a query string. If no type (or
// an unknown type) is specified in the query string, return the default.
// Used in tests
export const getTabValueFromQueryString = (
  queryString: string,
  tabs: NavTab[],
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

import { Image } from '@linode/api-v4/lib/images';
import { Linode } from '@linode/api-v4/lib/linodes';
import { StackScript } from '@linode/api-v4/lib/stackscripts';
import { ResourcePage } from '@linode/api-v4/lib/types';
import { parse, stringify } from 'qs';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import RenderGuard from 'src/components/RenderGuard';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import { MapState } from 'src/store/types';
import { getQueryParam } from 'src/utilities/queryParams';
import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts
} from '../stackScriptUtils';
import StackScriptPanelContent from './StackScriptPanelContent';

export interface ExtendedLinode extends Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginBottom: theme.spacing(3),
      padding: '0 !important'
    }
  });

interface Props {
  error?: string;
  publicImages: Record<string, Image>;
  queryString: string;
  history: RouteComponentProps<{}>['history'];
  location: RouteComponentProps<{}>['location'];
}

type CombinedProps = Props &
  StateProps &
  WithStyles<ClassNames> &
  RouteComponentProps<{}>;

class SelectStackScriptPanel extends React.Component<CombinedProps, {}> {
  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.replaceTypeIfInvalid();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  // If a user gives an invalid tab type in the query string, replace it with
  // the default. The default tab will be given to the <TabbedPanel /> component
  // anyway, but replacing the query string ensures that the correct tab is
  // bookmark-able.
  replaceTypeIfInvalid = () => {
    // The leading '?' is present on the react-router `search` prop, so remove
    // it before parsing the query string.
    const prevQueryString = this.props.location.search.slice(1);
    const parsedPrevQueryString = parse(prevQueryString);

    const validTabTypes = StackScriptTabs.map(thisTab => thisTab.category);

    if (!validTabTypes.includes(parsedPrevQueryString.type)) {
      const newQueryString = stringify({
        type: StackScriptTabs[0].category,
        // Retain the `query` query param.
        query: parsedPrevQueryString.query
      });
      // Replace current history instead of pushing a new item.
      this.props.history.replace({
        search: newQueryString
      });
    }
  };

  createTabs = StackScriptTabs.map(tab => ({
    title: tab.title,
    routeName: tab.routeName
  }));

  // When the user clicks on a Tab, update the query string so a specific type
  // of StackScript can be bookmarked.
  handleTabChange = (value: number = 0) => {
    // Don't do anything if `value` isn't in range of the Tabs array. This is
    // impossible unless the implementation changes.
    if (value < 0 || value > StackScriptTabs.length - 1) {
      return;
    }

    const category = StackScriptTabs[value].category;

    const queryString = stringify({ type: category });

    // Push a new item of browser history here containing the StackScript type.
    // It's OK to clear out the "query" QS param from a UX perspective.
    this.props.history.push({
      search: queryString
    });
  };

  render() {
    const { classes, queryString } = this.props;

    const tabValue = getTabValueFromQueryString(queryString, StackScriptTabs);

    return (
      <div className={classes.root}>
        <Tabs defaultIndex={tabValue} onChange={this.handleTabChange}>
          <TabLinkList tabs={this.createTabs} />
          <TabPanels>
            <SafeTabPanel index={0}>
              <StackScriptPanelContent
                publicImages={this.props.publicImages}
                currentUser={this.props.username}
                request={getMineAndAccountStackScripts}
                key="account-tab"
                category="account"
              />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <StackScriptPanelContent
                publicImages={this.props.publicImages}
                currentUser={this.props.username}
                request={getCommunityStackscripts}
                key="community-tab"
                category="community"
              />
            </SafeTabPanel>
          </TabPanels>
        </Tabs>
      </div>
    );
  }
}

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

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  connected,
  RenderGuard,
  styled
)(SelectStackScriptPanel);

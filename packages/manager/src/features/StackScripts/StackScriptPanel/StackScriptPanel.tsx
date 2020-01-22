import { Image } from 'linode-js-sdk/lib/images';
import { Linode } from 'linode-js-sdk/lib/linodes';
import { StackScript } from 'linode-js-sdk/lib/stackscripts';
import { ResourcePage } from 'linode-js-sdk/lib/types';
import { stringify } from 'qs';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import RenderGuard from 'src/components/RenderGuard';
import TabbedPanel from 'src/components/TabbedPanel';
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

type ClassNames = 'root' | 'creating' | 'table' | 'link';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginBottom: theme.spacing(3)
    },
    table: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.color.white
    },
    creating: {
      paddingTop: 0
    },
    link: {
      display: 'block',
      textAlign: 'right',
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(1)
    }
  });

interface Props {
  error?: string;
  publicImages: Record<string, Image>;
  queryString: string;
  history: RouteComponentProps<{}>['history'];
}

type CombinedProps = Props & StateProps & WithStyles<ClassNames>;

class SelectStackScriptPanel extends React.Component<CombinedProps, {}> {
  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  createTabs = StackScriptTabs.map(tab => ({
    title: tab.title,
    render: () => (
      <StackScriptPanelContent
        publicImages={this.props.publicImages}
        currentUser={this.props.username}
        request={tab.request}
        key={tab.category + '-tab'}
        category={tab.category}
      />
    )
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

    const queryString = '?' + stringify({ type: category });

    // Push a new item of browser history here containing the StackScript type.
    // It's OK to clear out the "query" QS param from a UX perspective.
    this.props.history.push({
      search: queryString
    });
  };

  render() {
    const { error, classes, queryString } = this.props;

    const tabValue = getTabValueFromQueryString(queryString, StackScriptTabs);

    return (
      <React.Fragment>
        <TabbedPanel
          error={error}
          rootClass={classes.root}
          shrinkTabContent={classes.creating}
          tabs={this.createTabs}
          header=""
          value={tabValue}
          handleTabChange={this.handleTabChange}
        />
      </React.Fragment>
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
}

export const StackScriptTabs: StackScriptTab[] = [
  {
    title: 'Account StackScripts',
    request: getMineAndAccountStackScripts,
    category: 'account'
  },
  {
    title: 'Community StackScripts',
    request: getCommunityStackscripts,
    category: 'community'
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

import { Image } from 'linode-js-sdk/lib/images';
import { Linode } from 'linode-js-sdk/lib/linodes';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
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
    name: tab.name,
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

  render() {
    const { error, classes } = this.props;

    return (
      <React.Fragment>
        <TabbedPanel
          error={error}
          rootClass={classes.root}
          shrinkTabContent={classes.creating}
          tabs={this.createTabs}
          header=""
          initTab={0}
        />
      </React.Fragment>
    );
  }
}

export const StackScriptTabs = [
  {
    title: 'Account StackScripts',
    request: getMineAndAccountStackScripts,
    category: 'account',
    name: 'account-stackscripts'
  },
  {
    title: 'Community StackScripts',
    request: getCommunityStackscripts,
    category: 'community',
    name: 'community-stackscripts'
  }
];

interface StateProps {
  username: string;
}

const mapStateToProps: MapState<StateProps, Props> = state => ({
  username: pathOr('', ['data', 'username'], state.__resources.profile)
});

const connected = connect(mapStateToProps);

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  connected,
  RenderGuard,
  styled
)(SelectStackScriptPanel);

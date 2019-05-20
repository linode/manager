import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import {
  StyleRulesCallback,
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

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'root' | 'creating' | 'table' | 'link';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    marginBottom: theme.spacing.unit * 3
  },
  table: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.color.white
  },
  creating: {
    paddingTop: 0,
    marginTop: theme.spacing.unit * 2,
    '-webkit-appearance': 'none'
  },
  link: {
    display: 'block',
    textAlign: 'right',
    marginBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit
  }
});

interface Props {
  error?: string;
  publicImages: Linode.Image[];
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
    category: 'account'
  },
  {
    title: 'Community StackScripts',
    request: getCommunityStackscripts,
    category: 'community'
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

export default compose<
  Linode.TodoAny,
  Linode.TodoAny,
  Linode.TodoAny,
  Linode.TodoAny
>(
  connected,
  RenderGuard,
  styled
)(SelectStackScriptPanel);

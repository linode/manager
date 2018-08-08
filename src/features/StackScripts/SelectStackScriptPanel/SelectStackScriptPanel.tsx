import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import RenderGuard from 'src/components/RenderGuard';
import TabbedPanel from 'src/components/TabbedPanel';

import {
  getCommunityStackscripts,
  getStackScriptsByUser,
} from 'src/services/stackscripts';

import SelectStackScriptPanelContent from './SelectStackScriptPanelContent';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'root'
  | 'creating'
  | 'selecting';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 3,
  },
  creating: {
    height: 400,
    overflowX: 'auto',
    paddingTop: 0,
    marginTop: theme.spacing.unit * 2,
    overflowY: 'scroll',
    '-webkit-appearance': 'none',
  },
  selecting: {
    minHeight: '400px',
    maxHeight: '1000px',
    overflowX: 'auto',
    overflowY: 'scroll',
    paddingTop: 0,
    marginTop: theme.spacing.unit * 2,
  },
});

interface Props {
  selectedId: number | undefined;
  selectedUsername?: string;
  error?: string;
  shrinkPanel?: boolean;
  onSelect?: (id: number, label: string, username: string, images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => void;
  publicImages: Linode.Image[];
  noHeader?: boolean;
  profile: Linode.Profile;
  resetSelectedStackScript?: () => void;
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

interface State {
  shouldPreSelectStackScript: boolean;
}

class SelectStackScriptPanel extends React.Component<CombinedProps, State> {

  state: State = {
    shouldPreSelectStackScript: true,
  }

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  tabs = [
    {
      title: 'My StackScripts',
      render: () => <SelectStackScriptPanelContent
        onSelect={this.props.onSelect}
        publicImages={this.props.publicImages}
        currentUser={this.props.profile.username}
        request={getStackScriptsByUser}
        selectedStackScriptIDFromQuery={this.props.selectedId}
        shouldPreSelectStackScript={this.state.shouldPreSelectStackScript}
        key={0}
        resetStackScriptSelection={this.maybeResetStackScript}
      />,
    },
    {
      title: 'Linode StackScripts',
      render: () => <SelectStackScriptPanelContent
        onSelect={this.props.onSelect}
        publicImages={this.props.publicImages}
        currentUser={this.props.profile.username}
        request={getStackScriptsByUser}
        selectedStackScriptIDFromQuery={this.props.selectedId}
        key={1}
        isLinodeStackScripts={true}
        shouldPreSelectStackScript={this.state.shouldPreSelectStackScript}
        resetStackScriptSelection={this.maybeResetStackScript}
      />,
    },
    {
      title: 'Community StackScripts',
      render: () => <SelectStackScriptPanelContent
        onSelect={this.props.onSelect}
        publicImages={this.props.publicImages}
        currentUser={this.props.profile.username}
        request={getCommunityStackscripts}
        selectedStackScriptIDFromQuery={this.props.selectedId}
        shouldPreSelectStackScript={this.state.shouldPreSelectStackScript}
        resetStackScriptSelection={this.maybeResetStackScript}
        key={2}
      />,
    },
  ];

  myTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('my'));
  linodeTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('linode'));
  communityTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('community'));

  /*
  ** init tab needs to be set if we're being navigated from another page
  ** by means of a query string. The query string may looks similar to this:
  ** /linodes/create?type=fromStackScript&stackScriptID=9409&stackScriptUsername=clowwindy
  ** so we need a way to determined what tab the user should be on when
  ** seeing the panel. Default to 0 index if no query string
  */
  getInitTab = () => {
    const { profile, onSelect, selectedUsername } = this.props;

    if (profile.username === selectedUsername) {
      return this.myTabIndex;
    }
    if (selectedUsername === 'linode') {
      return this.linodeTabIndex;
    }
    if (selectedUsername !== ''
      && selectedUsername !== 'linode'
      && selectedUsername !== profile.username
      && !!onSelect) {
      return this.communityTabIndex;
    }
    return this.myTabIndex;
  }

  maybeResetStackScript = () => {
    const { resetSelectedStackScript } = this.props;
    if (resetSelectedStackScript) {
      resetSelectedStackScript();
    }
    return;
  }

  handleTabChange = () => {
    /*
    * if we're coming from a query string, the stackscript will be preselected
    * however, we don't want the user to have their stackscript still preselected
    * when they change StackScript tabs
    */
    this.setState({ shouldPreSelectStackScript: false });
    this.maybeResetStackScript();
  }

  render() {
    const { error, noHeader, shrinkPanel, classes } = this.props;

    return (
      <TabbedPanel
        error={error}
        rootClass={classes.root}
        shrinkTabContent={(shrinkPanel) ? classes.creating : classes.selecting}
        header={(noHeader) ? "" : "Select StackScript"}
        tabs={this.tabs}
        initTab={this.getInitTab()}
        handleTabChange={this.handleTabChange}
      />
    );
  }
}

const mapStateToProps = (state: Linode.AppState) => ({
  profile: pathOr({}, ['resources', 'profile', 'data'], state),
});

const styled = withStyles(styles, { withTheme: true });

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  connect(mapStateToProps),
  RenderGuard,
  styled,
)(SelectStackScriptPanel);

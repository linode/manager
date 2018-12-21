import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RenderGuard from 'src/components/RenderGuard';
import TabbedPanel from 'src/components/TabbedPanel';
import StackScriptPanelContent from './StackScriptPanelContent';
import { getAccountStackScripts, getCommunityStackscripts, getStackScriptsByUser } from './stackScriptUtils';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'root'
  | 'creating'
  | 'table'
  | 'link'
  | 'selecting';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 3,
  },
  table: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.color.white,
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
  link: {
    display: 'block',
    textAlign: 'right',
    marginBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit,
  }
});

interface Props {
  error?: string;
  publicImages: Linode.Image[];
  noHeader?: boolean;
}

type CombinedProps = Props &  StateProps & WithStyles<ClassNames>;

interface State {
  stackScriptError: boolean;
}

class SelectStackScriptPanel extends React.Component<CombinedProps, State> {

  state: State = {
    stackScriptError: false
  }

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  createTabs = [
    {
      title: 'My StackScripts',
      render: () => <StackScriptPanelContent
        publicImages={this.props.publicImages}
        currentUser={this.props.username}
        request={getStackScriptsByUser}
        key={0}
        category="my"
      />,
    },
    {
      title: 'Account StackScripts',
      render: () => <StackScriptPanelContent
        publicImages={this.props.publicImages}
        currentUser={this.props.username}
        request={getAccountStackScripts}
        key={1}
        category="account"
      />,
    },
    {
      title: 'Linode StackScripts',
      render: () => <StackScriptPanelContent
        publicImages={this.props.publicImages}
        currentUser={this.props.username}
        request={getStackScriptsByUser}
        key={2}
        category="linode"
      />,
    },
    {
      title: 'Community StackScripts',
      render: () => <StackScriptPanelContent
        category="community"
        publicImages={this.props.publicImages}
        currentUser={this.props.username}
        request={getCommunityStackscripts}
        key={3}
      />,
    },
  ];

  getInitTab = () => {
    return 0;
  }

  render() {
    const { error, noHeader, classes } = this.props;
    const { stackScriptError } = this.state;

    return (
      <React.Fragment>
        {stackScriptError && <Typography variant="body2">
          An error occured while loading selected stackScript. Please, choose one of the list.
        </Typography>}
        <TabbedPanel
          error={error}
          rootClass={classes.root}
          shrinkTabContent={(!noHeader) ? classes.creating : classes.selecting}
          header={(noHeader) ? "" : "Select StackScript"}
          tabs={this.createTabs}
          initTab={this.getInitTab()}
        />
      </React.Fragment>
    );
  }
}

interface StateProps {
  username: string;
}

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state) => ({
  username: pathOr('', ['data', 'username'], state.__resources.profile),
});

const connected = connect(mapStateToProps);

const styled = withStyles(styles);

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  connected,
  RenderGuard,
  styled,
)(SelectStackScriptPanel);

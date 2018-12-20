import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RenderGuard from 'src/components/RenderGuard';
import SelectionRow from 'src/components/SelectionRow';
import TabbedPanel from 'src/components/TabbedPanel';
import Table from 'src/components/Table';
import { getStackScript } from 'src/services/stackscripts';
import { formatDate } from 'src/utilities/format-date-iso8601';
import stripImageName from 'src/utilities/stripImageName';
import truncateText from 'src/utilities/truncateText';
import StackScriptTableHead from './PanelContent/StackScriptTableHead';
import SelectStackScriptPanelContent from './SelectStackScriptPanelContent';
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
  selectedId: number | undefined;
  selectedUsername?: string;
  error?: string;
  onSelect?: (id: number, label: string, username: string, images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => void;
  publicImages: Linode.Image[];
  noHeader?: boolean;
  resetSelectedStackScript?: () => void;
}

type CombinedProps = Props &  StateProps & WithStyles<ClassNames>;

interface State {
  shouldPreSelectStackScript: boolean;
  stackScript?: Linode.StackScript.Response;
  stackScriptError: boolean;
  stackScriptLoading: boolean;
}

class SelectStackScriptPanel extends React.Component<CombinedProps, State> {

  state: State = {
    shouldPreSelectStackScript: true,
    stackScriptLoading: false,
    stackScriptError: false
  }

  mounted: boolean = false;

  componentDidMount() {
    if (this.props.selectedId) {
      this.setState({stackScriptLoading: true});
      this.setState({  });
      getStackScript(this.props.selectedId).then(stackScript => {
        this.setState({stackScript, stackScriptLoading: false});
      }).catch(e => {
        this.setState({stackScriptLoading: false, stackScriptError: true});
      })
    }
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  createTabs = [
    {
      title: 'My StackScripts',
      render: () => <SelectStackScriptPanelContent
        onSelect={this.props.onSelect}
        publicImages={this.props.publicImages}
        currentUser={this.props.username}
        request={getStackScriptsByUser}
        selectedStackScriptIDFromQuery={this.props.selectedId}
        shouldPreSelectStackScript={this.state.shouldPreSelectStackScript}
        key={0}
        resetStackScriptSelection={this.maybeResetStackScript}
        category="my"
      />,
    },
    {
      title: 'Account StackScripts',
      render: () => <SelectStackScriptPanelContent
        onSelect={this.props.onSelect}
        publicImages={this.props.publicImages}
        currentUser={this.props.username}
        request={getAccountStackScripts}
        selectedStackScriptIDFromQuery={this.props.selectedId}
        shouldPreSelectStackScript={this.state.shouldPreSelectStackScript}
        key={1}
        resetStackScriptSelection={this.maybeResetStackScript}
        category="account"
      />,
    },
    {
      title: 'Linode StackScripts',
      render: () => <SelectStackScriptPanelContent
        onSelect={this.props.onSelect}
        publicImages={this.props.publicImages}
        currentUser={this.props.username}
        request={getStackScriptsByUser}
        selectedStackScriptIDFromQuery={this.props.selectedId}
        key={2}
        category="linode"
        shouldPreSelectStackScript={this.state.shouldPreSelectStackScript}
        resetStackScriptSelection={this.maybeResetStackScript}
      />,
    },
    {
      title: 'Community StackScripts',
      render: () => <SelectStackScriptPanelContent
        category="community"
        onSelect={this.props.onSelect}
        publicImages={this.props.publicImages}
        currentUser={this.props.username}
        request={getCommunityStackscripts}
        selectedStackScriptIDFromQuery={this.props.selectedId}
        shouldPreSelectStackScript={this.state.shouldPreSelectStackScript}
        resetStackScriptSelection={this.maybeResetStackScript}
        key={3}
      />,
    },
  ];

  getInitTab = () => {
    return 0;
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

  resetStackScript = () => {
    this.setState({stackScript: undefined, stackScriptLoading: false});
  }

  render() {
    const { error, noHeader, classes, selectedId } = this.props;
    const { stackScript, stackScriptLoading, stackScriptError } = this.state;

    if (selectedId) {
      if (stackScriptLoading) {
        return (<CircleProgress />)
      }
      if (stackScript) {
        return (
          <React.Fragment>
            <Table
              isResponsive={false}
              aria-label="List of StackScripts"
              noOverflow={true}
              tableClass={classes.table}>
              <StackScriptTableHead
                currentFilterType={null}
                isSelecting={true}
              />
              <tbody>
                <SelectionRow
                  key={stackScript.id}
                  label={stackScript.label}
                  stackScriptUsername={stackScript.username}
                  disabledCheckedSelect={true}
                  description={truncateText(stackScript.description, 100)}
                  isPublic={stackScript.is_public}
                  images={stripImageName(stackScript.images)}
                  deploymentsActive={stackScript.deployments_active}
                  updated={formatDate(stackScript.updated, false)}
                  checked={selectedId === stackScript.id}
                  updateFor={[selectedId === stackScript.id]}
                  stackScriptID={stackScript.id}
                  canDelete={false}
                  canEdit={false}
                />
              </tbody>
            </Table>
            <div className={classes.link}>
              <Link
                to="/linodes/create?type=fromStackScript"
                onClick={this.resetStackScript}
                >
                Choose another StackScript
              </Link>
            </div>
          </React.Fragment>
        )
      }
    }

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
          handleTabChange={this.handleTabChange}
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

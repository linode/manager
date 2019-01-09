import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RenderGuard from 'src/components/RenderGuard';
import TabbedPanel from 'src/components/TabbedPanel';
import Table from 'src/components/Table';
import { getStackScript } from 'src/services/stackscripts';
import { formatDate } from 'src/utilities/format-date-iso8601';
import stripImageName from 'src/utilities/stripImageName';
import truncateText from 'src/utilities/truncateText';
import SelectStackScriptPanelContent from './SelectStackScriptPanelContent';

import StackScriptTableHead from '../Partials/StackScriptTableHead';
import { StackScriptTabs } from '../stackScriptUtils';
import StackScriptSelectionRow from './StackScriptSelectionRow';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'root'
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
  onSelect: (id: number, label: string, username: string, images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => void;
  publicImages: Linode.Image[];
  resetSelectedStackScript: () => void;
}

type CombinedProps = Props &  StateProps & WithStyles<ClassNames>;

interface State {
  stackScript?: Linode.StackScript.Response;
  stackScriptError: boolean;
  stackScriptLoading: boolean;
}

class SelectStackScriptPanel extends React.Component<CombinedProps, State> {

  state: State = {
    stackScriptLoading: false,
    stackScriptError: false
  }

  mounted: boolean = false;

  componentDidMount() {
    if (this.props.selectedId) {
      this.setState({stackScriptLoading: true});
      getStackScript(this.props.selectedId).then(stackScript => {
        this.setState({stackScript, stackScriptLoading: false});
        this.props.onSelect(stackScript.id, stackScript.label, stackScript.username, stackScript.images, stackScript.user_defined_fields);
      }).catch(e => {
        this.setState({stackScriptLoading: false, stackScriptError: true});
      })
    }
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  createTabs = StackScriptTabs.map(tab => ({
    title: tab.title,
    render: () => <SelectStackScriptPanelContent
      onSelect={this.props.onSelect}
      resetStackScriptSelection={this.props.resetSelectedStackScript}
      publicImages={this.props.publicImages}
      currentUser={this.props.username}
      request={tab.request}
      key={tab.category + '-tab'}
      category={tab.category}
    />
  }));

  handleTabChange = () => {
    /*
    * if we're coming from a query string, the stackscript will be preselected
    * however, we don't want the user to have their stackscript still preselected
    * when they change StackScript tabs
    */
    this.props.resetSelectedStackScript();
  }

  resetStackScript = () => {
    this.setState({stackScript: undefined, stackScriptLoading: false});
  }

  render() {
    const { error, classes, selectedId } = this.props;
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
                <StackScriptSelectionRow
                  key={stackScript.id}
                  label={stackScript.label}
                  stackScriptUsername={stackScript.username}
                  disabledCheckedSelect
                  onSelect={() => {}}
                  description={truncateText(stackScript.description, 100)}
                  images={stripImageName(stackScript.images)}
                  deploymentsActive={stackScript.deployments_active}
                  updated={formatDate(stackScript.updated, false)}
                  checked={selectedId === stackScript.id}
                  updateFor={[selectedId === stackScript.id]}
                  stackScriptID={stackScript.id}
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
          shrinkTabContent={classes.selecting}
          header={"Select StackScript"}
          tabs={this.createTabs}
          initTab={0}
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

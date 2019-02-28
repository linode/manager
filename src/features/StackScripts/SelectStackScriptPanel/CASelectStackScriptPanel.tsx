import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RenderGuard from 'src/components/RenderGuard';
import Table from 'src/components/Table';
import { getStackScript } from 'src/services/stackscripts';
import { MapState } from 'src/store/types';
import { formatDate } from 'src/utilities/format-date-iso8601';
import stripImageName from 'src/utilities/stripImageName';
import truncateText from 'src/utilities/truncateText';
import StackScriptTableHead from '../Partials/StackScriptTableHead';
import SelectStackScriptPanelContent from './SelectStackScriptPanelContent';
import StackScriptSelectionRow from './StackScriptSelectionRow';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames =
  | 'root'
  | 'table'
  | 'link'
  | 'selecting'
  | 'panel'
  | 'inner'
  | 'header';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    marginBottom: theme.spacing.unit * 3
  },
  table: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.color.white
  },
  selecting: {
    minHeight: '400px',
    maxHeight: '1000px',
    overflowX: 'auto',
    overflowY: 'scroll',
    paddingTop: 0,
    marginTop: theme.spacing.unit * 2
  },
  link: {
    display: 'block',
    textAlign: 'right',
    marginBottom: 24,
    marginTop: theme.spacing.unit
  },
  panel: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.color.white
  },
  inner: {
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing.unit * 3
    }
  },
  header: {
    paddingBottom: theme.spacing.unit * 2
  }
});

interface Props {
  selectedId: number | undefined;
  selectedUsername?: string;
  error?: string;
  onSelect: (
    id: number,
    label: string,
    username: string,
    images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]
  ) => void;
  publicImages: Linode.Image[];
  resetSelectedStackScript: () => void;
  disabled?: boolean;
  request: () => Promise<Linode.ResourcePage<any>>;
  category: string;
  header: string;
}

type CombinedProps = Props & StateProps & WithStyles<ClassNames>;

interface State {
  stackScript?: Linode.StackScript.Response;
  stackScriptError: boolean;
  stackScriptLoading: boolean;
}

class SelectStackScriptPanel extends React.Component<CombinedProps, State> {
  state: State = {
    stackScriptLoading: false,
    stackScriptError: false
  };

  mounted: boolean = false;

  componentDidMount() {
    if (this.props.selectedId) {
      this.setState({ stackScriptLoading: true });
      getStackScript(this.props.selectedId)
        .then(stackScript => {
          this.setState({ stackScript, stackScriptLoading: false });
          this.props.onSelect(
            stackScript.id,
            stackScript.label,
            stackScript.username,
            stackScript.images,
            stackScript.user_defined_fields
          );
        })
        .catch(e => {
          this.setState({ stackScriptLoading: false, stackScriptError: true });
        });
    }
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleTabChange = () => {
    /*
     * if we're coming from a query string, the stackscript will be preselected
     * however, we don't want the user to have their stackscript still preselected
     * when they change StackScript tabs
     */
    this.props.resetSelectedStackScript();
  };

  resetStackScript = () => {
    this.setState({ stackScript: undefined, stackScriptLoading: false });
  };

  render() {
    const { category, classes, header, request, selectedId } = this.props;
    const { stackScript, stackScriptLoading, stackScriptError } = this.state;

    if (selectedId) {
      if (stackScriptLoading) {
        return <CircleProgress />;
      }
      if (stackScript) {
        return (
          <React.Fragment>
            <Table
              isResponsive={false}
              aria-label="List of StackScripts"
              noOverflow={true}
              tableClass={classes.table}
            >
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
              <Button
                href="/linodes/create?type=fromStackScript"
                onClick={this.resetStackScript}
                type="secondary"
              >
                Choose another StackScript
              </Button>
            </div>
          </React.Fragment>
        );
      }
    }

    return (
      <Paper className={classes.panel}>
        <div className={classes.inner}>
          {/* {error && <Notice text={error} error />} */}
          <Typography
            className={classes.header}
            role="header"
            variant="h2"
            data-qa-tp-title
          >
            {header}
          </Typography>
          {stackScriptError && (
            <Typography variant="body2">
              An error occured while loading the selected StackScript.
            </Typography>
          )}
          <SelectStackScriptPanelContent
            onSelect={this.props.onSelect}
            resetStackScriptSelection={this.props.resetSelectedStackScript}
            publicImages={this.props.publicImages}
            currentUser={this.props.username}
            request={request}
            key={category + '-tab'}
            category={category}
            disabled={this.props.disabled}
          />
        </div>
      </Paper>
    );
  }
}

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

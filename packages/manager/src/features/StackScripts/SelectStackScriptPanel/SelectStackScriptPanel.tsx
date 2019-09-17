import { Grant } from 'linode-js-sdk/lib/account';
import { Image } from 'linode-js-sdk/lib/images';
import { Linode } from 'linode-js-sdk/lib/linodes';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import Table from 'src/components/Table';
import { getStackScript } from 'src/services/stackscripts';
import { MapState } from 'src/store/types';
import { formatDate } from 'src/utilities/format-date-iso8601';
import { getParamFromUrl } from 'src/utilities/queryParams';
import stripImageName from 'src/utilities/stripImageName';
import truncateText from 'src/utilities/truncateText';
import StackScriptTableHead from '../Partials/StackScriptTableHead';
import SelectStackScriptPanelContent from './SelectStackScriptPanelContent';
import StackScriptSelectionRow from './StackScriptSelectionRow';

export interface ExtendedLinode extends Linode {
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
    selecting: {
      minHeight: '400px',
      maxHeight: '1000px',
      overflowY: 'scroll',
      paddingTop: 0
    },
    link: {
      display: 'block',
      textAlign: 'right',
      marginBottom: 24,
      marginTop: theme.spacing(1)
    },
    panel: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.color.white,
      marginBottom: theme.spacing(3)
    },
    inner: {
      padding: theme.spacing(2),
      paddingTop: 0,
      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(3),
        paddingTop: 0
      }
    },
    header: {}
  });

interface Props extends RenderGuardProps {
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
  publicImages: Record<string, Image>;
  resetSelectedStackScript: () => void;
  disabled?: boolean;
  request: (
    username: string,
    params?: any,
    filter?: any,
    stackScriptGrants?: Grant[]
  ) => Promise<Linode.ResourcePage<any>>;
  category: string;
  header: string;
}

type CombinedProps = Props &
  StateProps &
  RenderGuardProps &
  WithStyles<ClassNames>;

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
    const selected = +getParamFromUrl(location.search, 'stackScriptID');
    /** '' converted to a number is 0 */
    if (!isNaN(selected) && selected !== 0) {
      this.setState({ stackScriptLoading: true });
      getStackScript(selected)
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

  resetStackScript = () => {
    this.setState({ stackScript: undefined, stackScriptLoading: false });
  };

  render() {
    const { category, classes, request, selectedId, error } = this.props;
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
              stickyHeader
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
              <Button onClick={this.resetStackScript} buttonType="secondary">
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
          {error && <Notice text={error} error />}
          {stackScriptError && (
            <Typography variant="body2">
              An error occurred while loading the selected StackScript.
            </Typography>
          )}
          <Paper className={classes.selecting}>
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
          </Paper>
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

export default compose<CombinedProps, Props>(
  connected,
  RenderGuard,
  styled
)(SelectStackScriptPanel);

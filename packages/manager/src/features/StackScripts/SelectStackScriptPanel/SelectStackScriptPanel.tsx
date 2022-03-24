import { Grant } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import { Linode } from '@linode/api-v4/lib/linodes';
import {
  getStackScript,
  StackScript,
  UserDefinedField,
} from '@linode/api-v4/lib/stackscripts';
import { ResourcePage } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import Table from 'src/components/Table';
import withProfile, { ProfileProps } from 'src/components/withProfile';
import { formatDate } from 'src/utilities/formatDate';
import { getParamFromUrl } from 'src/utilities/queryParams';
import { truncate } from 'src/utilities/truncate';
import StackScriptTableHead from '../Partials/StackScriptTableHead';
import SelectStackScriptPanelContent from './SelectStackScriptPanelContent';
import StackScriptSelectionRow from './StackScriptSelectionRow';

export interface ExtendedLinode extends Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'table' | 'selecting' | 'link' | 'panel' | 'inner';

const styles = (theme: Theme) =>
  createStyles({
    table: {
      backgroundColor: theme.color.white,
      flexGrow: 1,
      width: '100%',
    },
    selecting: {
      maxHeight: '1000px',
      minHeight: '400px',
      overflowY: 'scroll',
      paddingTop: 0,
    },
    link: {
      display: 'block',
      marginBottom: 24,
      marginTop: theme.spacing(),
      textAlign: 'right',
    },
    panel: {
      backgroundColor: theme.color.white,
      flexGrow: 1,
      marginBottom: theme.spacing(3),
      width: '100%',
    },
    inner: {
      padding: 0,
    },
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
    userDefinedFields: UserDefinedField[]
  ) => void;
  publicImages: Record<string, Image>;
  resetSelectedStackScript: () => void;
  disabled?: boolean;
  request: (
    username: string,
    params?: any,
    filter?: any,
    stackScriptGrants?: Grant[]
  ) => Promise<ResourcePage<any>>;
  category: string;
  header: string;
  isOnCreate?: boolean;
}

type CombinedProps = Props &
  RenderGuardProps &
  WithStyles<ClassNames> &
  ProfileProps;

interface State {
  stackScript?: StackScript;
  stackScriptError: boolean;
  stackScriptLoading: boolean;
}

class SelectStackScriptPanel extends React.Component<CombinedProps, State> {
  state: State = {
    stackScriptLoading: false,
    stackScriptError: false,
  };

  mounted: boolean = false;

  componentDidMount() {
    const selected = +getParamFromUrl(location.search, 'stackScriptID');
    /** '' converted to a number is 0 */
    if (!isNaN(selected) && selected !== 0) {
      this.setState({ stackScriptLoading: true });
      getStackScript(selected)
        .then((stackScript) => {
          this.setState({ stackScript, stackScriptLoading: false });
          this.props.onSelect(
            stackScript.id,
            stackScript.label,
            stackScript.username,
            stackScript.images,
            stackScript.user_defined_fields
          );
        })
        .catch((_) => {
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
    const {
      category,
      classes,
      request,
      selectedId,
      error,
      profile,
    } = this.props;
    const { stackScript, stackScriptLoading, stackScriptError } = this.state;

    if (selectedId) {
      if (stackScriptLoading) {
        return <CircleProgress />;
      }
      if (stackScript) {
        return (
          <React.Fragment>
            <Table
              aria-label="List of StackScripts"
              noOverflow={true}
              tableClass={classes.table}
              data-qa-select-stackscript
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
                  description={truncate(stackScript.description, 100)}
                  deploymentsActive={stackScript.deployments_active}
                  updated={formatDate(stackScript.updated, {
                    displayTime: false,
                  })}
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
          {error && (
            <Notice text={error} error spacingTop={8} spacingBottom={0} />
          )}
          {stackScriptError && (
            <Typography variant="body1">
              An error occurred while loading the selected StackScript.
            </Typography>
          )}
          <Paper className={classes.selecting}>
            <SelectStackScriptPanelContent
              onSelect={this.props.onSelect}
              resetStackScriptSelection={this.props.resetSelectedStackScript}
              publicImages={this.props.publicImages}
              currentUser={profile.data?.username || ''}
              request={request}
              key={category + '-tab'}
              category={category}
              disabled={this.props.disabled}
              isOnCreate={this.props.isOnCreate}
            />
          </Paper>
        </div>
      </Paper>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  RenderGuard,
  styled,
  withProfile
)(SelectStackScriptPanel);

import { Grant } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import { Linode } from '@linode/api-v4/lib/linodes';
import {
  StackScript,
  UserDefinedField,
  getStackScript,
} from '@linode/api-v4/lib/stackscripts';
import { Filter, Params, ResourcePage } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { withStyles } from 'tss-react/mui';
import { WithStyles } from '@mui/styles';
import * as React from 'react';
import { compose } from 'recompose';

import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { RenderGuard, RenderGuardProps } from 'src/components/RenderGuard';
import { Table } from 'src/components/Table';
import { Typography } from 'src/components/Typography';
import {
  WithProfileProps,
  withProfile,
} from 'src/containers/profile.container';
import { formatDate } from 'src/utilities/formatDate';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';
import { truncate } from 'src/utilities/truncate';

import { StackScriptTableHead } from '../Partials/StackScriptTableHead';
import SelectStackScriptPanelContent from './SelectStackScriptPanelContent';
import StackScriptSelectionRow from './StackScriptSelectionRow';

export interface ExtendedLinode extends Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'inner' | 'link' | 'panel' | 'selecting' | 'table';

const styles = (theme: Theme) =>
  createStyles({
    inner: {
      padding: 0,
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
    selecting: {
      maxHeight: '1000px',
      minHeight: '400px',
      overflowY: 'scroll',
      paddingTop: 0,
    },
    table: {
      backgroundColor: theme.color.white,
      flexGrow: 1,
      width: '100%',
    },
  });

interface Props extends RenderGuardProps {
  category: string;
  disabled?: boolean;
  error?: string;
  header: string;
  isOnCreate?: boolean;
  onSelect: (
    id: number,
    label: string,
    username: string,
    images: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
  publicImages: Record<string, Image>;
  request: (
    username: string,
    params?: Params,
    filter?: Filter,
    stackScriptGrants?: Grant[]
  ) => Promise<ResourcePage<StackScript>>;
  resetSelectedStackScript: () => void;
  selectedId: number | undefined;
  selectedUsername?: string;
}

type CombinedProps = Props &
  RenderGuardProps &
  WithStyles<ClassNames> &
  WithProfileProps;

interface State {
  stackScript?: StackScript;
  stackScriptError: boolean;
  stackScriptLoading: boolean;
}

class SelectStackScriptPanel extends React.Component<CombinedProps, State> {
  componentDidMount() {
    const selected = +getQueryParamFromQueryString(
      location.search,
      'stackScriptID'
    );
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
          this.setState({ stackScriptError: true, stackScriptLoading: false });
        });
    }
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const {
      category,
      classes,
      error,
      profile,
      request,
      selectedId,
    } = this.props;
    const { stackScript, stackScriptError, stackScriptLoading } = this.state;

    if (selectedId) {
      if (stackScriptLoading) {
        return <CircleProgress />;
      }
      if (stackScript) {
        return (
          <React.Fragment>
            <Table
              aria-label="List of StackScripts"
              data-qa-select-stackscript
              noOverflow={true}
              tableClass={classes.table}
            >
              <StackScriptTableHead
                currentFilterType={null}
                isSelecting={true}
              />
              <tbody>
                <StackScriptSelectionRow
                  updated={formatDate(stackScript.updated, {
                    displayTime: false,
                    timezone: profile.data?.timezone,
                  })}
                  checked={selectedId === stackScript.id}
                  deploymentsActive={stackScript.deployments_active}
                  description={truncate(stackScript.description, 100)}
                  disabledCheckedSelect
                  key={stackScript.id}
                  label={stackScript.label}
                  stackScriptID={stackScript.id}
                  stackScriptUsername={stackScript.username}
                  updateFor={[selectedId === stackScript.id]}
                />
              </tbody>
            </Table>
            <div className={classes.link}>
              <Button buttonType="secondary" onClick={this.resetStackScript}>
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
            <Notice
              spacingBottom={0}
              spacingTop={8}
              text={error}
              variant="error"
            />
          )}
          {stackScriptError && (
            <Typography variant="body1">
              An error occurred while loading the selected StackScript.
            </Typography>
          )}
          <Paper className={classes.selecting}>
            <SelectStackScriptPanelContent
              category={category}
              currentUser={profile.data?.username || ''}
              disabled={this.props.disabled}
              isOnCreate={this.props.isOnCreate}
              key={category + '-tab'}
              onSelect={this.props.onSelect}
              publicImages={this.props.publicImages}
              request={request}
              resetStackScriptSelection={this.props.resetSelectedStackScript}
            />
          </Paper>
        </div>
      </Paper>
    );
  }

  mounted: boolean = false;

  resetStackScript = () => {
    this.setState({ stackScript: undefined, stackScriptLoading: false });
  };

  state: State = {
    stackScriptError: false,
    stackScriptLoading: false,
  };
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  RenderGuard,
  styled,
  withProfile
)(SelectStackScriptPanel);

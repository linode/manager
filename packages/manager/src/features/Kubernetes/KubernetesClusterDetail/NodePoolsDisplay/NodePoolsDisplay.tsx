import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { compose } from 'recompose';

import Button from 'src/components/Button';
import CopyTooltip from 'src/components/CopyTooltip';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';

import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { ApplicationState } from 'src/store';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

import NodePoolDisplayTable from '../../CreateCluster/NodePoolDisplayTable';
import { getTotalClusterPrice, nodeWarning } from '../../kubeUtils';
import { PoolNodeWithPrice } from '../../types';

type ClassNames =
  | 'root'
  | 'button'
  | 'pricing'
  | 'ctaOuter'
  | 'displayTable'
  | 'codeOuter'
  | 'tooltipCode'
  | 'statusHelpIcon'
  | 'nodePoolHeader'
  | 'nodePoolHeaderOuter'
  | 'tooltipOuter'
  | 'code'
  | 'copyTooltip';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3)
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1)
    },
    pricing: {
      marginTop: theme.spacing(3),
      fontFamily: theme.font.bold,
      fontSize: '1rem',
      color: theme.color.headline
    },
    ctaOuter: {
      marginTop: theme.spacing(2) - 1
    },
    displayTable: {
      width: '100%'
    },
    codeOuter: {
      display: 'flex'
    },
    code: {
      display: 'block',
      width: '100%'
    },
    statusHelpIcon: {},
    nodePoolHeader: {
      display: 'inline-block'
    },
    nodePoolHeaderOuter: {
      display: 'flex',
      alignItems: 'center'
    },
    copyTooltip: {
      maxHeight: 24,
      marginLeft: 2
    },
    tooltipOuter: {
      maxWidth: 225
    }
  });

interface Props {
  editing: boolean;
  submittingForm?: boolean;
  submissionSuccess?: boolean;
  submissionError?: APIError[];
  pools: PoolNodeWithPrice[];
  poolsForEdit: PoolNodeWithPrice[];
  types: ExtendedType[];
  loading: boolean;
  submitDisabled?: boolean;
  updatePool?: (poolIdx: number, updatedPool: PoolNodeWithPrice) => void;
  deletePool?: (poolID: number) => void;
  resetForm?: () => void;
  submitForm?: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const command = 'kubectl get nodes -o wide';

export const NodePoolsDisplay: React.FunctionComponent<CombinedProps> = props => {
  const {
    classes,
    deletePool,
    editing,
    loading,
    pools,
    poolsForEdit,
    resetForm,
    submitForm,
    submissionError,
    submissionSuccess,
    submittingForm,
    submitDisabled,
    types,
    updatePool
  } = props;

  /**
   * If the API returns an error when fetching node pools,
   * we want to display this error to the user from the
   * NodePoolDisplayTable.
   *
   * Only do this if we haven't yet successfully retrieved this
   * data, so a random error in our subsequent polling doesn't
   * break the view.
   */
  const poolsError = useSelector((state: ApplicationState) => {
    const error = state.__resources.nodePools?.error?.read;
    const lastUpdated = state.__resources.nodePools.lastUpdated;
    if (error && lastUpdated === 0) {
      return getAPIErrorOrDefault(error, 'Unable to load Node Pools.')[0]
        .reason;
    }
    return undefined;
  });

  const TooltipText = () => {
    return (
      <>
        For more detailed information about the nodes in your cluster, run the
        following command:
        <div className={classes.codeOuter}>
          <code className={classes.code}>{command}</code>
          <CopyTooltip text={command} className={classes.copyTooltip} />
        </div>
      </>
    );
  };
  const errorMap = getErrorMap(['count'], submissionError);

  // If a user is about to put their cluster in a state where it will
  // only have a single node, we want to show a warning.
  const hasSingleNode =
    !submitDisabled &&
    poolsForEdit.reduce((acc, thisPool) => {
      if (thisPool.queuedForDeletion) {
        return acc;
      }
      return acc + thisPool.count;
    }, 0) === 1;

  return (
    <Paper className={classes.root}>
      <Grid container direction="column">
        <Grid
          container
          item
          direction="row"
          justify="space-between"
          alignItems="center"
          xs={12}
        >
          <Grid item className={classes.nodePoolHeaderOuter}>
            <Typography variant="h2" className={classes.nodePoolHeader}>
              Node Pools
            </Typography>
            <HelpIcon
              text={<TooltipText />}
              className={classes.statusHelpIcon}
              tooltipPosition="right-start"
              interactive
              classes={{ tooltip: classes.tooltipOuter }}
            />
          </Grid>
        </Grid>
        {hasSingleNode && (
          <Grid item xs={12}>
            <Notice warning text={nodeWarning} />
          </Grid>
        )}
        {submissionSuccess && (
          <Grid item xs={12}>
            <Notice success text={'Your node pools are being updated.'} />
          </Grid>
        )}
        {submissionError && (
          <Grid item xs={12}>
            <Notice
              error
              text={
                errorMap.none || 'Some of your updates could not be completed.'
              }
            />
          </Grid>
        )}
        <Grid item xs={12} className={classes.displayTable}>
          {editing ? (
            <NodePoolDisplayTable
              editable
              loading={loading}
              pools={poolsForEdit}
              types={types}
              handleDelete={deletePool}
              updatePool={updatePool}
              error={poolsError}
            />
          ) : (
            <NodePoolDisplayTable
              pools={pools}
              types={types}
              loading={loading}
              error={poolsError}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {editing && (
            <Typography className={classes.pricing}>
              *Updated Monthly Estimate:{' '}
              {`$${getTotalClusterPrice(poolsForEdit)}/month`}
            </Typography>
          )}
          {editing && (
            <Grid item container xs={12} className={classes.ctaOuter}>
              <Button
                className={classes.button}
                buttonType="primary"
                disabled={submitDisabled || submittingForm}
                loading={submittingForm}
                onClick={submitForm}
              >
                Save
              </Button>
              <Button
                className={classes.button}
                buttonType="secondary"
                disabled={!editing}
                onClick={resetForm}
              >
                Clear Changes
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(React.memo, styled);

export default enhanced(NodePoolsDisplay);

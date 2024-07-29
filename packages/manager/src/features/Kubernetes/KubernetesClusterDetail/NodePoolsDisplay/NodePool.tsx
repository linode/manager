import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Box } from 'src/components/Box';
import { StyledActionButton } from 'src/components/Button/StyledActionButton';
import { Paper } from 'src/components/Paper';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';

import { NodeTable } from './NodeTable';

import type {
  AutoscaleSettings,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import type { EncryptionStatus } from '@linode/api-v4/lib/linodes/types';
import type { Theme } from '@mui/material/styles';

interface Props {
  autoscaler: AutoscaleSettings;
  encryptionStatus: EncryptionStatus | undefined;
  handleClickResize: (poolId: number) => void;
  isOnlyNodePool: boolean;
  nodes: PoolNodeResponse[];
  openAutoscalePoolDialog: (poolId: number) => void;
  openDeletePoolDialog: (poolId: number) => void;
  openRecycleAllNodesDialog: (poolId: number) => void;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  poolId: number;
  typeLabel: string;
}

const useStyles = makeStyles()((theme: Theme) => ({
  autoscaleText: {
    alignSelf: 'center',
    paddingRight: theme.spacing(2),
  },
  button: {
    paddingRight: 8,
  },
  deletePoolBtn: {
    paddingRight: 8,
  },
}));

export const NodePool = (props: Props) => {
  const {
    autoscaler,
    encryptionStatus,
    handleClickResize,
    isOnlyNodePool,
    nodes,
    openAutoscalePoolDialog,
    openDeletePoolDialog,
    openRecycleAllNodesDialog,
    openRecycleNodeDialog,
    poolId,
    typeLabel,
  } = props;

  const { classes } = useStyles();

  return (
    <Grid data-qa-node-pool-id={poolId} data-qa-node-pool-section>
      <Paper
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          pl: 2,
          pr: 0.5,
          py: 0,
        }}
      >
        <Box>
          <Typography variant="h2">{typeLabel}</Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <StyledActionButton
            compactY
            onClick={() => openAutoscalePoolDialog(poolId)}
          >
            Autoscale Pool
          </StyledActionButton>
          {autoscaler.enabled ? (
            <Typography className={classes.autoscaleText}>
              {`(Min ${autoscaler.min} / Max ${autoscaler.max})`}
            </Typography>
          ) : null}
          <StyledActionButton
            compactY
            onClick={() => handleClickResize(poolId)}
          >
            Resize Pool
          </StyledActionButton>
          <StyledActionButton
            compactY
            onClick={() => openRecycleAllNodesDialog(poolId)}
          >
            Recycle Pool Nodes
          </StyledActionButton>
          <Tooltip
            disableFocusListener={!isOnlyNodePool}
            disableHoverListener={!isOnlyNodePool}
            disableTouchListener={!isOnlyNodePool}
            title="Clusters must contain at least one node pool."
          >
            <div>
              <StyledActionButton
                compactY
                disabled={isOnlyNodePool}
                onClick={() => openDeletePoolDialog(poolId)}
              >
                Delete Pool
              </StyledActionButton>
            </div>
          </Tooltip>
        </Box>
      </Paper>
      <NodeTable
        encryptionStatus={encryptionStatus}
        nodes={nodes}
        openRecycleNodeDialog={openRecycleNodeDialog}
        poolId={poolId}
        typeLabel={typeLabel}
      />
    </Grid>
  );
};

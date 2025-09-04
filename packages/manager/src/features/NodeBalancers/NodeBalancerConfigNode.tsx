import {
  Box,
  Button,
  Chip,
  Divider,
  Notice,
  Select,
  TextField,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { getErrorMap } from 'src/utilities/errorUtils';

import { ConfigNodeIPSelect } from './ConfigNodeIPSelect';

import type {
  NodeBalancerConfigNodeFields,
  NodeBalancerConfigurationsPermissions,
} from './types';
import type { NodeBalancerConfigNodeMode } from '@linode/api-v4';

export interface NodeBalancerConfigNodeProps {
  configIdx: number;
  disallowRemoval: boolean;
  hideModeSelect: boolean;
  idx: number;
  node: NodeBalancerConfigNodeFields;
  nodeBalancerRegion?: string;
  nodeBalancerSubnetId?: number;
  nodeBalancerVpcId?: number;
  onNodeAddressChange: (
    nodeIdx: number,
    value: string,
    subnetId?: number
  ) => void;
  onNodeLabelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNodeModeChange: (nodeId: number, mode: NodeBalancerConfigNodeMode) => void;
  onNodePortChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNodeWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  permissions?: Record<NodeBalancerConfigurationsPermissions, boolean>;
  removeNode: (nodeIndex: number) => void;
}

const modeOptions: {
  label: string;
  value: NodeBalancerConfigNodeMode;
}[] = [
  { label: 'Accept', value: 'accept' },
  { label: 'Reject', value: 'reject' },
  { label: 'Backup', value: 'backup' },
  { label: 'Drain', value: 'drain' },
];

const statusToChipColor = {
  DOWN: 'error',
  UP: 'success',
  unknown: 'default',
} as const;

export const NodeBalancerConfigNode = React.memo(
  (props: NodeBalancerConfigNodeProps) => {
    const {
      configIdx,
      permissions,
      disallowRemoval,
      hideModeSelect,
      idx,
      node,
      nodeBalancerRegion,
      nodeBalancerVpcId,
      nodeBalancerSubnetId,
      onNodeAddressChange,
      onNodeLabelChange,
      onNodeModeChange,
      onNodePortChange,
      onNodeWeightChange,
      removeNode,
    } = props;

    if (node.modifyStatus === 'delete') {
      /* This node has been marked for deletion, don't display it */
      return null;
    }

    const nodesErrorMap = getErrorMap(
      ['label', 'address', 'weight', 'port', 'mode'],
      node.errors
    );

    return (
      <React.Fragment>
        <Grid data-qa-node size={12}>
          {idx !== 0 && (
            <Grid size={12}>
              <Divider
                style={{
                  marginBottom: 24,
                  marginTop: 8,
                }}
              />
            </Grid>
          )}
          {nodesErrorMap.none && (
            <Grid>
              <Notice text={nodesErrorMap.none} variant="error" />
            </Grid>
          )}
          <Grid container spacing={2}>
            <Grid
              size={{
                lg: 4,
                sm: 6,
                xs: 12,
              }}
            >
              <TextField
                data-qa-backend-ip-label
                disabled={!permissions?.update_nodebalancer}
                errorGroup={`${configIdx}`}
                errorText={nodesErrorMap.label}
                inputId={`node-label-${configIdx}-${idx}`}
                inputProps={{ 'data-node-idx': idx }}
                label="Label"
                noMarginTop
                onChange={onNodeLabelChange}
                value={node.label}
              />
            </Grid>
            {node.status && (
              <Grid
                size={{
                  lg: 2,
                  sm: 4,
                  xs: 6,
                }}
              >
                <StyledStatusHeader data-qa-active-checks-header variant="h3">
                  Status
                </StyledStatusHeader>
                <Chip
                  color={statusToChipColor[node.status]}
                  label={node.status}
                  sx={{ marginTop: 1 }}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid size={12}>
          <Grid container data-qa-node key={idx} spacing={2}>
            <Grid
              size={{
                lg: 4,
                sm: 6,
                xs: 12,
              }}
            >
              <ConfigNodeIPSelect
                disabled={!permissions?.update_nodebalancer}
                errorText={nodesErrorMap.address}
                handleChange={onNodeAddressChange}
                inputId={`ip-select-node-${configIdx}-${idx}`}
                nodeAddress={node.address}
                nodeIndex={idx}
                region={nodeBalancerRegion}
                subnetId={nodeBalancerSubnetId}
                vpcId={nodeBalancerVpcId}
              />
            </Grid>
            <Grid
              size={{
                lg: 2,
                sm: 3,
                xs: 6,
              }}
            >
              <TextField
                data-qa-backend-ip-port
                disabled={!permissions?.update_nodebalancer}
                errorGroup={`${configIdx}`}
                errorText={nodesErrorMap.port}
                inputProps={{ 'data-node-idx': idx }}
                label="Port"
                noMarginTop
                onChange={onNodePortChange}
                type="number"
                value={node.port}
              />
            </Grid>
            <Grid
              size={{
                lg: 2,
                sm: 3,
                xs: 6,
              }}
            >
              <TextField
                data-qa-backend-ip-weight
                disabled={!permissions?.update_nodebalancer}
                errorGroup={`${configIdx}`}
                errorText={nodesErrorMap.weight}
                inputProps={{ 'data-node-idx': idx }}
                label="Weight"
                noMarginTop
                onChange={onNodeWeightChange}
                type="number"
                value={node.weight}
              />
            </Grid>
            {!hideModeSelect && (
              <Grid
                size={{
                  lg: 2,
                  sm: 3,
                  xs: 6,
                }}
              >
                <Select
                  disabled={!permissions?.update_nodebalancer}
                  errorText={nodesErrorMap.mode}
                  label="Mode"
                  onChange={(_, option) => onNodeModeChange(idx, option.value)}
                  options={modeOptions}
                  textFieldProps={{ noMarginTop: true }}
                  value={
                    modeOptions.find((option) => option.value === node.mode) ??
                    modeOptions.find((option) => option.value === 'accept')
                  }
                />
              </Grid>
            )}
            {!disallowRemoval && (
              <Box alignSelf="flex-end">
                <Button
                  disabled={!permissions?.delete_nodebalancer}
                  onClick={() => removeNode(idx)}
                >
                  Remove
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
);

const StyledStatusHeader = styled(Typography, {
  label: 'StyledStatusHeader',
})(({ theme }) => ({
  color: theme.color.label,
  fontSize: '.9rem',
  marginTop: `calc(${theme.spacing(2)} - 4)`,
}));

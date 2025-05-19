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

import type { NodeBalancerConfigNodeFields } from './types';
import type { NodeBalancerConfigNodeMode } from '@linode/api-v4';

export interface NodeBalancerConfigNodeProps {
  configIdx: number;
  disabled: boolean;
  disallowRemoval: boolean;
  hideModeSelect: boolean;
  idx: number;
  node: NodeBalancerConfigNodeFields;
  nodeBalancerRegion?: string;
  onNodeAddressChange: (nodeIdx: number, value: string) => void;
  onNodeLabelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNodeModeChange: (nodeId: number, mode: NodeBalancerConfigNodeMode) => void;
  onNodePortChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNodeWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
      disabled,
      disallowRemoval,
      hideModeSelect,
      idx,
      node,
      nodeBalancerRegion,
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
        <Grid data-qa-node size={12} sx={{ padding: 1 }}>
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
                disabled={disabled}
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
        <Grid size={12} sx={{ padding: 1 }}>
          <Grid container data-qa-node key={idx} spacing={2}>
            <Grid
              size={{
                lg: 3,
                sm: 4,
                xs: 12,
              }}
            >
              <ConfigNodeIPSelect
                disabled={disabled}
                errorText={nodesErrorMap.address}
                handleChange={onNodeAddressChange}
                inputId={`ip-select-node-${configIdx}-${idx}`}
                nodeAddress={node.address}
                nodeIndex={idx}
                region={nodeBalancerRegion}
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
                disabled={disabled}
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
                disabled={disabled}
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
                  disabled={disabled}
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
              <Box alignSelf="flex-end" paddingBottom={1}>
                <Button disabled={disabled} onClick={() => removeNode(idx)}>
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

import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Chip } from 'src/components/Chip';
import { Divider } from 'src/components/Divider';
import { MenuItem } from 'src/components/MenuItem';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { getErrorMap } from 'src/utilities/errorUtils';

import { ConfigNodeIPSelect } from './ConfigNodeIPSelect';
import { NodeBalancerConfigNodeFields } from './types';

export interface NodeBalancerConfigNodeProps {
  configIdx?: number;
  disabled: boolean;
  forEdit: boolean;
  idx: number;
  node: NodeBalancerConfigNodeFields;
  nodeBalancerRegion?: string;
  onNodeAddressChange: (nodeIdx: number, value: string) => void;
  onNodeLabelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNodeModeChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    nodeId: number
  ) => void;
  onNodePortChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNodeWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeNode: (e: React.MouseEvent<HTMLElement>) => void;
}

export const NodeBalancerConfigNode = React.memo(
  (props: NodeBalancerConfigNodeProps) => {
    const {
      configIdx,
      disabled,
      forEdit,
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
        <Grid data-qa-node sx={{ padding: 1 }} xs={12}>
          {idx !== 0 && (
            <Grid xs={12}>
              <Divider
                style={{
                  marginBottom: 24,
                  marginTop: forEdit ? 8 : 24,
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
              sx={{
                '.MuiInputLabel-root': {
                  marginTop: 0,
                },
              }}
              lg={forEdit ? 2 : 4}
              sm={forEdit ? 4 : 6}
              xs={12}
            >
              <TextField
                data-qa-backend-ip-label
                disabled={disabled}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                errorText={nodesErrorMap.label}
                inputId={`node-label-${configIdx}-${idx}`}
                inputProps={{ 'data-node-idx': idx }}
                label="Label"
                onChange={onNodeLabelChange}
                value={node.label}
              />
            </Grid>
            {node.status && (
              <Grid lg={2} sm={4} xs={6}>
                <StyledStatusHeader data-qa-active-checks-header variant="h3">
                  Status
                  <div>
                    <StyledStatusChip component="div" label={node.status} />
                  </div>
                </StyledStatusHeader>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid sx={{ padding: 1 }} xs={12}>
          <Grid container data-qa-node key={idx} spacing={2}>
            <Grid lg={forEdit ? 2 : 4} sm={3} xs={12}>
              <ConfigNodeIPSelect
                textfieldProps={{
                  dataAttrs: {
                    'data-qa-backend-ip-address': true,
                  },
                }}
                disabled={disabled}
                errorText={nodesErrorMap.address}
                handleChange={onNodeAddressChange}
                inputId={`ip-select-node-${configIdx}-${idx}`}
                nodeAddress={node.address}
                nodeIndex={idx}
                selectedRegion={nodeBalancerRegion}
              />
            </Grid>
            <Grid lg={2} sm={3} xs={6}>
              <TextField
                data-qa-backend-ip-port
                disabled={disabled}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                errorText={nodesErrorMap.port}
                inputProps={{ 'data-node-idx': idx }}
                label="Port"
                noMarginTop
                onChange={onNodePortChange}
                type="number"
                value={node.port}
              />
            </Grid>
            <Grid lg={2} sm={3} xs={6}>
              <TextField
                data-qa-backend-ip-weight
                disabled={disabled}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                errorText={nodesErrorMap.weight}
                inputProps={{ 'data-node-idx': idx }}
                label="Weight"
                noMarginTop
                onChange={onNodeWeightChange}
                type="number"
                value={node.weight}
              />
            </Grid>
            {forEdit && (
              <Grid lg={2} sm={3} xs={6}>
                <TextField
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onNodeModeChange(e, idx)
                  }
                  data-qa-backend-ip-mode
                  disabled={disabled}
                  errorText={nodesErrorMap.mode}
                  inputId={`mode-${idx}`}
                  inputProps={{ 'data-node-idx': idx }}
                  // className={classes.mode}
                  label="Mode"
                  noMarginTop
                  select
                  value={node.mode}
                >
                  <MenuItem data-node-idx={idx} value="accept">
                    Accept
                  </MenuItem>
                  <MenuItem data-node-idx={idx} value="reject">
                    Reject
                  </MenuItem>
                  <MenuItem data-node-idx={idx} value="backup">
                    Backup
                  </MenuItem>
                  <MenuItem data-node-idx={idx} value="drain">
                    Drain
                  </MenuItem>
                </TextField>
              </Grid>
            )}
            {(forEdit || idx !== 0) && (
              <StyledActionsPanel
                secondaryButtonProps={{
                  'data-node-idx': idx,
                  'data-testid': 'remove-node',
                  disabled,
                  label: 'Remove',
                  onClick: removeNode,
                  sx: { minWidth: 'auto', padding: 0, top: 8 },
                }}
              />
            )}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
);

const StyledActionsPanel = styled(ActionsPanel)(({ theme }) => ({
  '& .remove': {
    margin: 0,
    padding: theme.spacing(2.5),
  },
  alignItems: 'flex-end',
  display: 'flex',
  marginLeft: `-${theme.spacing()}`,
  paddingLeft: theme.spacing(2),
  [theme.breakpoints.down('lg')]: {
    marginTop: `-${theme.spacing()}`,
  },
  [theme.breakpoints.down('sm')]: {
    marginTop: 0,
  },
}));

const StyledStatusHeader = styled(Typography, {
  label: 'StyledStatusHeader',
})(({ theme }) => ({
  color: theme.color.label,
  fontSize: '.9rem',
  marginTop: `calc(${theme.spacing(2)} - 4)`,
}));

const StyledStatusChip = styled(Chip, {
  label: 'StyledStatusChip',
})<Partial<NodeBalancerConfigNodeProps>>(({ theme, ...props }) => ({
  backgroundColor:
    props.label === 'UP'
      ? theme.color.green
      : props.label === 'DOWN'
      ? theme.color.red
      : theme.color.grey2,
  color: props?.node?.status ? theme.palette.text.primary : 'white',
  marginTop: theme.spacing(1),
}));

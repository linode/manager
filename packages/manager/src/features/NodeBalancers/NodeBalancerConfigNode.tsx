import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Divider from 'src/components/core/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from 'src/components/core/MenuItem';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { Chip } from 'src/components/core/Chip';
import { ConfigNodeIPSelect } from './ConfigNodeIPSelect';
import { getErrorMap } from 'src/utilities/errorUtils';
import { NodeBalancerConfigNodeFields } from './types';
import { Notice } from 'src/components/Notice/Notice';
import { styled } from '@mui/material/styles';

export interface NodeBalancerConfigNodeProps {
  node: NodeBalancerConfigNodeFields;
  idx: number;
  forEdit: boolean;
  disabled: boolean;
  configIdx?: number;
  nodeBalancerRegion?: string;
  onNodeLabelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNodeAddressChange: (nodeIdx: number, value: string) => void;
  onNodeWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNodeModeChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    nodeId: number
  ) => void;
  onNodePortChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeNode: (e: React.MouseEvent<HTMLElement>) => void;
}

export const NodeBalancerConfigNode = React.memo(
  (props: NodeBalancerConfigNodeProps) => {
    const {
      disabled,
      node,
      idx,
      forEdit,
      configIdx,
      nodeBalancerRegion,
      onNodeAddressChange,
      onNodeLabelChange,
      onNodeModeChange,
      onNodeWeightChange,
      onNodePortChange,
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
        <Grid data-qa-node xs={12} sx={{ padding: 0 }}>
          {idx !== 0 && (
            <Grid xs={12}>
              <Divider
                style={{
                  marginTop: forEdit ? 8 : 24,
                  marginBottom: 24,
                }}
              />
            </Grid>
          )}
          {nodesErrorMap.none && (
            <Grid>
              <Notice error text={nodesErrorMap.none} />
            </Grid>
          )}
          <Grid container spacing={2}>
            <Grid
              xs={6}
              sm={forEdit ? 4 : 6}
              lg={forEdit ? 2 : 4}
              sx={{
                '.MuiInputLabel-root': {
                  marginTop: 0,
                },
              }}
            >
              <TextField
                label="Label"
                value={node.label}
                inputId={`node-label-${configIdx}-${idx}`}
                inputProps={{ 'data-node-idx': idx }}
                onChange={onNodeLabelChange}
                errorText={nodesErrorMap.label}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                data-qa-backend-ip-label
                disabled={disabled}
              />
            </Grid>
            {node.status && (
              <Grid xs={6} sm={4} lg={2}>
                <StyledStatusHeader variant="h3" data-qa-active-checks-header>
                  Status
                  <div>
                    <StyledStatusChip label={node.status} component="div" />
                  </div>
                </StyledStatusHeader>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid xs={12} sx={{ padding: 0 }}>
          <Grid key={idx} container data-qa-node spacing={2}>
            <Grid xs={12} sm={3} lg={forEdit ? 2 : 4}>
              <ConfigNodeIPSelect
                textfieldProps={{
                  dataAttrs: {
                    'data-qa-backend-ip-address': true,
                  },
                }}
                disabled={disabled}
                handleChange={onNodeAddressChange}
                selectedRegion={nodeBalancerRegion}
                nodeIndex={idx}
                errorText={nodesErrorMap.address}
                nodeAddress={node.address}
                inputId={`ip-select-node-${configIdx}-${idx}`}
              />
            </Grid>
            <Grid xs={6} sm={3} lg={2}>
              <TextField
                type="number"
                label="Port"
                value={node.port}
                inputProps={{ 'data-node-idx': idx }}
                onChange={onNodePortChange}
                errorText={nodesErrorMap.port}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                data-qa-backend-ip-port
                noMarginTop
                disabled={disabled}
              />
            </Grid>
            <Grid xs={6} sm={3} lg={2}>
              <TextField
                type="number"
                label="Weight"
                value={node.weight}
                inputProps={{ 'data-node-idx': idx }}
                onChange={onNodeWeightChange}
                errorText={nodesErrorMap.weight}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                data-qa-backend-ip-weight
                noMarginTop
                disabled={disabled}
              />
            </Grid>
            {forEdit && (
              <Grid xs={6} sm={3} lg={2}>
                <TextField
                  // className={classes.mode}
                  label="Mode"
                  inputId={`mode-${idx}`}
                  value={node.mode}
                  select
                  inputProps={{ 'data-node-idx': idx }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onNodeModeChange(e, idx)
                  }
                  errorText={nodesErrorMap.mode}
                  data-qa-backend-ip-mode
                  noMarginTop
                  disabled={disabled}
                >
                  <MenuItem value="accept" data-node-idx={idx}>
                    Accept
                  </MenuItem>
                  <MenuItem value="reject" data-node-idx={idx}>
                    Reject
                  </MenuItem>
                  <MenuItem value="backup" data-node-idx={idx}>
                    Backup
                  </MenuItem>
                  <MenuItem value="drain" data-node-idx={idx}>
                    Drain
                  </MenuItem>
                </TextField>
              </Grid>
            )}
            <StyledActionsPanel>
              {(forEdit || idx !== 0) && (
                <Button
                  buttonType="secondary"
                  data-node-idx={idx}
                  onClick={removeNode}
                  data-qa-remove-node
                  disabled={disabled}
                  sx={{ minWidth: 'auto', padding: 0, top: 8 }}
                >
                  Remove
                </Button>
              )}
            </StyledActionsPanel>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
);

const StyledActionsPanel = styled(ActionsPanel)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  paddingLeft: theme.spacing(2),
  marginLeft: `-${theme.spacing()}`,
  [theme.breakpoints.down('lg')]: {
    marginTop: `-${theme.spacing()}`,
  },
  [theme.breakpoints.down('sm')]: {
    marginTop: 0,
  },
  '& .remove': {
    margin: 0,
    padding: theme.spacing(2.5),
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

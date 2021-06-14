import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Chip from 'src/components/core/Chip';
import Divider from 'src/components/core/Divider';
import MenuItem from 'src/components/core/MenuItem';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { getErrorMap } from 'src/utilities/errorUtils';
import SelectIP from './ConfigNodeIPSelect';
import { NodeBalancerConfigNodeFields } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  backendIPAction: {
    display: 'flex',
    alignItems: 'flex-end',
    paddingLeft: theme.spacing(2),
    marginLeft: -theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginTop: -theme.spacing(1),
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 0,
    },
    '& .remove': {
      margin: 0,
      padding: theme.spacing(2.5),
    },
  },
  statusHeader: {
    fontSize: '.9rem',
    color: theme.color.label,
    marginTop: theme.spacing(2) - 4,
  },
  statusChip: {
    marginTop: theme.spacing(1),
    color: 'white',
    '&.undefined': {
      backgroundColor: theme.color.grey2,
      color: theme.palette.text.primary,
    },
  },
  'chip-UP': {
    backgroundColor: theme.color.green,
  },
  'chip-DOWN': {
    backgroundColor: theme.color.red,
  },
  button: {
    ...theme.applyLinkStyles,
  },
}));

export interface Props {
  node: NodeBalancerConfigNodeFields;
  idx: number;
  forEdit: boolean;
  disabled: boolean;
  configIdx?: number;
  nodeBalancerRegion?: string;
  onNodeLabelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNodeAddressChange: (nodeIdx: number, value: string) => void;
  onNodeWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNodeModeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNodePortChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeNode: (e: React.MouseEvent<HTMLElement>) => void;
}

export const NodeBalancerConfigNode: React.FC<Props> = (props) => {
  const classes = useStyles();
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
      <Grid updateFor={[node, classes]} item data-qa-node xs={12}>
        {idx !== 0 && (
          <Grid item xs={12}>
            <Divider
              style={{
                marginTop: forEdit ? 8 : 24,
                marginBottom: 24,
              }}
            />
          </Grid>
        )}
        {nodesErrorMap.none && (
          <Grid item>
            <Notice error text={nodesErrorMap.none} />
          </Grid>
        )}
        <Grid container>
          <Grid item xs={6} sm={forEdit ? 4 : 6} lg={forEdit ? 2 : 4}>
            <TextField
              label="Label"
              value={node.label}
              inputId={`node-label-${configIdx}-${idx}`}
              inputProps={{ 'data-node-idx': idx }}
              onChange={onNodeLabelChange}
              errorText={nodesErrorMap.label}
              errorGroup={forEdit ? `${configIdx}` : undefined}
              data-qa-backend-ip-label
              small
              disabled={disabled}
            />
          </Grid>
          {node.status && (
            <Grid item xs={6} sm={4} lg={2}>
              <Typography
                variant="h3"
                data-qa-active-checks-header
                className={classes.statusHeader}
              >
                Status
                <div>
                  <Chip
                    className={`
                        ${classes.statusChip}
                        ${classes[`chip-${node.status}`]}
                      `}
                    label={node.status}
                    component="div"
                  />
                </div>
              </Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid
          key={idx}
          updateFor={[nodeBalancerRegion, node, configIdx, classes]}
          container
          data-qa-node
        >
          <Grid item xs={12} sm={3} lg={forEdit ? 2 : 4}>
            <SelectIP
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
          <Grid item xs={6} sm={3} lg={2}>
            <TextField
              type="number"
              label="Port"
              value={node.port}
              inputProps={{ 'data-node-idx': idx }}
              onChange={onNodePortChange}
              errorText={nodesErrorMap.port}
              errorGroup={forEdit ? `${configIdx}` : undefined}
              data-qa-backend-ip-port
              small
              noMarginTop
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={6} sm={3} lg={2}>
            <TextField
              type="number"
              label="Weight"
              value={node.weight}
              inputProps={{ 'data-node-idx': idx }}
              onChange={onNodeWeightChange}
              errorText={nodesErrorMap.weight}
              errorGroup={forEdit ? `${configIdx}` : undefined}
              data-qa-backend-ip-weight
              small
              noMarginTop
              disabled={disabled}
            />
          </Grid>
          {forEdit && (
            <Grid item xs={6} sm={3} lg={2}>
              <TextField
                label="Mode"
                inputId={`mode-${idx}`}
                value={node.mode}
                select
                inputProps={{ 'data-node-idx': idx }}
                onChange={onNodeModeChange}
                errorText={nodesErrorMap.mode}
                data-qa-backend-ip-mode
                small
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
          <ActionsPanel className={classes.backendIPAction}>
            {(forEdit || idx !== 0) && (
              <button
                className={classes.button}
                data-node-idx={idx}
                onClick={removeNode}
                data-qa-remove-node
                disabled={disabled}
              >
                Remove
              </button>
            )}
          </ActionsPanel>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default React.memo(NodeBalancerConfigNode);

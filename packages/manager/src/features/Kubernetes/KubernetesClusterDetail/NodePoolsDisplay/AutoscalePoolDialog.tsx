import {
  ActionsPanel,
  Button,
  FormControlLabel,
  Notice,
  TextField,
  Toggle,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';

import {
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
} from '../../constants';

import type {
  AutoscaleSettings,
  KubeNodePoolResponse,
  KubernetesTier,
} from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

interface Props {
  clusterId: number;
  clusterTier: KubernetesTier;
  handleOpenResizeDrawer: (poolId: number) => void;
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  disabled: {
    opacity: 0.5,
  },
  input: {
    '& input': {
      width: 70,
    },
    minWidth: 'auto',
  },
  inputContainer: {
    '& label': {
      marginTop: 13,
    },
  },
  notice: {
    font: theme.font.bold,
    fontSize: 15,
  },
  resize: {
    fontSize: 'inherit',
    marginLeft: -4,
    marginRight: 0,
    marginTop: -3.2,
    minHeight: 0,
    padding: 0,
  },
  slash: {
    '& p': {
      fontSize: '1rem',
      padding: `${theme.spacing(2)} 0`,
    },
    alignSelf: 'end',
    padding: '0px !important',
  },
}));

export const AutoscalePoolDialog = (props: Props) => {
  const {
    clusterId,
    clusterTier,
    handleOpenResizeDrawer,
    nodePool,
    onClose,
    open,
  } = props;
  const autoscaler = nodePool?.autoscaler;
  const { classes, cx } = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { error, isPending, mutateAsync } = useUpdateNodePoolMutation(
    clusterId,
    nodePool?.id ?? -1
  );

  const onSubmit = async (values: AutoscaleSettings) => {
    await mutateAsync({ autoscaler: values }).then(() => {
      enqueueSnackbar(`Autoscaling updated for Node Pool ${nodePool?.id}.`, {
        variant: 'success',
      });
      onClose();
    });
  };

  const handleClose = () => {
    onClose();
    handleReset(values);
  };

  const {
    errors,
    handleChange,
    handleReset,
    handleSubmit,
    isSubmitting,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      enabled: autoscaler?.enabled ?? false,
      max: autoscaler?.max ?? 1,
      min: autoscaler?.min ?? 1,
    },
    onSubmit,
    validate: (values) => {
      const errors: { max?: string; min?: string } = {};
      const maxLimit =
        clusterTier === 'enterprise'
          ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
          : MAX_NODES_PER_POOL_STANDARD_TIER;
      if (values.enabled) {
        if (!values.min) {
          errors.min = 'Minimum is a required field.';
        }
        if (
          values.min > values.max ||
          values.min < 1 ||
          values.min > maxLimit
        ) {
          errors.min = `Minimum must be between 1 and ${maxLimit - 1} nodes and cannot be greater than Maximum.`;
        }
        if (!values.max) {
          errors.max = 'Maximum is a required field.';
        }
        if (values.max > maxLimit || values.max < 1) {
          errors.max = `Maximum must be between 1 and ${maxLimit} nodes.`;
        }
      }
      return errors;
    },
  });

  const warning =
    autoscaler && autoscaler.max > 1 && +values.max < autoscaler.max
      ? 'The Node Pool will only be scaled down if there are unneeded nodes.'
      : undefined;

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'confirm',
            disabled:
              (values.enabled === autoscaler?.enabled &&
                values.min === autoscaler?.min &&
                values.max === autoscaler?.max) ||
              Object.keys(errors).length !== 0,
            label: 'Save Changes',
            loading: isPending || isSubmitting,
            onClick: () => handleSubmit(),
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: handleClose,
          }}
          style={{ padding: 0 }}
        />
      }
      error={error?.[0].reason}
      onClose={handleClose}
      open={open}
      title="Autoscale Pool"
    >
      {warning ? (
        <Notice className={classes.notice} variant="warning">
          {warning}
          <div>
            <Button
              buttonType="secondary"
              className={classes.resize}
              compactX
              onClick={() => {
                handleClose();
                handleOpenResizeDrawer(nodePool?.id ?? -1);
              }}
            >
              Resize
            </Button>
            to immediately scale your Node Pool up or down.
          </div>
        </Notice>
      ) : null}
      <Typography>
        Enable the built-in autoscaler to automatically add and remove nodes
        based on resource demand and usage.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-nodes-and-node-pools#autoscale-automatically-resize-node-pools">
          Learn more
        </Link>
        .
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControlLabel
          control={
            <Toggle
              checked={values.enabled}
              disabled={isSubmitting}
              name="enabled"
              onChange={handleChange}
            />
          }
          label="Autoscale"
          style={{ marginTop: 12 }}
        />
        <Typography marginTop={1}>
          Define the minimum and maximum node constraints:
        </Typography>
        <Grid className={classes.inputContainer} container spacing={2}>
          <Grid>
            <TextField
              className={classes.input}
              disabled={!values.enabled || isSubmitting}
              error={Boolean(errors.min)}
              label="Min"
              name="min"
              onChange={handleChange}
              type="number"
              value={values.min}
            />
          </Grid>
          <Grid
            className={cx({
              [classes.disabled]: !values.enabled,
              [classes.slash]: true,
            })}
          >
            <Typography>/</Typography>
          </Grid>
          <Grid>
            <TextField
              className={classes.input}
              disabled={!values.enabled || isSubmitting}
              error={Boolean(errors.max)}
              label="Max"
              name="max"
              onChange={handleChange}
              type="number"
              value={values.max}
            />
          </Grid>
          <Grid size={12} style={{ padding: '0 8px' }}>
            {errors.min && (
              <Typography sx={(theme) => ({ color: theme.palette.error.dark })}>
                {errors.min}
              </Typography>
            )}
            {errors.max && (
              <Typography sx={(theme) => ({ color: theme.palette.error.dark })}>
                {errors.max}
              </Typography>
            )}
          </Grid>
        </Grid>
      </form>
    </ConfirmationDialog>
  );
};

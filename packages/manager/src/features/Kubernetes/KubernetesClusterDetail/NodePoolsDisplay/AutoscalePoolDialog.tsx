import { AutoscaleSettings, KubeNodePoolResponse } from '@linode/api-v4';
import { AutoscaleNodePoolSchema } from '@linode/validation/lib/kubernetes.schema';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle';
import { Typography } from 'src/components/Typography';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';

interface Props {
  clusterId: number;
  handleOpenResizeDrawer: (poolId: number) => void;
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    color: theme.color.red,
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
    fontFamily: theme.font.bold,
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
  const { clusterId, handleOpenResizeDrawer, nodePool, onClose, open } = props;
  const autoscaler = nodePool?.autoscaler;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { error, isLoading, mutateAsync } = useUpdateNodePoolMutation(
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
    validationSchema: AutoscaleNodePoolSchema,
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
            loading: isLoading || isSubmitting,
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
              onClick={() => {
                handleClose();
                handleOpenResizeDrawer(nodePool?.id ?? -1);
              }}
              buttonType="secondary"
              className={classes.resize}
              compactX
            >
              Resize
            </Button>
            to immediately scale your Node Pool up or down.
          </div>
        </Notice>
      ) : null}
      <Typography>
        Set minimum and maximum node pool constraints for LKE to resize your
        cluster automatically based on resource demand and overall usage.
        Maximum limit is 100 nodes.{' '}
        <Link to="https://www.linode.com/docs/products/compute/kubernetes/guides/enable-cluster-autoscaling">
          Learn More.
        </Link>
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
          label="Autoscaler"
          style={{ marginTop: 12 }}
        />
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
            className={classNames({
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
          <Grid style={{ padding: '0 8px' }} xs={12}>
            {errors.min ? (
              <Typography className={classes.errorText}>
                {errors.min}
              </Typography>
            ) : null}
            {errors.max ? (
              <Typography className={classes.errorText}>
                {errors.max}
              </Typography>
            ) : null}
          </Grid>
        </Grid>
      </form>
    </ConfirmationDialog>
  );
};

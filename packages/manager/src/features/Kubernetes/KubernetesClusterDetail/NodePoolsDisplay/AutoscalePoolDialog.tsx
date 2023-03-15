import { AutoscaleNodePoolSchema } from '@linode/validation/lib/kubernetes.schema';
import { useFormik } from 'formik';
import * as React from 'react';
import classNames from 'classnames';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import { AutoscaleSettings, KubeNodePoolResponse } from '@linode/api-v4';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';
import { useSnackbar } from 'notistack';

interface Props {
  clusterId: number;
  nodePool: KubeNodePoolResponse | undefined;
  open: boolean;
  handleOpenResizeDrawer: (poolId: number) => void;
  onClose: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  slash: {
    alignSelf: 'end',
    padding: '0px !important',
    '& p': {
      fontSize: '1rem',
      padding: `${theme.spacing(2)} 0`,
    },
  },
  inputContainer: {
    '& label': {
      marginTop: 13,
    },
  },
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    color: theme.color.red,
  },
  resize: {
    fontSize: 'inherit',
    marginTop: -3.2,
    marginLeft: -4,
    marginRight: 0,
    minHeight: 0,
    padding: 0,
  },
  notice: {
    fontFamily: theme.font.bold,
    fontSize: 15,
  },
  input: {
    minWidth: 'auto',
    '& input': {
      width: 70,
    },
  },
}));

export const AutoscalePoolDialog = (props: Props) => {
  const { nodePool, open, handleOpenResizeDrawer, onClose, clusterId } = props;
  const autoscaler = nodePool?.autoscaler;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync, isLoading, error } = useUpdateNodePoolMutation(
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
    values,
    errors,
    isSubmitting,
    handleChange,
    handleReset,
    handleSubmit,
  } = useFormik({
    initialValues: {
      enabled: autoscaler?.enabled ?? false,
      min: autoscaler?.min ?? 1,
      max: autoscaler?.max ?? 1,
    },
    enableReinitialize: true,
    validationSchema: AutoscaleNodePoolSchema,
    onSubmit,
  });

  const warning =
    autoscaler && autoscaler.max > 1 && +values.max < autoscaler.max
      ? 'The Node Pool will only be scaled down if there are unneeded nodes.'
      : undefined;

  return (
    <ConfirmationDialog
      open={open}
      title="Autoscale Pool"
      onClose={handleClose}
      error={error?.[0].reason}
      actions={
        <ActionsPanel style={{ padding: 0 }}>
          <Button
            buttonType="secondary"
            onClick={handleClose}
            data-qa-cancel
            data-testid="dialog-cancel"
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={() => handleSubmit()}
            loading={isLoading || isSubmitting}
            disabled={
              (values.enabled === autoscaler?.enabled &&
                values.min === autoscaler?.min &&
                values.max === autoscaler?.max) ||
              Object.keys(errors).length !== 0
            }
            data-qa-confirm
            data-testid="dialog-confirm"
          >
            Save Changes
          </Button>
        </ActionsPanel>
      }
    >
      {warning ? (
        <Notice warning className={classes.notice}>
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
        Set minimum and maximum node pool constraints for LKE to resize your
        cluster automatically based on resource demand and overall usage.
        Maximum limit is 100 nodes.{' '}
        <Link to="https://www.linode.com/docs/products/compute/kubernetes/guides/enable-cluster-autoscaling">
          Learn More.
        </Link>
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControlLabel
          label="Autoscaler"
          control={
            <Toggle
              name="enabled"
              checked={values.enabled}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          }
          style={{ marginTop: 12 }}
        />
        <Grid container className={classes.inputContainer}>
          <Grid item>
            <TextField
              name="min"
              label="Min"
              type="number"
              value={values.min}
              onChange={handleChange}
              disabled={!values.enabled || isSubmitting}
              error={Boolean(errors.min)}
              className={classes.input}
            />
          </Grid>
          <Grid
            item
            className={classNames({
              [classes.slash]: true,
              [classes.disabled]: !values.enabled,
            })}
          >
            <Typography>/</Typography>
          </Grid>
          <Grid item>
            <TextField
              name="max"
              label="Max"
              type="number"
              value={values.max}
              onChange={handleChange}
              disabled={!values.enabled || isSubmitting}
              error={Boolean(errors.max)}
              className={classes.input}
            />
          </Grid>
          <Grid item xs={12} style={{ padding: '0 8px' }}>
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

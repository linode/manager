import {
  ActionsPanel,
  Box,
  Button,
  Drawer,
  FormControlLabel,
  Notice,
  Toggle,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { Link } from 'src/components/Link';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';

import {
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
} from '../../constants';
import { useNodePoolDisplayLabel } from './utils';

import type {
  AutoscaleSettings,
  KubeNodePoolResponse,
  KubernetesTier,
} from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  disabled: {
    opacity: 0.5,
  },
  input: {
    backgroundColor: theme.tokens.alias.Background.Neutral,
    border: `solid 1px ${theme.tokens.alias.Border.Normal}`,
    padding: 8,
  },
  inputContainer: {
    marginTop: 13,
    '& label': {
      font: theme.font.bold,
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
      padding: `${theme.tokens.spacing.S16} 0`,
      color: theme.tokens.alias.Border.Neutral,
    },
    alignSelf: 'end',
    padding: '0px !important',
  },
}));

export interface Props {
  clusterId: number;
  clusterTier: KubernetesTier;
  handleOpenResizeDrawer: (poolId: number) => void;
  nodePool: KubeNodePoolResponse | undefined;
  onClose: () => void;
  open: boolean;
}

export const AutoscaleNodePoolDrawer = (props: Props) => {
  const {
    clusterId,
    clusterTier,
    handleOpenResizeDrawer,
    nodePool,
    onClose,
    open,
  } = props;
  const autoscaler = nodePool?.autoscaler;
  const nodePoolLabel = useNodePoolDisplayLabel(nodePool, { suffix: 'Plan' });
  const { classes, cx } = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateNodePool, isPending } = useUpdateNodePoolMutation(
    clusterId,
    nodePool?.id ?? -1
  );

  const {
    clearErrors,
    control,
    formState: { errors, isDirty, isSubmitting, isValid },
    trigger,
    reset,
    watch,
    setValue,
    ...form
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      enabled: false,
      max: 1,
      min: 1,
    },
  });

  const { max: _max, enabled: _enabled } = watch();
  const maxLimit =
    clusterTier === 'enterprise'
      ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
      : MAX_NODES_PER_POOL_STANDARD_TIER;

  // Node pool must be defined to set form fields with autoscaler's initial values.
  React.useEffect(() => {
    // Will be undefined when drawer first mounts.
    if (!nodePool) {
      return;
    }
    if (open) {
      reset({
        enabled: autoscaler?.enabled,
        max: autoscaler?.max,
        min: autoscaler?.min,
      });
    }
  }, [nodePool, open, autoscaler, reset]);

  const onSubmit = async (values: AutoscaleSettings) => {
    if (!isValid) {
      return;
    }

    try {
      await updateNodePool({ autoscaler: values }).then(() => {
        enqueueSnackbar(`Autoscaling updated for Node Pool ${nodePool?.id}.`, {
          variant: 'success',
        });
        onClose();
      });
    } catch (errResponse) {
      for (const error of errResponse) {
        const fieldMap: Record<string, keyof AutoscaleSettings> = {
          'autoscaler.min': 'min',
          'autoscaler.max': 'max',
          'autoscaler.enabled': 'enabled',
        };
        const field = fieldMap[error.field];

        if (field) {
          form.setError(field, {
            message: error.reason || 'Invalid value',
          });
        } else {
          form.setError('root', {
            message: error.reason,
          });
        }
      }
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const warning =
    autoscaler && autoscaler.max > 1 && +_max < autoscaler.max
      ? 'The Node Pool will only be scaled down if there are unneeded nodes.'
      : undefined;

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`Autoscale Pool: ${nodePoolLabel}`}
    >
      {errors.root?.message ? (
        <Notice spacingBottom={16} text={errors.root.message} variant="error" />
      ) : null}
      {warning ? (
        <Notice className={classes.notice} variant="warning">
          {warning}{' '}
          <span>
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
          </span>
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="enabled"
          render={({ field }) => {
            return (
              <FormControlLabel
                control={
                  <Toggle
                    checked={field.value}
                    disabled={isSubmitting}
                    name="enabled"
                    onChange={(e) => {
                      field.onChange(e);
                      clearErrors('root');
                    }}
                  />
                }
                label="Autoscale"
                style={{ marginTop: 12 }}
              />
            );
          }}
        />

        <Typography marginTop={1}>
          Define the minimum and maximum node constraints:
        </Typography>
        <Grid className={classes.inputContainer} container spacing={2}>
          <Grid>
            <label htmlFor="min">Min</label>
            <Box className={classes.input}>
              <Controller
                control={control}
                name="min"
                render={({ field }) => {
                  return (
                    <EnhancedNumberInput
                      disabled={!_enabled || isSubmitting}
                      inputLabel="Min"
                      max={maxLimit}
                      min={1}
                      setValue={(e) => {
                        clearErrors('root');
                        setValue('min', Number(e), {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      value={field.value}
                    />
                  );
                }}
                rules={{
                  required: 'Minimum is a required field.',
                  validate: (value) => {
                    if (value > form.getValues('max') || value > maxLimit) {
                      return `Minimum must be between 1 and ${maxLimit - 1} nodes and cannot be greater than Maximum.`;
                    }
                    return true;
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid
            className={cx({
              [classes.disabled]: !_enabled,
              [classes.slash]: true,
            })}
          >
            <Typography>/</Typography>
          </Grid>
          <Grid>
            <label htmlFor="max">Max</label>
            <Box className={classes.input}>
              <Controller
                control={control}
                name="max"
                render={({ field }) => {
                  return (
                    <EnhancedNumberInput
                      disabled={!_enabled || isSubmitting}
                      inputLabel="Max"
                      max={maxLimit}
                      min={1}
                      setValue={(e) => {
                        clearErrors('root');
                        setValue('max', Number(e), {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        // Re-validate the min field.
                        trigger('min');
                      }}
                      value={field.value}
                    />
                  );
                }}
                rules={{
                  required: 'Maximum is a required field.',
                }}
              />
            </Box>
          </Grid>
          <Grid size={12}>
            {errors.min && (
              <Typography
                sx={(theme) => ({
                  color: theme.tokens.component.TextField.Error.HintText,
                })}
              >
                {errors.min.message}
              </Typography>
            )}
            {errors.max && (
              <Typography
                sx={(theme) => ({
                  color: theme.tokens.component.TextField.Error.HintText,
                })}
              >
                {errors.max.message}
              </Typography>
            )}
          </Grid>
        </Grid>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            disabled:
              !isDirty ||
              Object.keys(errors).length !== 0 ||
              (_enabled && _max > maxLimit),
            label: 'Save Changes',
            loading: isPending || isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      </form>
    </Drawer>
  );
};

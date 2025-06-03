import {
  ActionsPanel,
  Button,
  Drawer,
  FormControlLabel,
  Notice,
  TextField,
  Toggle,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';

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
  const { classes, cx } = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateNodePool, isPending } = useUpdateNodePoolMutation(
    clusterId,
    nodePool?.id ?? -1
  );

  const typesQuery = useSpecificTypes(nodePool?.type ? [nodePool.type] : []);

  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  const {
    control,
    formState: { errors, isDirty, isSubmitting, isValid },
    watch,
    ...form
  } = useForm({
    defaultValues: {
      enabled: autoscaler?.enabled ?? false,
      max: autoscaler?.max ?? 1,
      min: autoscaler?.min ?? 1,
    },
    mode: 'onChange',
  });

  const { max: _max, enabled: _enabled } = watch();
  const maxLimit =
    clusterTier === 'enterprise'
      ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
      : MAX_NODES_PER_POOL_STANDARD_TIER;

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
    form.reset();
  };

  const warning =
    autoscaler && autoscaler.max > 1 && +_max < autoscaler.max
      ? 'The Node Pool will only be scaled down if there are unneeded nodes.'
      : undefined;

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`Autoscale Pool: ${planType?.formattedLabel ?? 'Unknown'} Plan`}
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
                    onChange={field.onChange}
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
            <Controller
              control={control}
              name="min"
              render={({ field, fieldState }) => {
                return (
                  <TextField
                    {...field}
                    className={classes.input}
                    disabled={!_enabled || isSubmitting}
                    error={!!fieldState.error}
                    label="Min"
                    onChange={(e) => {
                      // Set value to an empty string if field is cleared; else, convert string to number.
                      if (e.target.value === '') {
                        field.onChange(e);
                      } else {
                        form.setValue('min', Number(e.target.value), {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    type="number"
                    value={field.value}
                  />
                );
              }}
              rules={{
                required: 'Minimum is a required field.',
                validate: (value) => {
                  if (value > _max || value < 1 || value > maxLimit) {
                    return `Minimum must be between 1 and ${maxLimit - 1} nodes and cannot be greater than Maximum.`;
                  }
                  return true;
                },
              }}
            />
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
            <Controller
              control={control}
              name="max"
              render={({ field, fieldState }) => {
                return (
                  <TextField
                    {...field}
                    className={classes.input}
                    disabled={!_enabled || isSubmitting}
                    error={!!fieldState.error}
                    label="Max"
                    onChange={(e) => {
                      // Set value to an empty string if field is cleared; else, convert string to number.
                      if (e.target.value === '') {
                        field.onChange(e);
                      } else {
                        form.setValue('max', Number(e.target.value), {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    type="number"
                    value={field.value}
                  />
                );
              }}
              rules={{
                required: 'Maximum is a required field.',
                validate: (value) => {
                  if (value > maxLimit || value < 1) {
                    return `Maximum must be between 1 and ${maxLimit} nodes.`;
                  }
                  return true;
                },
              }}
            />
          </Grid>
          <Grid size={12} style={{ padding: '0 8px' }}>
            {errors.min && (
              <Typography sx={(theme) => ({ color: theme.palette.error.dark })}>
                {errors.min.message}
              </Typography>
            )}
            {errors.max && (
              <Typography sx={(theme) => ({ color: theme.palette.error.dark })}>
                {errors.max.message}
              </Typography>
            )}
          </Grid>
        </Grid>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            disabled: !isDirty || Object.keys(errors).length !== 0,
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

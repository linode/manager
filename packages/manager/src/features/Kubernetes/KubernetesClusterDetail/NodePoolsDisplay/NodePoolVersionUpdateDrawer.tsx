import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  Notice,
  Typography,
} from '@linode/ui';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';

import type {
  KubeNodePoolResponseBeta,
  NodePoolUpgradeStrategy,
} from '@linode/api-v4';

export interface Props {
  clusterId: number;
  nodePool: KubeNodePoolResponseBeta | undefined;
  onClose: () => void;
  open: boolean;
}

interface VersionUpdateFormFields {
  update_strategy: NodePoolUpgradeStrategy;
}

const updateStrategyOptions = [
  { label: 'on_recycle', value: 'On Recycle Updates' },
  { label: 'rolling_update', value: 'Rolling Updates' },
];

export const NodePoolVersionUpdateDrawer = (props: Props) => {
  const { clusterId, nodePool, onClose, open } = props;

  const typesQuery = useSpecificTypes(nodePool?.type ? [nodePool.type] : []);

  const { control, formState, setValue, watch, ...form } =
    useForm<VersionUpdateFormFields>({
      defaultValues: {},
    });

  const { isPending, mutateAsync: updateNodePool } = useUpdateNodePoolMutation(
    clusterId,
    nodePool?.id ?? -1
  );

  React.useEffect(() => {
    if (!nodePool) {
      return;
    }
    if (open) {
      setValue('update_strategy', nodePool.update_strategy);
    }
  }, [nodePool, open]);

  const onSubmit = async (values: VersionUpdateFormFields) => {
    try {
      await updateNodePool({
        // update_strategy: values.update_strategy,
      });
      handleClose();
    } catch (errResponse) {
      /* TODO */
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const planType = typesQuery[0]?.data
    ? extendType(typesQuery[0].data)
    : undefined;

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`Node Pool Updates: ${planType?.formattedLabel ?? 'Unknown'} Plan`}
    >
      {formState.errors.root?.message ? (
        <Notice
          spacingBottom={16}
          text={formState.errors.root.message}
          variant="error"
        />
      ) : null}
      <FormProvider
        control={control}
        formState={formState}
        setValue={setValue}
        watch={watch}
        {...form}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Typography
            marginBottom={(theme) => theme.spacing(3)}
            marginTop={(theme) => theme.spacing()}
          >
            Choose how you would like your node pools to update. TODO: something
            about how this related to cluster versioning.
          </Typography>
          <Controller
            control={control}
            name="update_strategy"
            render={({ field }) => (
              <Autocomplete
                label="Version Update Strategy"
                onChange={(e, updateStrategy) =>
                  field.onChange(updateStrategy ?? null)
                }
                options={updateStrategyOptions}
                placeholder="Select a Role"
                textFieldProps={{ hideLabel: true }}
              />
            )}
          />

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: !formState.isDirty || isPending,
              label: 'Save Update Strategy',
              loading: isPending,
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: handleClose,
            }}
          />
        </form>
      </FormProvider>
    </Drawer>
  );
};

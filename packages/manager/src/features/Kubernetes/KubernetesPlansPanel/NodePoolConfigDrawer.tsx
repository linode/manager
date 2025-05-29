import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  Notice,
  Typography,
} from '@linode/ui';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import type { NodePoolUpdateStrategy } from '@linode/api-v4';

export interface Props {
  // nodePool: KubeNodePoolResponseBeta | undefined;
  onClose: () => void;
  open: boolean;
}

interface VersionUpdateFormFields {
  update_strategy: NodePoolUpdateStrategy;
}

const updateStrategyOptions = [
  { label: 'on_recycle', value: 'On Recycle Updates' },
  { label: 'rolling_update', value: 'Rolling Updates' },
];

export const NodePoolConfigDrawer = (props: Props) => {
  const { onClose, open } = props;

  const { control, formState, setValue, watch, ...form } =
    useForm<VersionUpdateFormFields>({
      defaultValues: {},
    });

  // React.useEffect(() => {
  //   if (!nodePool) {
  //     return;
  //   }
  //   if (open) {
  //     setValue('update_strategy', nodePool.update_strategy);
  //   }
  // }, [nodePool, open]);

  const onSubmit = async (values: VersionUpdateFormFields) => {
    try {
      handleClose();
    } catch (errResponse) {
      /* TODO */
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Drawer onClose={handleClose} open={open} title={`Configure Node Pool`}>
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
                placeholder="Select an update strategy"
              />
            )}
          />

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'add',
              label: 'Add',
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

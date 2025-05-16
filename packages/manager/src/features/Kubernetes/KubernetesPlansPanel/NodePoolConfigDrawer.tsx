import { ActionsPanel, Drawer, Notice, Typography } from '@linode/ui';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { NodePoolsUpdateStrategySelect } from '../NodePoolsUpdateStrategySelect';

import type { NodePoolUpdateStrategy } from '@linode/api-v4';

export interface Props {
  // nodePool: KubeNodePoolResponseBeta | undefined;
  onClose: () => void;
  open: boolean;
}

interface VersionUpdateFormFields {
  update_strategy: NodePoolUpdateStrategy;
}

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
            Choose how you would like your node pool to update. TODO: something
            about how this related to cluster versioning.
          </Typography>
          <Controller
            control={control}
            name="update_strategy"
            render={({ field }) => (
              <NodePoolsUpdateStrategySelect
                onChange={field.onChange}
                value={field.value}
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

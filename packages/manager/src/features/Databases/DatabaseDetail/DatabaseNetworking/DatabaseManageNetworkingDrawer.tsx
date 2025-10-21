import { yupResolver } from '@hookform/resolvers/yup';
import { useDatabaseMutation } from '@linode/queries';
import { Box, Button, Drawer, Notice } from '@linode/ui';
import { updatePrivateNetworkSchema } from '@linode/validation';
import { useNavigate } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DatabaseVPCSelector } from 'src/features/Databases/DatabaseDetail/DatabaseNetworking/DatabaseVPCSelector';

import type { Database, UpdateDatabasePayload, VPC } from '@linode/api-v4';
import type { Theme } from '@linode/ui';

interface Props {
  database: Database;
  onClose: () => void;
  onUnassign: () => void;
  open: boolean;
  vpc: undefined | VPC;
}

export type ManageNetworkingFormValues = Pick<
  UpdateDatabasePayload,
  'private_network'
>;

const DatabaseManageNetworkingDrawer = (props: Props) => {
  const { database, vpc, onClose, onUnassign, open } = props;
  const navigate = useNavigate();

  // Set up initial values for the form. These fields will be empty if no VPC is configured.
  const initialValues: ManageNetworkingFormValues = {
    private_network: {
      vpc_id: vpc?.id ?? null,
      subnet_id: database?.private_network?.subnet_id ?? null,
      public_access: database?.private_network?.public_access ?? false,
    },
  };

  const form = useForm<ManageNetworkingFormValues>({
    defaultValues: initialValues,
    mode: 'onBlur',
    // @ts-expect-error handle null validation with trigger
    resolver: yupResolver(updatePrivateNetworkSchema),
  });

  const {
    formState: { isDirty, isValid },
    handleSubmit,
    reset,
    watch,
  } = form;

  const onSubmit = (values: ManageNetworkingFormValues) => {
    updateDatabase(values).then(() => {
      enqueueSnackbar('Changes are being applied.', {
        variant: 'info',
      });

      navigate({
        to: '/databases/$engine/$databaseId',
        params: {
          engine: database.engine,
          databaseId: database.id,
        },
      });
    });
  };

  const [publicAccess, subnetId, vpcId] = watch([
    'private_network.public_access',
    'private_network.subnet_id',
    'private_network.vpc_id',
  ]);

  const hasVPCConfigured = !!database?.private_network?.vpc_id;
  const hasConfigChanged =
    vpcId !== database?.private_network?.vpc_id ||
    subnetId !== database?.private_network?.subnet_id ||
    publicAccess !== database?.private_network?.public_access;
  const hasValidSelection = !!vpcId && !!subnetId && hasConfigChanged;

  const isSaveDisabled = !isDirty || !isValid || !hasValidSelection;

  const {
    error: manageNetworkingError,
    isPending: submitInProgress,
    mutateAsync: updateDatabase,
    reset: resetMutation,
  } = useDatabaseMutation(database.engine, database.id);

  const handleOnClose = () => {
    onClose();
    reset();
    resetMutation?.();
  };

  /** Resets the form after opening the unassign VPC dialog */
  const handleOnUnassign = () => {
    onUnassign();
    reset();
    resetMutation?.();
  };

  return (
    <Drawer onClose={handleOnClose} open={open} title="Manage Networking">
      {manageNetworkingError && (
        <Notice text={manageNetworkingError[0].reason} variant="error" />
      )}
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DatabaseVPCSelector region={database?.region ?? ''} />
          <Box
            sx={(theme: Theme) => ({
              marginTop: theme.spacingFunction(50),
              paddingTop: theme.spacingFunction(8),
              paddingBottom: theme.spacingFunction(8),
              display: 'flex',
              justifyContent: hasVPCConfigured ? 'space-between' : 'flex-end',
            })}
          >
            {hasVPCConfigured && (
              <Button
                buttonType="outlined"
                disabled={!hasVPCConfigured}
                loading={false}
                onClick={handleOnUnassign}
              >
                Unassign VPC
              </Button>
            )}
            <Box>
              <Button
                buttonType="secondary"
                disabled={false}
                loading={false}
                onClick={handleOnClose}
              >
                Cancel
              </Button>
              <Button
                buttonType="primary"
                data-testid="save-networking-button"
                disabled={isSaveDisabled}
                loading={submitInProgress}
                sx={(theme: Theme) => ({
                  marginLeft: theme.spacingFunction(12),
                })}
                type="submit"
              >
                Save
              </Button>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </Drawer>
  );
};

export default DatabaseManageNetworkingDrawer;

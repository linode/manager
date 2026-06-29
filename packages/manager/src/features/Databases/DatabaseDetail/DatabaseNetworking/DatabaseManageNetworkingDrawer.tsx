import { toast } from '@akamai/cds-components/notification-toast';
import { NotificationBanner } from '@akamai/cds-components/react';
import { Button } from '@akamai/cds-components/react/Button';
import { Spacing } from '@akamai/cds-tokens';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDatabaseMutation } from '@linode/queries';
import { updatePrivateNetworkSchema } from '@linode/validation';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DatabaseDetailVPC } from 'src/features/Databases/DatabaseDetail/DatabaseNetworking/DatabaseDetailVPC';

import { Drawer } from '../../shared/Drawer';

import type { Database, UpdateDatabasePayload, VPC } from '@linode/api-v4';

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
    formState: { isDirty, isValid, errors },
    handleSubmit,
    reset,
    setError,
    watch,
  } = form;

  const onSubmit = async (values: ManageNetworkingFormValues) => {
    try {
      await updateDatabase(values);
      toast.open({
        text: 'Changes are being applied.',
        type: 'info',
      });

      navigate({
        to: '/databases/$engine/$databaseId',
        params: {
          engine: database.engine,
          databaseId: database.id,
        },
      });
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
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
    <Drawer onClose={handleOnClose} open={open}>
      <span slot="header">Manage Networking</span>
      {errors.root?.message && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text={errors.root.message}
          type="error"
        />
      )}
      {errors.private_network?.message && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text={errors.private_network.message}
          type="error"
        />
      )}
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DatabaseDetailVPC region={database?.region ?? ''} />
          <div
            style={{
              marginTop: Spacing.S48,
              paddingTop: Spacing.S8,
              paddingBottom: Spacing.S8,
              display: 'flex',
              justifyContent: hasVPCConfigured ? 'space-between' : 'flex-end',
            }}
          >
            {hasVPCConfigured && (
              <Button
                disabled={!hasVPCConfigured}
                onClick={handleOnUnassign}
                variant="secondary"
              >
                Unassign VPC
              </Button>
            )}
            <div>
              <Button onClick={handleOnClose} variant="link">
                Cancel
              </Button>
              <Button
                data-testid="save-networking-button"
                disabled={isSaveDisabled}
                processing={submitInProgress}
                style={{ marginLeft: Spacing.S24 }}
                type="submit"
                variant="primary"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Drawer>
  );
};

export default DatabaseManageNetworkingDrawer;

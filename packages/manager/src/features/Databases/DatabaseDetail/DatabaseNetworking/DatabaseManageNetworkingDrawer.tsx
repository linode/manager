import { useDatabaseMutation } from '@linode/queries';
import { Box, Button, Drawer, Notice } from '@linode/ui';
import { updatePrivateNetworkSchema } from '@linode/validation';
import { useNavigate } from '@tanstack/react-router';
import { useFormik } from 'formik';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import { DatabaseVPCSelector } from './DatabaseVPCSelector';

import type {
  Database,
  PrivateNetwork,
  UpdateDatabasePayload,
  VPC,
} from '@linode/api-v4';
import type { Theme } from '@linode/ui';

interface Props {
  database: Database;
  onClose: () => void;
  onUnassign: () => void;
  open: boolean;
  vpc: undefined | VPC;
}

export type ManageNetworkingFormValues = {
  private_network: PrivateNetwork;
};

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

  const submitForm = () => {
    const payload: UpdateDatabasePayload = { ...values };

    updateDatabase(payload).then(() => {
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

  const {
    errors,
    handleSubmit,
    resetForm,
    isValid,
    dirty,
    setFieldValue,
    values,
  } = useFormik<ManageNetworkingFormValues>({
    initialValues,
    onSubmit: submitForm,
    validationSchema: updatePrivateNetworkSchema,
    validateOnChange: true,
    validateOnBlur: true,
  }); // TODO (UIE-8903): Replace deprecated Formik with React Hook Form

  const hasVPCConfigured = !!database?.private_network?.vpc_id;
  const hasConfigChanged =
    values.private_network.vpc_id !== database?.private_network?.vpc_id ||
    values.private_network.subnet_id !== database?.private_network?.subnet_id ||
    values.private_network.public_access !==
      database?.private_network?.public_access;
  const hasValidSelection =
    !!values.private_network.vpc_id &&
    !!values.private_network.subnet_id &&
    hasConfigChanged;

  const isSaveDisabled = !dirty || !isValid || !hasValidSelection;

  const {
    error: manageNetworkingError,
    isPending: submitInProgress,
    mutateAsync: updateDatabase,
    reset: resetMutation,
  } = useDatabaseMutation(database.engine, database.id);

  const handleOnClose = () => {
    onClose();
    resetForm();
    resetMutation?.();
  };

  /** Resets the form after opening the unassign VPC dialog */
  const handleOnUnassign = () => {
    onUnassign();
    resetForm();
    resetMutation?.();
  };

  return (
    <Drawer onClose={handleOnClose} open={open} title="Manage Networking">
      {manageNetworkingError && (
        <Notice text={manageNetworkingError[0].reason} variant="error" />
      )}
      <form onSubmit={handleSubmit}>
        <DatabaseVPCSelector
          errors={errors}
          mode="networking"
          onChange={(field: string, value: boolean | null | number) =>
            setFieldValue(field, value)
          }
          privateNetworkValues={values.private_network}
          selectedRegionId={database?.region}
        />
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
    </Drawer>
  );
};

export default DatabaseManageNetworkingDrawer;

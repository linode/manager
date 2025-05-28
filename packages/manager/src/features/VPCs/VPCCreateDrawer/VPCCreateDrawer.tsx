import { ActionsPanel, Box, Drawer, Notice } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { FormProvider } from 'react-hook-form';

import { CannotCreateVPCNotice } from 'src/features/VPCs/VPCCreate/FormComponents/CannotCreateVPCNotice';
import { SubnetContent } from 'src/features/VPCs/VPCCreate/FormComponents/SubnetContent';
import { VPCTopSectionContent } from 'src/features/VPCs/VPCCreate/FormComponents/VPCTopSectionContent';
import { useCreateVPC } from 'src/hooks/useCreateVPC';

import type { VPC } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  /**
   * A function that is called when a VPC is successfully created
   */
  onSuccess: (vpc: VPC) => void;
  open: boolean;
  selectedRegion?: string;
}

export const VPCCreateDrawer = (props: Props) => {
  const theme = useTheme();
  const { onClose, onSuccess, open, selectedRegion } = props;

  const {
    form,
    isLoadingCreateVPC,
    onCreateVPC,
    regionsData,
    userCannotAddVPC,
  } = useCreateVPC({
    handleSelectVPC: onSuccess,
    onDrawerClose: onClose,
    selectedRegion,
  });

  const {
    formState: { errors },
    handleSubmit,
    reset,
  } = form;

  const handleDrawerClose = () => {
    onClose();
    reset();
  };

  return (
    <Drawer onClose={handleDrawerClose} open={open} title={'Create VPC'}>
      {userCannotAddVPC && CannotCreateVPCNotice}
      <FormProvider {...form}>
        <Grid>
          <form onSubmit={handleSubmit(onCreateVPC)}>
            {errors.root?.message ? (
              <Notice text={errors.root.message} variant="error" />
            ) : null}
            <Box sx={{ marginTop: theme.spacing(3) }}>
              <VPCTopSectionContent
                disabled={userCannotAddVPC}
                isDrawer
                regions={regionsData}
              />
            </Box>
            <SubnetContent disabled={userCannotAddVPC} isDrawer />
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                disabled: userCannotAddVPC,
                label: 'Create VPC',
                loading: isLoadingCreateVPC,
                onClick: handleSubmit(onCreateVPC),
              }}
              secondaryButtonProps={{
                'data-testid': 'cancel',
                label: 'Cancel',
                onClick: handleDrawerClose,
              }}
              style={{ marginTop: theme.spacing(3) }}
            />
          </form>
        </Grid>
      </FormProvider>
    </Drawer>
  );
};

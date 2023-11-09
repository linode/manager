import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { CannotCreateVPCNotice } from 'src/features/VPCs/VPCCreate/FormComponents/CannotCreateVPCNotice';
import { SubnetContent } from 'src/features/VPCs/VPCCreate/FormComponents/SubnetContent';
import { VPCTopSectionContent } from 'src/features/VPCs/VPCCreate/FormComponents/VPCTopSectionContent';
import { useCreateVPC } from 'src/hooks/useCreateVPC';

interface Props {
  handleSelectVPC: (vpcId: number) => void;
  onClose: () => void;
  open: boolean;
  selectedRegion?: string;
}

export const VPCCreateDrawer = (props: Props) => {
  const theme = useTheme();
  const { handleSelectVPC, onClose, open, selectedRegion } = props;

  const {
    formik,
    generalAPIError,
    generalSubnetErrorsFromAPI,
    isLoadingCreateVPC,
    onChangeField,
    onCreateVPC,
    regionsWithVPCCapability,
    setGeneralAPIError,
    setGeneralSubnetErrorsFromAPI,
    userCannotAddVPC,
  } = useCreateVPC({ handleSelectVPC, onDrawerClose: onClose, selectedRegion });

  const { errors, handleSubmit, resetForm, setFieldValue, values } = formik;

  React.useEffect(() => {
    if (open) {
      resetForm();
      setGeneralSubnetErrorsFromAPI([]);
      setGeneralAPIError(undefined);
    }
  }, [open, resetForm, setGeneralAPIError, setGeneralSubnetErrorsFromAPI]);

  return (
    <Drawer onClose={onClose} open={open} title={'Create VPC'}>
      {userCannotAddVPC && CannotCreateVPCNotice}
      <Grid>
        {generalAPIError ? (
          <Notice text={generalAPIError} variant="error" />
        ) : null}
        <form onSubmit={handleSubmit}>
          <Box sx={{ marginTop: theme.spacing(3) }}>
            <VPCTopSectionContent
              disabled={userCannotAddVPC}
              errors={errors}
              isDrawer
              onChangeField={onChangeField}
              regions={regionsWithVPCCapability}
              values={values}
            />
          </Box>
          <SubnetContent
            disabled={userCannotAddVPC}
            isDrawer
            onChangeField={setFieldValue}
            subnetErrors={generalSubnetErrorsFromAPI}
            subnets={values.subnets}
          />
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: userCannotAddVPC,
              label: 'Create VPC',
              loading: isLoadingCreateVPC,
              onClick: onCreateVPC,
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: onClose,
            }}
            style={{ marginTop: theme.spacing(3) }}
          />
        </form>
      </Grid>
    </Drawer>
  );
};

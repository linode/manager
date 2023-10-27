import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { CannotCreateVPCNotice } from 'src/features/VPCs/VPCCreate/FormComponents/CannotCreateVPCNotice';
import { SubnetContent } from 'src/features/VPCs/VPCCreate/FormComponents/SubnetContent';
import { VPCSpecificContent } from 'src/features/VPCs/VPCCreate/FormComponents/VPCSpecificContent';
import { useCreateVPC } from 'src/hooks/useCreateVPC';

interface Props {
  handleSelectVPC: (vpcId: number) => void;
  onClose: () => void;
  open: boolean;
  selectedRegion?: string;
}

export const VPCCreateDrawer = (props: Props) => {
  const { handleSelectVPC, onClose, open, selectedRegion } = props;

  const theme = useTheme();

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
      {userCannotAddVPC && <CannotCreateVPCNotice />}
      <Grid>
        {generalAPIError ? (
          <Notice text={generalAPIError} variant="error" />
        ) : null}
        <form onSubmit={handleSubmit}>
          <VPCSpecificContent
            disabled={userCannotAddVPC}
            errors={errors}
            isDrawer
            onChangeField={onChangeField}
            regions={regionsWithVPCCapability}
            values={values}
          />
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

import { APIError } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { MultipleSubnetInput } from 'src/features/VPCs/VPCCreate/MultipleSubnetInput';
import {
  StyledBodyTypography,
  StyledHeaderTypography,
} from 'src/features/VPCs/VPCCreate/VPCCreate.styles';
import { useCreateVPC } from 'src/hooks/useCreateVPC';
import { useRegionsQuery } from 'src/queries/regions';

interface Props {
  handleSelectVPC: (vpcId: number) => void;
  onClose: () => void;
  open: boolean;
  selectedRegion?: string;
}

export const VPCCreateDrawer = (props: Props) => {
  const { handleSelectVPC, onClose, open, selectedRegion } = props;

  const theme = useTheme();
  const { data: regions } = useRegionsQuery();

  const {
    formik,
    generalAPIError,
    generalSubnetErrorsFromAPI,
    isLoadingCreateVPC,
    onChangeField,
    onCreateVPC,
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
      {userCannotAddVPC && (
        <Notice
          text={
            "You don't have permissions to create a new VPC. Please contact an account administrator for details."
          }
          important
          spacingTop={16}
          variant="error"
        />
      )}
      <Grid>
        {generalAPIError ? (
          <Notice text={generalAPIError} variant="error" />
        ) : null}
        <form onSubmit={handleSubmit}>
          <StyledBodyTypography variant="body1">
            A virtual private cloud (VPC) is an isolated network which allows
            for control over how resources are networked and can communicate.
            <Link to="#"> Learn more</Link>.
            {/* @TODO VPC: learn more link here */}
          </StyledBodyTypography>
          <RegionSelect
            handleSelection={(region: string) =>
              onChangeField('region', region)
            }
            disabled={true}
            regions={regions ?? []}
            selectedID={selectedRegion ?? ''}
          />
          <TextField
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChangeField('label', e.target.value)
            }
            disabled={userCannotAddVPC}
            errorText={errors.label}
            label="VPC Label"
            value={values.label}
          />
          <TextField
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChangeField('description', e.target.value)
            }
            disabled={userCannotAddVPC}
            errorText={errors.description}
            label="Description"
            multiline
            optional
            value={values.description}
          />
          <StyledHeaderTypography variant="h2">Subnets</StyledHeaderTypography>
          <StyledBodyTypography variant="body1">
            A subnet divides a VPC into multiple logically defined networks to
            allow for controlled access to VPC resources. Subnets within a VPC
            are routable regardless of the address spaces they are in.
            <Link to="#"> Learn more</Link>.
            {/* @TODO VPC: subnet learn more link here */}
          </StyledBodyTypography>
          {generalSubnetErrorsFromAPI
            ? generalSubnetErrorsFromAPI.map((apiError: APIError) => (
                <Notice
                  key={apiError.reason}
                  spacingBottom={8}
                  text={apiError.reason}
                  variant="error"
                />
              ))
            : null}
          <MultipleSubnetInput
            disabled={userCannotAddVPC}
            onChange={(subnets) => setFieldValue('subnets', subnets)}
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

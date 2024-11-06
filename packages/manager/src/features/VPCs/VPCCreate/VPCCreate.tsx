import { Notice, Paper } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { FormProvider } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { VPC_GETTING_STARTED_LINK } from 'src/features/VPCs/constants';
import { SubnetContent } from 'src/features/VPCs/VPCCreate/FormComponents/SubnetContent2';
import { useCreateVPC } from 'src/hooks/useCreateVPCv2';

import { CannotCreateVPCNotice } from './FormComponents/CannotCreateVPCNotice';
import { StyledHeaderTypography } from './FormComponents/VPCCreateForm.styles';
import { VPCTopSectionContent } from './FormComponents/VPCTopSectionContent2';

const VPCCreate = () => {
  const {
    form,
    isLoadingCreateVPC,
    onCreateVPC,
    regionsData,
    userCannotAddVPC,
  } = useCreateVPC({ pushToVPCPage: true });

  const {
    formState: { errors },
    handleSubmit,
  } = form;

  return (
    <FormProvider {...form}>
      <DocumentTitleSegment segment="Create VPC" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Virtual Private Cloud',
              position: 1,
            },
          ],
          pathname: `/vpcs/create`,
        }}
        docsLabel="Getting Started"
        docsLink={VPC_GETTING_STARTED_LINK}
        title="Create"
      />
      {userCannotAddVPC && CannotCreateVPCNotice}
      <Grid>
        {errors.root?.message ? (
          <Notice text={errors.root.message} variant="error" />
        ) : null}
        <form onSubmit={handleSubmit(onCreateVPC)}>
          <Paper>
            <StyledHeaderTypography variant="h2">VPC</StyledHeaderTypography>
            <VPCTopSectionContent
              disabled={userCannotAddVPC}
              regions={regionsData}
            />
          </Paper>
          <Paper sx={(theme) => ({ marginTop: theme.spacing(2.5) })}>
            {/* <SubnetContent
              disabled={userCannotAddVPC}
              onChangeField={setFieldValue}
              subnetErrors={generalSubnetErrorsFromAPI}
              subnets={values.subnets}
            /> */}
          </Paper>
          <StyledActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: userCannotAddVPC,
              label: 'Create VPC',
              loading: isLoadingCreateVPC,
            }}
          />
        </form>
      </Grid>
    </FormProvider>
  );
};

export const vpcCreateLazyRoute = createLazyRoute('/vpcs/create')({
  component: VPCCreate,
});

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})(({ theme }) => ({
  display: 'flex',
  justifyContent: 'right',
  marginTop: theme.spacing(2),
}));

export default VPCCreate;

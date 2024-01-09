import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { SubnetContent } from 'src/features/VPCs/VPCCreate/FormComponents/SubnetContent';
import { VPC_DOCS_LINK } from 'src/features/VPCs/constants';
import { useCreateVPC } from 'src/hooks/useCreateVPC';

import { CannotCreateVPCNotice } from './FormComponents/CannotCreateVPCNotice';
import { StyledHeaderTypography } from './FormComponents/VPCCreateForm.styles';
import { VPCTopSectionContent } from './FormComponents/VPCTopSectionContent';

const VPCCreate = () => {
  const {
    formik,
    generalAPIError,
    generalSubnetErrorsFromAPI,
    isLoadingCreateVPC,
    onChangeField,
    onCreateVPC,
    regionsData,
    userCannotAddVPC,
  } = useCreateVPC({ pushToVPCPage: true });

  const { errors, handleSubmit, setFieldValue, values } = formik;

  return (
    <>
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
        docsLink={VPC_DOCS_LINK}
        title="Create"
      />
      {userCannotAddVPC && CannotCreateVPCNotice}
      <Grid>
        {generalAPIError ? (
          <Notice text={generalAPIError} variant="error" />
        ) : null}
        <form onSubmit={handleSubmit}>
          <Paper>
            <StyledHeaderTypography variant="h2">VPC</StyledHeaderTypography>
            <VPCTopSectionContent
              disabled={userCannotAddVPC}
              errors={errors}
              onChangeField={onChangeField}
              regions={regionsData}
              values={values}
            />
          </Paper>
          <Paper sx={(theme) => ({ marginTop: theme.spacing(2.5) })}>
            <SubnetContent
              disabled={userCannotAddVPC}
              onChangeField={setFieldValue}
              subnetErrors={generalSubnetErrorsFromAPI}
              subnets={values.subnets}
            />
          </Paper>
          <StyledActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: userCannotAddVPC,
              label: 'Create VPC',
              loading: isLoadingCreateVPC,
              onClick: onCreateVPC,
            }}
          />
        </form>
      </Grid>
    </>
  );
};

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})(({ theme }) => ({
  display: 'flex',
  justifyContent: 'right',
  marginTop: theme.spacing(2),
}));

export default VPCCreate;

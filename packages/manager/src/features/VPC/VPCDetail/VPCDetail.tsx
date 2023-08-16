import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { Paper } from 'src/components/Paper';
import { useRegionsQuery } from 'src/queries/regions';
import { useVPCQuery } from 'src/queries/vpcs';

import { VPCDeleteDialog } from '../VPCLanding/VPCDeleteDialog';
import { VPCEditDrawer } from '../VPCLanding/VPCEditDrawer';

const VPCDetail = () => {
  const { vpcId } = useParams<{ vpcId: string }>();
  const { data: vpc, error, isLoading } = useVPCQuery(+vpcId);

  const { data: regions } = useRegionsQuery();

  const [editVPCDrawerOpen, setEditVPCDrawerOpen] = React.useState(false);
  const [deleteVPCDialogOpen, setDeleteVPCDialogOpen] = React.useState(false);

  const handleEditVPC = () => {
    setEditVPCDrawerOpen(true);
  };

  const handleDeleteVPC = () => {
    setDeleteVPCDialogOpen(true);
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!vpc || error) {
    return (
      <ErrorState errorText="There was a problem retrieving your VPC. Please try again." />
    );
  }

  const regionLabel =
    regions?.find((r) => r.id === vpc.region)?.label ?? vpc.region;

  const numLinodes = vpc.subnets.reduce(
    (acc, subnet) => acc + subnet.linodes.length,
    0
  );

  const summaryData = [
    [
      {
        label: 'Subnets',
        value: vpc.subnets.length,
      },
      {
        label: 'Linodes',
        value: numLinodes,
      },
    ],
    [
      {
        label: 'Region',
        value: regionLabel,
      },
      {
        label: 'VPC ID',
        value: vpc.id,
      },
    ],
    [
      {
        label: 'Created',
        value: vpc.created,
      },

      {
        label: 'Updated',
        value: vpc.updated,
      },
    ],
  ];

  return (
    <>
      <DocumentTitleSegment segment="VPC" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Virtual Private Cloud (VPC)',
              position: 1,
            },
          ],
          labelOptions: { noCap: true },
          pathname: `/vpc/${vpc.label}`,
        }}
        docsLabel="Docs"
        docsLink="#" // TODO: VPC - Add docs link
      />
      <EntityHeader>
        <Box>
          <Typography
            sx={(theme) => ({
              color: theme.textColors.headlineStatic,
              fontFamily: theme.font.bold,
              fontSize: '1rem',
              padding: '6px 16px',
            })}
          >
            Summary
          </Typography>
        </Box>
        <Box display="flex" justifyContent="end">
          <StyledActionButton onClick={handleEditVPC}>Edit</StyledActionButton>
          <StyledActionButton onClick={handleDeleteVPC}>
            Delete
          </StyledActionButton>
        </Box>
      </EntityHeader>
      <StyledPaper>
        <Box display="flex" flex={1}>
          {summaryData.map((col) => {
            return (
              <div key={col[0].label}>
                <StyledSummaryTypography sx={{ paddingBottom: 2 }}>
                  <StyledSummaryBox>
                    <strong>{col[0].label}</strong> {col[0].value}
                  </StyledSummaryBox>
                </StyledSummaryTypography>
                <StyledSummaryTypography>
                  <StyledSummaryBox>
                    <strong>{col[1].label}</strong> {col[1].value}
                  </StyledSummaryBox>
                </StyledSummaryTypography>
              </div>
            );
          })}
        </Box>
        {vpc.description.length > 0 && (
          <StyledSummaryBox display="flex" flex={1}>
            <Typography>
              <strong style={{ paddingRight: 8 }}>Description</strong>{' '}
            </Typography>
            <Typography>{vpc.description}</Typography>
          </StyledSummaryBox>
        )}
      </StyledPaper>
      <VPCDeleteDialog
        id={vpc.id}
        label={vpc.label}
        onClose={() => setDeleteVPCDialogOpen(false)}
        open={deleteVPCDialogOpen}
      />
      <VPCEditDrawer
        onClose={() => setEditVPCDrawerOpen(false)}
        open={editVPCDrawerOpen}
        vpc={vpc}
      />
      <Box paddingTop={2}>Subnets Placeholder</Box>
    </>
  );
};

export default VPCDetail;

const StyledActionButton = styled(Button)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.color.blueDTwhite,
    color: theme.color.white,
  },
  color: theme.textColors.linkActiveLight,
  fontFamily: theme.font.normal,
  fontSize: '0.875rem',
  height: theme.spacing(5),
  minWidth: 'auto',
}));

const StyledSummaryTypography = styled(Typography)(({ theme }) => ({
  '& strong': {
    paddingRight: theme.spacing(1),
  },
  paddingRight: theme.spacing(6),
  [theme.breakpoints.down('md')]: {
    paddingRight: theme.spacing(3),
  },
}));

const StyledSummaryBox = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderTop: `1px solid ${theme.borderColors.borderTable}`,
  display: 'flex',
  padding: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    '& div': {
      paddingBottom: theme.spacing(),
    },
    flexDirection: 'column',
    padding: theme.spacing(2),
  },
}));

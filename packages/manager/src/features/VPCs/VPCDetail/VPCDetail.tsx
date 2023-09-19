import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { useRegionsQuery } from 'src/queries/regions';
import { useVPCQuery } from 'src/queries/vpcs';
import { truncate } from 'src/utilities/truncate';

import { VPCDeleteDialog } from '../VPCLanding/VPCDeleteDialog';
import { VPCEditDrawer } from '../VPCLanding/VPCEditDrawer';
import { getUniqueLinodesFromSubnets } from '../utils';
import {
  StyledActionButton,
  StyledDescriptionBox,
  StyledPaper,
  StyledSummaryBox,
  StyledSummaryTextTypography,
} from './VPCDetail.styles';
import { VPCSubnetsTable } from './VPCSubnetsTable';

const VPCDetail = () => {
  const { vpcId } = useParams<{ vpcId: string }>();
  const theme = useTheme();

  const { data: vpc, error, isLoading } = useVPCQuery(+vpcId);
  const { data: regions } = useRegionsQuery();

  const [editVPCDrawerOpen, setEditVPCDrawerOpen] = React.useState(false);
  const [deleteVPCDialogOpen, setDeleteVPCDialogOpen] = React.useState(false);
  const [showFullDescription, setShowFullDescription] = React.useState(false);

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!vpc || error) {
    return (
      <ErrorState errorText="There was a problem retrieving your VPC. Please try again." />
    );
  }

  const description =
    vpc.description.length < 150 || showFullDescription
      ? vpc.description
      : truncate(vpc.description, 150);

  const regionLabel =
    regions?.find((r) => r.id === vpc.region)?.label ?? vpc.region;

  const numLinodes = getUniqueLinodesFromSubnets(vpc.subnets);

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
      <DocumentTitleSegment segment={vpc.label} />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Virtual Private Cloud (VPC)',
              position: 1,
            },
          ],
          labelOptions: { noCap: true },
          pathname: `/vpcs/${vpc.label}`,
        }}
        docsLabel="Docs"
        docsLink="#" // @TODO VPC: Add docs link
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
          <StyledActionButton onClick={() => setEditVPCDrawerOpen(true)}>
            Edit
          </StyledActionButton>
          <StyledActionButton onClick={() => setDeleteVPCDialogOpen(true)}>
            Delete
          </StyledActionButton>
        </Box>
      </EntityHeader>
      <StyledPaper>
        <StyledSummaryBox display="flex" flex={1}>
          {summaryData.map((col) => {
            return (
              <Box key={col[0].label} paddingRight={6}>
                <StyledSummaryTextTypography>
                  <strong>{col[0].label}</strong> {col[0].value}
                </StyledSummaryTextTypography>
                <StyledSummaryTextTypography>
                  <strong>{col[1].label}</strong> {col[1].value}
                </StyledSummaryTextTypography>
              </Box>
            );
          })}
        </StyledSummaryBox>
        {vpc.description.length > 0 && (
          <StyledDescriptionBox display="flex" flex={1}>
            <Typography>
              <strong style={{ paddingRight: 8 }}>Description</strong>{' '}
            </Typography>
            <Typography>
              {description}{' '}
              {description.length > 150 && (
                <button
                  onClick={() => setShowFullDescription((show) => !show)}
                  style={{ ...theme.applyLinkStyles, fontSize: '0.875rem' }}
                >
                  Read {showFullDescription ? 'Less' : 'More'}
                </button>
              )}
            </Typography>
          </StyledDescriptionBox>
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
      <Box
        sx={(theme) => ({
          [theme.breakpoints.up('lg')]: {
            paddingLeft: 0,
          },
        })}
        padding={`${theme.spacing(2)} ${theme.spacing()}`}
      >
        <Typography variant="h2">Subnets ({vpc.subnets.length})</Typography>
      </Box>
      <VPCSubnetsTable vpcId={vpc.id} />
    </>
  );
};

export default VPCDetail;

import { useRegionsQuery, useVPCQuery } from '@linode/queries';
import {
  Box,
  CircleProgress,
  ErrorState,
  Notice,
  StyledLinkButton,
  Typography,
} from '@linode/ui';
import { truncate } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { LandingHeader } from 'src/components/LandingHeader';
import { VPC_DOCS_LINK, VPC_LABEL } from 'src/features/VPCs/constants';

import {
  getIsVPCLKEEnterpriseCluster,
  getUniqueLinodesFromSubnets,
} from '../utils';
import { VPCDeleteDialog } from '../VPCLanding/VPCDeleteDialog';
import { VPCEditDrawer } from '../VPCLanding/VPCEditDrawer';
import {
  StyledActionButton,
  StyledBox,
  StyledDescriptionBox,
  StyledSummaryBox,
  StyledSummaryTextTypography,
} from './VPCDetail.styles';
import { VPCSubnetsTable } from './VPCSubnetsTable';
import { LKE_ENTERPRISE_VPC_WARNING } from 'src/features/Kubernetes/constants';

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

  const isVPCLKEEnterpriseCluster = getIsVPCLKEEnterpriseCluster(vpc);

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
              label: VPC_LABEL,
              position: 1,
            },
          ],
          labelOptions: { noCap: true },
          pathname: `/vpcs/${vpc.label}`,
        }}
        docsLabel="Docs"
        docsLink={VPC_DOCS_LINK}
      />
      <EntityHeader>
        <Box>
          <Typography
            sx={(theme) => ({
              color: theme.textColors.headlineStatic,
              font: theme.font.bold,
              fontSize: '1rem',
              padding: '6px 16px',
            })}
          >
            Summary
          </Typography>
        </Box>
        <Box display="flex" justifyContent="end">
          <StyledActionButton
            disabled={isVPCLKEEnterpriseCluster}
            onClick={() => setEditVPCDrawerOpen(true)}
          >
            Edit
          </StyledActionButton>
          <StyledActionButton
            disabled={isVPCLKEEnterpriseCluster}
            onClick={() => setDeleteVPCDialogOpen(true)}
          >
            Delete
          </StyledActionButton>
        </Box>
      </EntityHeader>
      <StyledBox>
        <StyledSummaryBox data-qa-vpc-summary display="flex" flex={1}>
          {summaryData.map((col) => {
            return (
              <Box key={col[0].label} paddingRight={6}>
                <StyledSummaryTextTypography>
                  <span style={{ font: theme.font.bold }}>{col[0].label}</span>{' '}
                  {col[0].value}
                </StyledSummaryTextTypography>
                <StyledSummaryTextTypography>
                  <span style={{ font: theme.font.bold }}>{col[1].label}</span>{' '}
                  {col[1].value}
                </StyledSummaryTextTypography>
              </Box>
            );
          })}
        </StyledSummaryBox>
        {vpc.description.length > 0 && (
          <StyledDescriptionBox display="flex" flex={1}>
            <Typography>
              <span style={{ font: theme.font.bold, paddingRight: 8 }}>
                Description
              </span>{' '}
            </Typography>
            <Typography sx={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}>
              {description}{' '}
              {description.length > 150 && (
                <StyledLinkButton
                  onClick={() => setShowFullDescription((show) => !show)}
                  sx={{ fontSize: '0.875rem' }}
                >
                  Read {showFullDescription ? 'Less' : 'More'}
                </StyledLinkButton>
              )}
            </Typography>
          </StyledDescriptionBox>
        )}
      </StyledBox>
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
      {isVPCLKEEnterpriseCluster && (
        <Notice
          bgcolor={theme.palette.background.paper}
          spacingTop={24}
          style={{ padding: '8px 16px' }}
          variant="warning"
        >
          <Typography>{LKE_ENTERPRISE_VPC_WARNING}</Typography>
        </Notice>
      )}
      <Box
        sx={(theme) => ({
          [theme.breakpoints.up('lg')]: {
            paddingLeft: 0,
          },
        })}
        padding={`${theme.spacing(2)} ${theme.spacing()}`}
      >
        <Typography sx={{ fontSize: '1rem' }} variant="h2">
          Subnets ({vpc.subnets.length})
        </Typography>
      </Box>
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={isVPCLKEEnterpriseCluster}
        vpcId={vpc.id}
        vpcRegion={vpc.region}
      />
    </>
  );
};

export const vpcDetailLazyRoute = createLazyRoute('/vpcs/$vpcId')({
  component: VPCDetail,
});

export default VPCDetail;

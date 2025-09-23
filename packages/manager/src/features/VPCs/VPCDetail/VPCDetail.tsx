import { useRegionsQuery, useVPCQuery } from '@linode/queries';
import {
  Box,
  CircleProgress,
  ErrorState,
  LinkButton,
  Typography,
} from '@linode/ui';
import { truncate } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { LandingHeader } from 'src/components/LandingHeader';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { LKE_ENTERPRISE_AUTOGEN_VPC_WARNING } from 'src/features/Kubernetes/constants';
import { useIsNodebalancerVPCEnabled } from 'src/features/NodeBalancers/utils';
import { VPC_DOCS_LINK, VPC_LABEL } from 'src/features/VPCs/constants';

import {
  getIsVPCLKEEnterpriseCluster,
  getUniqueLinodesFromSubnets,
  getUniqueResourcesFromSubnets,
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

import type { VPC } from '@linode/api-v4';

const VPCDetail = () => {
  const params = useParams({ strict: false });
  const { vpcId } = params;
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    data: vpc,
    error,
    isFetching: isFetchingVPC,
    isLoading,
  } = useVPCQuery(Number(vpcId) || -1, Boolean(vpcId));

  const flags = useIsNodebalancerVPCEnabled();

  const { data: regions } = useRegionsQuery();

  const { data: permissions } = usePermissions(
    'vpc',
    ['update_vpc', 'delete_vpc'],
    vpcId
  );

  const handleEditVPC = (vpc: VPC) => {
    navigate({
      params: { action: 'edit', vpcId: vpc.id },
      to: '/vpcs/$vpcId/detail/$action',
    });
  };

  const handleDeleteVPC = (vpc: VPC) => {
    navigate({
      params: { action: 'delete', vpcId: vpc.id },
      to: '/vpcs/$vpcId/detail/$action',
    });
  };

  const onCloseVPCDrawer = () => {
    navigate({
      params: { vpcId: vpc?.id ?? -1 },
      to: '/vpcs/$vpcId',
    });
  };

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

  const numResources = flags.isNodebalancerVPCEnabled
    ? getUniqueResourcesFromSubnets(vpc.subnets)
    : getUniqueLinodesFromSubnets(vpc.subnets);

  const summaryData = [
    [
      {
        label: 'Subnets',
        value: vpc.subnets.length,
      },
      {
        label: flags.isNodebalancerVPCEnabled ? 'Resources' : 'Linodes',
        value: numResources,
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
            disabled={!permissions.update_vpc}
            onClick={() => handleEditVPC(vpc)}
            tooltipText={
              !permissions.update_vpc
                ? 'You do not have permission to edit this VPC.'
                : undefined
            }
          >
            Edit
          </StyledActionButton>
          <StyledActionButton
            disabled={!permissions.delete_vpc}
            onClick={() => handleDeleteVPC(vpc)}
            tooltipText={
              !permissions.delete_vpc
                ? 'You do not have permission to delete this VPC.'
                : undefined
            }
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
                <LinkButton
                  data-testid="show-description-button"
                  onClick={() => setShowFullDescription((show) => !show)}
                  sx={{ fontSize: '0.875rem' }}
                >
                  Read {showFullDescription ? 'Less' : 'More'}
                </LinkButton>
              )}
            </Typography>
          </StyledDescriptionBox>
        )}
      </StyledBox>
      <VPCDeleteDialog
        isFetching={isFetchingVPC}
        onClose={onCloseVPCDrawer}
        open={params.action === 'delete'}
        vpc={vpc}
        vpcError={error}
      />
      <VPCEditDrawer
        isFetching={isFetchingVPC}
        onClose={onCloseVPCDrawer}
        open={params.action === 'edit'}
        vpc={vpc}
        vpcError={error}
      />
      {isVPCLKEEnterpriseCluster && (
        <DismissibleBanner
          bgcolor={theme.palette.background.paper}
          preferenceKey={`vpc-${vpc.id}`}
          spacingTop={24}
          style={{ padding: '8px 16px' }}
          variant="info"
        >
          <Typography>{LKE_ENTERPRISE_AUTOGEN_VPC_WARNING}</Typography>
        </DismissibleBanner>
      )}
      <Box
        padding={`${theme.spacingFunction(16)} ${theme.spacingFunction(8)}`}
        sx={(theme) => ({
          [theme.breakpoints.up('lg')]: {
            paddingLeft: 0,
          },
        })}
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

export default VPCDetail;

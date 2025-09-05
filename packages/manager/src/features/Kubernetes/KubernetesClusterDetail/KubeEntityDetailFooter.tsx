import { useProfile, useVPCQuery } from '@linode/queries';
import { Box, CircleProgress, StyledLinkButton } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { TagCell } from 'src/components/TagCell/TagCell';
import {
  StyledLabelBox,
  StyledListItem,
  sxLastListItem,
  sxListItemFirstChild,
} from 'src/features/Linodes/LinodeEntityDetail.styles';
import { useKubernetesClusterMutation } from 'src/queries/kubernetes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';

import { useIsLkeEnterpriseEnabled } from '../kubeUtils';

import type { KubernetesControlPlaneACLPayload } from '@linode/api-v4';
import type { SxProps } from '@mui/material/styles';
interface FooterProps {
  aclData: KubernetesControlPlaneACLPayload | undefined;
  areClusterLinodesReadOnly: boolean;
  clusterCreated: string;
  clusterId: number;
  clusterLabel: string;
  clusterTags: string[];
  clusterUpdated: string;
  isClusterReadOnly: boolean;
  isLoadingKubernetesACL: boolean;
  setControlPlaneACLDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sx?: SxProps;
  vpcId: null | number | undefined;
}

export const KubeEntityDetailFooter = React.memo((props: FooterProps) => {
  const theme = useTheme();

  const { data: profile } = useProfile();
  const {
    aclData,
    clusterCreated,
    clusterLabel,
    clusterTags,
    areClusterLinodesReadOnly,
    clusterId,
    clusterUpdated,
    isLoadingKubernetesACL,
    isClusterReadOnly,
    setControlPlaneACLDrawerOpen,
    vpcId,
  } = props;

  const { isLkeEnterprisePhase2BYOVPCFeatureEnabled } =
    useIsLkeEnterpriseEnabled();

  const enabledACL = aclData?.acl.enabled ?? false;
  const totalIPv4 = aclData?.acl.addresses?.ipv4?.length ?? 0;
  const totalIPv6 = aclData?.acl.addresses?.ipv6?.length ?? 0;
  const totalNumberIPs = totalIPv4 + totalIPv6;

  const buttonCopyACL = enabledACL
    ? `Enabled (${pluralize('IP Address', 'IP Addresses', totalNumberIPs)})`
    : 'Enable';

  const { data: vpc } = useVPCQuery(
    vpcId ?? -1,
    isLkeEnterprisePhase2BYOVPCFeatureEnabled && Boolean(vpcId)
  );

  const { mutateAsync: updateKubernetesCluster } =
    useKubernetesClusterMutation(clusterId);

  const handleUpdateTags = React.useCallback(
    (newTags: string[]) => {
      return updateKubernetesCluster({
        tags: newTags,
      }).catch((e) =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error updating tags')[0].reason,
          {
            variant: 'error',
          }
        )
      );
    },
    [updateKubernetesCluster, enqueueSnackbar]
  );

  return (
    <Grid
      container
      data-qa-kube-entity-footer
      direction="column"
      sx={{
        flex: 1,
        paddingTop: theme.spacingFunction(8),
      }}
    >
      <Grid
        container
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'space-between',
          padding: 0,
        }}
      >
        <Grid
          size={{
            lg: 'auto',
            xs: 12,
          }}
          sx={{
            alignItems: 'center',
            display: 'flex',
            padding: 0,

            [theme.breakpoints.down('lg')]: {
              padding: '8px',
            },

            [theme.breakpoints.between('md', 'xs')]: {
              display: 'grid',
              gridTemplateColumns: '50% 2fr',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              rowGap: 1,
            }}
          >
            <StyledListItem sx={{ ...sxListItemFirstChild }}>
              <StyledLabelBox component="span">Cluster ID:</StyledLabelBox>{' '}
              <CopyTooltip copyableText text={String(clusterId)} />
            </StyledListItem>
            {isLkeEnterprisePhase2BYOVPCFeatureEnabled && vpc && (
              <StyledListItem
                sx={{
                  alignItems: 'center',
                }}
              >
                <StyledLabelBox component="span">VPC: </StyledLabelBox>{' '}
                <Link
                  data-testid="assigned-lke-cluster-label"
                  to={`/vpcs/${vpcId}`}
                >
                  {vpc?.label ?? `${vpcId}`}
                </Link>
                &nbsp;
                {vpcId && vpc?.label && (
                  <span>
                    (ID: <CopyTooltip copyableText text={String(vpcId)} />)
                  </span>
                )}
              </StyledListItem>
            )}
            <StyledListItem>
              <StyledLabelBox component="span">
                Control Plane ACL:{' '}
              </StyledLabelBox>{' '}
              {isLoadingKubernetesACL ? (
                <Box component="span" sx={{ paddingLeft: 1 }}>
                  <CircleProgress noPadding size="sm" />
                </Box>
              ) : (
                <StyledLinkButton
                  disabled={isClusterReadOnly}
                  onClick={() => setControlPlaneACLDrawerOpen(true)}
                  sx={(theme) => ({
                    '&:disabled': {
                      '& g': {
                        stroke:
                          theme.tokens.alias.Content.Icon.Primary.Disabled,
                      },
                      color: theme.tokens.alias.Content.Text.Primary.Disabled,
                    },
                  })}
                >
                  {buttonCopyACL}
                </StyledLinkButton>
              )}
            </StyledListItem>
            <StyledListItem>
              <StyledLabelBox component="span">Created:</StyledLabelBox>{' '}
              {formatDate(clusterCreated, {
                timezone: profile?.timezone,
              })}
            </StyledListItem>
            <StyledListItem sx={{ ...sxLastListItem }}>
              <StyledLabelBox component="span">Updated:</StyledLabelBox>{' '}
              {formatDate(clusterUpdated, {
                timezone: profile?.timezone,
              })}
            </StyledListItem>
          </Box>
        </Grid>
      </Grid>
      <Grid
        size={{
          lg: 12,
          xs: 12,
        }}
        sx={{
          marginLeft: 'auto',
          marginTop: theme.spacingFunction(8),
        }}
      >
        <TagCell
          disabled={areClusterLinodesReadOnly}
          entity="Kubernetes Cluster"
          entityLabel={clusterLabel}
          sx={{
            width: '100%',
          }}
          tags={clusterTags}
          updateTags={handleUpdateTags}
          view="inline"
        />
      </Grid>
    </Grid>
  );
});

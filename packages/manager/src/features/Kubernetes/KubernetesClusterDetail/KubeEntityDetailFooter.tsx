import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { CircleProgress } from 'src/components/CircleProgress';
import { TagCell } from 'src/components/TagCell/TagCell';
import {
  StyledBox,
  StyledLabelBox,
  StyledListItem,
  sxLastListItem,
  sxListItemFirstChild,
} from 'src/features/Linodes/LinodeEntityDetail.styles';
import { useKubernetesClusterMutation } from 'src/queries/kubernetes';
import { useProfile } from 'src/queries/profile/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';

import type { KubernetesControlPlaneACLPayload } from '@linode/api-v4';

interface FooterProps {
  aclData: KubernetesControlPlaneACLPayload | undefined;
  clusterCreated: string;
  clusterId: number;
  clusterLabel: string;
  clusterTags: string[];
  clusterUpdated: string;
  isClusterReadOnly: boolean;
  isLoadingKubernetesACL: boolean;
  setControlPlaneACLDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showControlPlaneACL: boolean;
}

export const KubeEntityDetailFooter = React.memo((props: FooterProps) => {
  const theme = useTheme();

  const { data: profile } = useProfile();
  const {
    aclData,
    clusterCreated,
    clusterId,
    clusterLabel,
    clusterTags,
    clusterUpdated,
    isClusterReadOnly,
    isLoadingKubernetesACL,
    setControlPlaneACLDrawerOpen,
    showControlPlaneACL,
  } = props;

  const enabledACL = aclData?.acl.enabled ?? false;
  const totalIPv4 = aclData?.acl.addresses?.ipv4?.length ?? 0;
  const totalIPv6 = aclData?.acl.addresses?.ipv6?.length ?? 0;
  const totalNumberIPs = totalIPv4 + totalIPv6;

  const buttonCopyACL = enabledACL
    ? `Enabled (${pluralize('IP Address', 'IP Addresses', totalNumberIPs)})`
    : 'Enable';

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    clusterId
  );

  const { enqueueSnackbar } = useSnackbar();

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
      sx={{
        flex: 1,
        padding: 0,
      }}
      alignItems="center"
      container
      direction="row"
      justifyContent="space-between"
      spacing={2}
    >
      <Grid
        sx={{
          alignItems: 'center',
          display: 'flex',
          padding: 0,
          [theme.breakpoints.down('lg')]: {
            padding: '8px',
          },
          [theme.breakpoints.down('md')]: {
            display: 'grid',
            gridTemplateColumns: '50% 2fr',
          },
        }}
        alignItems="flex-start"
        lg={10}
        xs={12}
      >
        <StyledBox>
          <StyledListItem sx={{ ...sxListItemFirstChild }}>
            <StyledLabelBox component="span">Cluster ID:</StyledLabelBox>{' '}
            {clusterId}
          </StyledListItem>
          {showControlPlaneACL && (
            <StyledListItem
              sx={{
                alignItems: 'center',
              }}
            >
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
                >
                  {buttonCopyACL}
                </StyledLinkButton>
              )}
            </StyledListItem>
          )}
        </StyledBox>
        <StyledBox>
          <StyledListItem
            sx={{
              ...sxListItemFirstChild,
            }}
          >
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
        </StyledBox>
      </Grid>
      <Grid
        sx={{
          [theme.breakpoints.down('lg')]: {
            display: 'flex',
            justifyContent: 'flex-start',
          },
        }}
        lg={2}
        xs={12}
      >
        <TagCell
          sx={{
            width: '100%',
          }}
          disabled={isClusterReadOnly}
          entityLabel={clusterLabel}
          tags={clusterTags}
          updateTags={handleUpdateTags}
          view="inline"
        />
      </Grid>
    </Grid>
  );
});

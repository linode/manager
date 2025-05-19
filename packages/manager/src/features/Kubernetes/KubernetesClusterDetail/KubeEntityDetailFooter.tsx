import { useProfile } from '@linode/queries';
import { Box, CircleProgress, LinkButton } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TagCell } from 'src/components/TagCell/TagCell';
import {
  StyledBox,
  StyledLabelBox,
  StyledListItem,
  sxLastListItem,
  sxListItemFirstChild,
} from 'src/features/Linodes/LinodeEntityDetail.styles';
import { useKubernetesClusterMutation } from 'src/queries/kubernetes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';

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

  const { mutateAsync: updateKubernetesCluster } =
    useKubernetesClusterMutation(clusterId);

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
      container
      data-qa-kube-entity-footer
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

          [theme.breakpoints.down('md')]: {
            display: 'grid',
            gridTemplateColumns: '50% 2fr',
          },
        }}
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
                <LinkButton
                  disabled={isClusterReadOnly}
                  onClick={() => setControlPlaneACLDrawerOpen(true)}
                >
                  {buttonCopyACL}
                </LinkButton>
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
        size={{
          lg: 3.5,
          xs: 12,
        }}
        sx={{
          marginLeft: 'auto',

          [theme.breakpoints.down('lg')]: {
            display: 'flex',
            justifyContent: 'flex-start',
          },
        }}
      >
        <TagCell
          disabled={isClusterReadOnly}
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

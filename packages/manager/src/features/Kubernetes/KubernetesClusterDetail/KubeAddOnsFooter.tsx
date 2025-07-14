import { Box, CircleProgress, StyledLinkButton } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import {
  StyledBox,
  StyledLabelBox,
  StyledListItem,
  sxLastListItem,
  sxListItemFirstChild,
} from 'src/features/Linodes/LinodeEntityDetail.styles';

import type { KubernetesControlPlaneACLPayload } from '@linode/api-v4';
import type { SxProps } from '@mui/material/styles';

interface FooterProps {
  aclData: KubernetesControlPlaneACLPayload | undefined;
  isClusterReadOnly: boolean;
  isLoadingKubernetesACL: boolean;
  setControlPlaneACLDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sx?: SxProps;
}

export const KubeAddOnsFooter = (props: FooterProps) => {
  const theme = useTheme();

  const {
    aclData,
    isClusterReadOnly,
    isLoadingKubernetesACL,
    setControlPlaneACLDrawerOpen,
    sx,
  } = props;

  const enabledACL = aclData?.acl.enabled ?? false;
  const totalIPv4 = aclData?.acl.addresses?.ipv4?.length ?? 0;
  const totalIPv6 = aclData?.acl.addresses?.ipv6?.length ?? 0;
  const totalNumberIPs = totalIPv4 + totalIPv6;

  const buttonCopyACL = enabledACL
    ? `Enabled (${pluralize('IP Address', 'IP Addresses', totalNumberIPs)})`
    : 'Enable';

  return (
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
          paddingX: '8px',
        },

        [theme.breakpoints.down('md')]: {
          display: 'grid',
          gridTemplateColumns: '50% 2fr',
        },
        ...sx,
      }}
    >
      <StyledBox>
        <StyledListItem
          sx={{
            alignItems: 'center',
            ...sxListItemFirstChild,
          }}
        >
          <StyledLabelBox component="span">VPC: </StyledLabelBox>{' '}
        </StyledListItem>
        <StyledListItem sx={{ ...sxLastListItem }}>
          <StyledLabelBox component="span">Control Plane ACL: </StyledLabelBox>{' '}
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
                    stroke: theme.tokens.alias.Content.Icon.Primary.Disabled,
                  },
                  color: theme.tokens.alias.Content.Text.Primary.Disabled,
                },
              })}
            >
              {buttonCopyACL}
            </StyledLinkButton>
          )}
        </StyledListItem>
      </StyledBox>
    </Grid>
  );
};

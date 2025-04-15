import { StyledLinkButton, TooltipIcon, Typography } from '@linode/ui';
import { debounce } from '@mui/material';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import { useCalculateHiddenItems } from '../utilities';
import {
  StyledBox,
  StyledClampedContent,
  StyledContainer,
  StyledGrid,
  StyledPermissionItem,
  sxTooltipIcon,
} from './Permissions.style';

import type { PermissionType } from '@linode/api-v4/lib/iam/types';

type Props = {
  noPermissionsMessage?: string;
  permissions: PermissionType[];
};

export const Permissions = ({
  permissions,
}: Props) => {
  const [showAll, setShowAll] = React.useState(false);

  const { calculateHiddenItems, containerRef, itemRefs, numHiddenItems } =
    useCalculateHiddenItems(permissions, showAll);

  const handleResize = React.useMemo(
    () => debounce(() => calculateHiddenItems(), 100),
    [calculateHiddenItems]
  );

  React.useEffect(() => {
    // Ensure calculateHiddenItems runs after layout stabilization on initial render
    const rafId = requestAnimationFrame(() => calculateHiddenItems());

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateHiddenItems, handleResize]);

  // TODO: update the link for TooltipIcon when it's ready - UIE-8534
  return (
    <Grid container data-testid="parent" direction="column">
      <StyledGrid container item md={1}>
        <Typography
          sx={(theme) => ({
            font: theme.tokens.alias.Typography.Label.Bold.S,
          })}
        >
          Permissions
        </Typography>

        <TooltipIcon
          status="help"
          sxTooltipIcon={sxTooltipIcon}
          text="Link is coming..."
        />
      </StyledGrid>
      {!permissions.length ? (
        <Typography>
          This role doesn’t include permissions. Refer to the role description
          to understand what access is granted by this role.
        </Typography>
      ) : (
        <StyledContainer>
          <StyledClampedContent ref={containerRef} showAll={showAll}>
            {permissions.map((permission: PermissionType, index: number) => (
              <StyledPermissionItem
                data-testid="permission"
                key={permission}
                ref={(el: HTMLSpanElement) => (itemRefs.current[index] = el)}
              >
                {permission}
              </StyledPermissionItem>
            ))}
          </StyledClampedContent>

          {(numHiddenItems > 0 || showAll) && (
            <StyledBox>
              <StyledLinkButton
                onClick={() => setShowAll(!showAll)}
                type="button"
              >
                {showAll ? 'Hide' : ` Expand (+${numHiddenItems})`}
              </StyledLinkButton>
            </StyledBox>
          )}
        </StyledContainer>
      )}
    </Grid>
  );
};

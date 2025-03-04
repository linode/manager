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
  permissions: PermissionType[];
};

export const Permissions = ({ permissions }: Props) => {
  const [showAll, setShowAll] = React.useState(false);

  const {
    calculateHiddenItems,
    containerRef,
    itemRefs,
    numHiddenItems,
  } = useCalculateHiddenItems(permissions, showAll);

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
            font: theme.tokens.typography.Label.Bold.S,
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
            <StyledLinkButton onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Hide' : ` Expand (+${numHiddenItems})`}
            </StyledLinkButton>
          </StyledBox>
        )}
      </StyledContainer>
    </Grid>
  );
};

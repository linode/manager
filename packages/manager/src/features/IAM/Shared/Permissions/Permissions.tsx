import { StyledLinkButton, TooltipIcon } from '@linode/ui';
import { debounce } from '@mui/material';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import {
  StyledBox,
  StyledClampedContent,
  StyledContainer,
  StyledGrid,
  StyledPermissionItem,
  StyledSpan,
  StyledTypography,
  sxTooltipIcon,
} from './Permissions.style';

import type { PermissionType } from '@linode/api-v4/lib/iam/types';

type Props = {
  permissions: PermissionType[];
};

export const Permissions = ({ permissions }: Props) => {
  const [showAll, setShowAll] = React.useState(false);
  const [numHiddenItems, setNumHiddenItems] = React.useState<number>(0);

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const itemRefs = React.useRef<(HTMLSpanElement | null)[]>([]);

  const calculateHiddenItems = React.useCallback(() => {
    if (showAll || !containerRef.current) {
      setNumHiddenItems(0);
      return;
    }

    if (!itemRefs.current) {
      return;
    }

    const containerBottom = containerRef.current.getBoundingClientRect().bottom;

    const itemsArray = Array.from(itemRefs.current);

    const firstHiddenIndex = itemsArray.findIndex(
      (item: HTMLParagraphElement) => {
        const rect = item.getBoundingClientRect();
        return rect.top >= containerBottom;
      }
    );

    const numHiddenItems =
      firstHiddenIndex !== -1 ? itemsArray.length - firstHiddenIndex : 0;

    setNumHiddenItems(numHiddenItems);
  }, [showAll, permissions]);

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
    <Grid
      container
      data-testid="parent"
      direction="column"
      sx={{ marginBottom: 1.25 }}
    >
      <StyledGrid container item md={1}>
        <StyledTypography variant="body1">Permissions</StyledTypography>
        <TooltipIcon
          status="help"
          sxTooltipIcon={sxTooltipIcon}
          text="Link is coming..."
        />
      </StyledGrid>

      <StyledContainer>
        <StyledClampedContent ref={containerRef} showAll={showAll}>
          {(numHiddenItems > 0 || showAll) && (
            <StyledBox>
              {!showAll && <StyledSpan> +{numHiddenItems} </StyledSpan>}
              <StyledLinkButton onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Hide' : ` Expand`}
              </StyledLinkButton>
            </StyledBox>
          )}

          {permissions.map((permission: PermissionType, index: number) => (
            <StyledPermissionItem
              ref={(el: HTMLSpanElement | null) =>
                (itemRefs.current[index] = el)
              }
              data-testid="permission"
              key={permission}
            >
              {permission}
            </StyledPermissionItem>
          ))}
        </StyledClampedContent>
      </StyledContainer>
    </Grid>
  );
};

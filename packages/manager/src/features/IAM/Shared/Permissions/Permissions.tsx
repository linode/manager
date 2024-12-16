import { TooltipIcon } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import {
  StyledButton,
  StyledChip,
  StyledGrid,
  StyledTypography,
  sxTooltipIcon,
} from './Permissions.style';

import type { PermissionType } from '@linode/api-v4/lib/iam/types';

type Props = {
  permissions: PermissionType[];
};

export const Permissions = ({ permissions }: Props) => {
  const [showAllBtn, setShowAllBtn] = React.useState(false);
  const [visibleChips, setVisibleChips] = React.useState<string[]>([]);
  const [hiddenChips, setHiddenChips] = React.useState<string[]>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const calculateVisibleChips = React.useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const chipElements = containerRef.current.querySelectorAll(
      '[data-testid="chip"]'
    );
    const chipArray = Array.from(chipElements);

    const containerWidth = containerRef.current.offsetWidth;
    // Check if it's inside the drawer
    const isSmallContainer = containerWidth < 400;

    const lineHeight = parseFloat(
      getComputedStyle(containerRef.current).lineHeight || '1.5'
    );
    // Height of 2 lines
    const maxHeight = lineHeight * 2 + 10;

    const visibleItems: string[] = [];
    const hiddenItems: string[] = [];
    const leftItems: string[] = [];

    if (containerRef.current.offsetHeight > maxHeight) {
      for (const item of chipArray) {
        const chipLeft = (item as HTMLElement).offsetLeft;

        // The distance between the parent container and the beginning of the child on the left side
        const leftCoordinateStartRow = isSmallContainer ? 42 : 32;

        // Find items that are located near the left side of the container
        if (chipLeft === leftCoordinateStartRow) {
          leftItems.push(item.textContent ?? '');
        }
      }

      if (leftItems.length >= 2) {
        // find the first element on the third line
        const el = leftItems[2];

        const lastIdx = chipArray.findIndex(
          (chip) => chip.textContent?.trim() === el
        );

        visibleItems.push(
          ...chipArray
            .slice(0, lastIdx - 1)
            .map((chip) => chip.textContent ?? '')
        );

        hiddenItems.push(
          ...chipArray.slice(lastIdx - 1).map((chip) => chip.textContent ?? '')
        );
      }
    }

    setVisibleChips(visibleItems);
    setHiddenChips(hiddenItems);
  }, [permissions]);

  React.useEffect(() => {
    calculateVisibleChips();
  }, [calculateVisibleChips]);

  const handleToggle = () => {
    setShowAllBtn((prev) => !prev);
  };

  return (
    <Grid
      container
      data-testid="parent"
      direction="column"
      ref={containerRef}
      sx={{ marginBottom: 1 }}
    >
      <StyledGrid container item md={1}>
        <StyledTypography>Permissions</StyledTypography>
        <TooltipIcon
          status="help"
          sxTooltipIcon={sxTooltipIcon}
          text="Link is coming..."
        />
      </StyledGrid>
      <Grid
        sx={{
          alignItems: 'center',
          margin: 0,
          maxWidth: 'fit-content !important',
        }}
        columnSpacing={3}
        container
        item
        md={11}
        rowSpacing={2}
      >
        {(showAllBtn || !visibleChips.length ? permissions : visibleChips).map(
          (permission: string) => (
            <React.Fragment key={permission}>
              <StyledChip
                data-testid="chip"
                key={permission}
                label={permission}
                variant="outlined"
              />
              <span style={{ paddingLeft: '3px', paddingRight: '3px' }}>
                {' '}
                |{' '}
              </span>
            </React.Fragment>
          )
        )}

        {!showAllBtn && !!hiddenChips.length && (
          <span style={{ paddingLeft: '3px' }}> +{hiddenChips.length} |</span>
        )}

        {!!hiddenChips.length && (
          <StyledButton onClick={handleToggle} variant="text">
            {showAllBtn ? 'Hide' : `Expand`}
          </StyledButton>
        )}
      </Grid>
    </Grid>
  );
};

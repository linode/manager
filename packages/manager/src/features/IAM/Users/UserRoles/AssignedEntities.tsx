import { Box, Button, Chip, Tooltip } from '@linode/ui';
import CloseIcon from '@mui/icons-material/Close';
import { debounce, useTheme } from '@mui/material';
import * as React from 'react';

import { useCalculateHiddenItems } from '../../Shared/utilities';

import type { AccountAccessType, RoleType } from '@linode/api-v4';

type Props = {
  entities: string[];
  onButtonClick: (roleName: AccountAccessType | RoleType) => void;
  roleName: AccountAccessType | RoleType;
};

export const AssignedEntities = ({
  entities,
  onButtonClick,
  roleName,
}: Props) => {
  const theme = useTheme();

  const handleDelete = () => {};

  const {
    calculateHiddenItems,
    containerRef,
    itemRefs,
    numHiddenItems,
  } = useCalculateHiddenItems(entities);

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

  const items = entities?.map((name: string, index: number) => (
    <div
      key={name}
      ref={(el: HTMLDivElement) => (itemRefs.current[index] = el)}
      style={{ display: 'inline-block', marginRight: 8 }}
    >
      <Chip
        sx={{
          backgroundColor: theme.tokens.color.Ultramarine[20],
          color: theme.tokens.content.Text.Primary.Default,
        }}
        data-testid="entities"
        deleteIcon={<CloseIcon />}
        key={name}
        label={name}
        onDelete={handleDelete}
      />
    </div>
  ));

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', maxWidth: '800px' }}>
      <div
        style={{
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 1,
          display: '-webkit-box',
          overflow: 'hidden',
        }}
        ref={containerRef}
      >
        {items}
      </div>
      {numHiddenItems > 0 && (
        <Box
          sx={{
            aligIitems: 'center',
            backgroundColor: theme.tokens.color.Ultramarine[20],
            borderRadius: 1,
            display: 'flex',
            height: '20px',
            maxWidth: 'max-content',
            padding: `${theme.tokens.spacing[20]} ${theme.tokens.spacing[40]}`,
          }}
        >
          <Tooltip placement="top" title="Click to View All Entities">
            <Button
              sx={{
                color: theme.tokens.content.Text.Primary.Default,
                font: theme.tokens.typography.Label.Regular.Xs,
                padding: 0,
              }}
              onClick={() => onButtonClick(roleName)}
            >
              +{numHiddenItems}
            </Button>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

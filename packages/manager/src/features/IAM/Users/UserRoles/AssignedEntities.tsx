import { Box, Button, Chip, CloseIcon, Tooltip } from '@linode/ui';
import { debounce, useTheme } from '@mui/material';
import * as React from 'react';

import { useCalculateHiddenItems } from '../../Shared/TuncatedList';

import type { CombinedEntity, ExtendedRoleView } from '../../Shared/types';
import type { AccountRoleType, EntityRoleType } from '@linode/api-v4';

interface Props {
  onButtonClick: (roleName: AccountRoleType | EntityRoleType) => void;
  onRemoveAssignment: (entity: CombinedEntity, role: ExtendedRoleView) => void;
  role: ExtendedRoleView;
}

export const AssignedEntities = ({
  onButtonClick,
  onRemoveAssignment,
  role,
}: Props) => {
  const theme = useTheme();

  const { calculateHiddenItems, containerRef, itemRefs, numHiddenItems } =
    useCalculateHiddenItems(role.entity_names!);

  const handleResize = React.useMemo(
    () => debounce(() => calculateHiddenItems(), 250),
    [calculateHiddenItems]
  );

  React.useEffect(() => {
    // Double RAF for good measure - see https://stackoverflow.com/questions/44145740/how-does-double-requestanimationframe-work
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => calculateHiddenItems());
    });

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateHiddenItems, handleResize]);

  const combinedEntities: CombinedEntity[] = React.useMemo(
    () =>
      role.entity_names!.map((name, index) => ({
        name,
        id: role.entity_ids![index],
      })),
    [role.entity_names, role.entity_ids]
  );

  const isLastVisibleItem = React.useCallback(
    (index: number) => {
      return combinedEntities.length - numHiddenItems - 1 === index;
    },
    [combinedEntities.length, numHiddenItems]
  );

  const items = combinedEntities?.map(
    (entity: CombinedEntity, index: number) => (
      <Box
        key={entity.id}
        ref={(el: HTMLDivElement) => {
          itemRefs.current[index] = el;
        }}
        sx={{
          display: 'inline',
          marginRight: theme.tokens.spacing.S8,
          paddingRight:
            numHiddenItems > 0 && isLastVisibleItem(index)
              ? theme.tokens.spacing.S16
              : 0,
        }}
      >
        <Tooltip
          placement="top"
          title={entity.name.length > 30 ? entity.name : null}
        >
          <Chip
            data-testid="entities"
            deleteIcon={<CloseIcon data-testid="CloseIcon" />}
            label={
              entity.name.length > 30
                ? `${entity.name.slice(0, 20)}...`
                : entity.name
            }
            onDelete={() => onRemoveAssignment(entity, role)}
            sx={{
              backgroundColor:
                theme.name === 'light'
                  ? theme.tokens.color.Ultramarine[20]
                  : theme.tokens.color.Neutrals.Black,
              color: theme.tokens.alias.Content.Text.Primary.Default,
              '& .MuiChip-deleteIcon': {
                color: theme.tokens.alias.Content.Text.Primary.Default,
              },
              position: 'relative',
              '&::after': {
                content:
                  numHiddenItems > 0 && isLastVisibleItem(index)
                    ? '"..."'
                    : '""',
                position: 'absolute',
                top: 0,
                right: -16,
                width: 14,
              },
            }}
          />
        </Tooltip>
      </Box>
    )
  );

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        position: 'relative',
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          overflow: 'hidden',
          height: 24,
        }}
      >
        {items}
      </Box>
      {numHiddenItems > 0 && (
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor:
              theme.name === 'light'
                ? theme.tokens.color.Ultramarine[20]
                : theme.tokens.color.Neutrals.Black,
            borderRadius: 1,
            display: 'flex',
            height: '20px',
            maxWidth: 'max-content',
            padding: `${theme.tokens.spacing.S4} ${theme.tokens.spacing.S8}`,
          }}
        >
          <Tooltip placement="top" title="Click to View All Entities">
            <Button
              onClick={() => onButtonClick(role.name as EntityRoleType)}
              sx={{
                color: theme.tokens.alias.Content.Text.Primary.Default,
                font: theme.tokens.alias.Typography.Label.Regular.Xs,
                padding: 0,
              }}
            >
              +{numHiddenItems}
            </Button>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

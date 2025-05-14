import { Box, Button, Chip, CloseIcon, Tooltip } from '@linode/ui';
import { useTheme } from '@mui/material';
import * as React from 'react';

import { useCalculateHiddenItems } from '../../hooks/useCalculateHiddenItems';

import type { CombinedEntity, ExtendedRoleView } from '../../Shared/types';
import type { AccountAccessRole, EntityAccessRole } from '@linode/api-v4';

interface Props {
  onButtonClick: (roleName: AccountAccessRole | EntityAccessRole) => void;
  onRemoveAssignment: (entity: CombinedEntity, role: ExtendedRoleView) => void;
  role: ExtendedRoleView;
}

export const AssignedEntities = ({
  onButtonClick,
  onRemoveAssignment,
  role,
}: Props) => {
  const theme = useTheme();

  const { containerRef, itemRefs, visibleIndexes } = useCalculateHiddenItems(
    role.entity_names!
  );

  const hiddenCount = role.entity_names!.length - visibleIndexes.length;
  const combinedEntities: CombinedEntity[] = React.useMemo(
    () =>
      role.entity_names!.map((name, index) => ({
        name,
        id: role.entity_ids![index],
      })),
    [role.entity_names, role.entity_ids]
  );

  const items = combinedEntities?.map(
    (entity: CombinedEntity, index: number) => (
      <div
        key={entity.id}
        ref={(el: HTMLDivElement) => (itemRefs.current[index] = el)}
        style={{ display: 'inline-block', marginRight: 8 }}
      >
        <Chip
          data-testid="entities"
          deleteIcon={<CloseIcon data-testid="CloseIcon" />}
          label={
            entity.name.length > 20
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
          }}
        />
      </div>
    )
  );

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
      }}
    >
      <div
        ref={containerRef}
        style={{
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 1,
          display: '-webkit-box',
          overflow: 'hidden',
        }}
      >
        {items}
      </div>
      {hiddenCount > 0 && (
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
              onClick={() => onButtonClick(role.name as EntityAccessRole)}
              sx={{
                color: theme.tokens.alias.Content.Text.Primary.Default,
                font: theme.tokens.alias.Typography.Label.Regular.Xs,
                padding: 0,
              }}
            >
              +{hiddenCount}
            </Button>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

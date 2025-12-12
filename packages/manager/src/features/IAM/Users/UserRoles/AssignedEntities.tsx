import { Box, Button, Chip, CloseIcon, Tooltip } from '@linode/ui';
import { sortByString } from '@linode/utilities';
import { useTheme } from '@mui/material';
import * as React from 'react';

import { TruncatedList } from '../../Shared/TruncatedList';

import type { CombinedEntity, ExtendedRoleView } from '../../Shared/types';
import type { AccountRoleType, EntityRoleType } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  onButtonClick: (roleName: AccountRoleType | EntityRoleType) => void;
  onRemoveAssignment: (entity: CombinedEntity, role: ExtendedRoleView) => void;
  role: ExtendedRoleView;
}

export const AssignedEntities = ({
  onButtonClick,
  onRemoveAssignment,
  role,
  disabled,
}: Props) => {
  const theme = useTheme();

  const combinedEntities: CombinedEntity[] = React.useMemo(
    () =>
      role.entity_names!.map((name, index) => ({
        name,
        id: role.entity_ids![index],
      })),
    [role.entity_names, role.entity_ids]
  );

  const sortedEntities = combinedEntities?.sort((a, b) => {
    return sortByString(a.name, b.name, 'asc');
  });

  // We don't need to send all items to the TruncatedList component for performance reasons,
  // since past a certain count they will be hidden within the row.
  const MAX_ITEMS_TO_RENDER = 15;
  const entitiesToRender = sortedEntities.slice(0, MAX_ITEMS_TO_RENDER);
  const totalCount = sortedEntities.length;

  const items = entitiesToRender?.map((entity: CombinedEntity) => (
    <Box
      key={entity.id}
      sx={{
        display: 'inline',
        marginRight: theme.tokens.spacing.S8,
      }}
    >
      <Tooltip
        placement="top"
        title={entity.name.length > 30 ? entity.name : null}
      >
        <Chip
          data-testid="entities"
          deleteIcon={<CloseIcon data-testid="CloseIcon" />}
          disabled={disabled}
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
          }}
        />
      </Tooltip>
    </Box>
  ));

  return (
    <Box>
      <TruncatedList
        addEllipsis
        customOverflowButton={(numHiddenByTruncate) => {
          const numHiddenItems =
            totalCount <= MAX_ITEMS_TO_RENDER
              ? numHiddenByTruncate
              : totalCount - MAX_ITEMS_TO_RENDER + numHiddenByTruncate;

          return (
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
                position: 'relative',
                top: 2,
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
          );
        }}
        justifyOverflowButtonRight
        listContainerSx={{
          width: '100%',
          overflow: 'hidden',
          maxHeight: 24,
        }}
      >
        {items}
      </TruncatedList>
    </Box>
  );
};

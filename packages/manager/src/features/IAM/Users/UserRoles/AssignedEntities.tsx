import { Box, Button, Chip, Tooltip } from '@linode/ui';
import CloseIcon from '@mui/icons-material/Close';
import { debounce, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import {
  useAccountUserPermissions,
  useAccountUserPermissionsMutation,
} from 'src/queries/iam/iam';

import {
  deleteUserEntity,
  useCalculateHiddenItems,
} from '../../Shared/utilities';

import type {
  AccountAccessRole,
  EntityTypePermissions,
  EntityAccessRole,
} from '@linode/api-v4';

interface Props {
  entities: string[];
  entityIds: number[];
  entityType: EntityTypePermissions;
  onButtonClick: (roleName: AccountAccessRole | EntityAccessRole) => void;
  roleName: EntityAccessRole;
}

interface CombinedEntity {
  id: number;
  name: string;
}

export const AssignedEntities = ({
  entities,
  onButtonClick,
  roleName,
  entityType,
  entityIds,
}: Props) => {
  const theme = useTheme();
  const { username } = useParams<{ username: string }>();
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateUserPermissions } =
    useAccountUserPermissionsMutation(username);

  const { data: assignedRoles } = useAccountUserPermissions(username ?? '');

  const handleDelete = React.useCallback(
    async (entity: CombinedEntity) => {
      try {
        const updatedUserEntityRoles = deleteUserEntity(
          assignedRoles!.entity_access,
          roleName,
          entity.id,
          entityType
        );

        await updateUserPermissions({
          ...assignedRoles!,
          entity_access: updatedUserEntityRoles,
        });

        enqueueSnackbar('Entity removed', {
          variant: 'success',
        });
      } catch {
        enqueueSnackbar('Something went wrong. Try again later.', {
          variant: 'error',
        });
      }
    },
    [assignedRoles]
  );

  const { calculateHiddenItems, containerRef, itemRefs, numHiddenItems } =
    useCalculateHiddenItems(entities);

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

  const combinedEntities: CombinedEntity[] = React.useMemo(
    () =>
      entities.map((name, index) => ({
        name,
        id: entityIds[index],
      })),
    [entities, entityIds]
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
          deleteIcon={<CloseIcon />}
          key={entity.id}
          label={entity.name}
          onDelete={() => handleDelete(entity)}
          sx={{
            backgroundColor:
              theme.name === 'light'
                ? theme.tokens.color.Ultramarine[20]
                : theme.tokens.color.Neutrals.Black,
            color: theme.tokens.alias.Content.Text.Primary.Default,
          }}
        />
      </div>
    )
  );

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', maxWidth: '800px' }}>
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
      {numHiddenItems > 0 && (
        <Box
          sx={{
            aligIitems: 'center',
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
              onClick={() => onButtonClick(roleName)}
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

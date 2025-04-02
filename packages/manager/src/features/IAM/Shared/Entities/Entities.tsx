import { isEmpty } from '@linode/api-v4';
import { Autocomplete, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { useAccountEntities } from 'src/queries/entities/entities';

import { placeholderMap, transformedAccountEntities } from '../utilities';

import type { EntitiesOption } from '../utilities';
import type {
  AccountEntity,
  EntityType,
  EntityTypePermissions,
  IamAccessType,
} from '@linode/api-v4/lib/iam/types';

interface Props {
  access: IamAccessType;
  assignedEntities?: EntitiesOption[];
  type: EntityType | EntityTypePermissions;
}

export const Entities = ({ access, assignedEntities, type }: Props) => {
  const { data: entities } = useAccountEntities();

  const theme = useTheme();

  const [selectedEntities, setSelectedEntities] = React.useState<
    EntitiesOption[]
  >([]);

  React.useEffect(() => {
    if (!isEmpty(assignedEntities) && assignedEntities !== undefined) {
      setSelectedEntities(assignedEntities);
    }
  }, [assignedEntities]);

  const memoizedEntities = React.useMemo(() => {
    if (access !== 'entity_access' || !entities) {
      return [];
    }
    const typeEntities = getEntitiesByType(type, entities.data);
    return typeEntities ? transformedEntities(typeEntities) : [];
  }, [entities, access, type]);

  if (access === 'account_access') {
    return (
      <>
        <FormLabel>
          <Typography
            marginBottom={0.5}
            sx={{ marginTop: theme.tokens.spacing.S12 }}
            variant="inherit"
          >
            Entities
          </Typography>
        </FormLabel>
        <Typography>
          {type === 'account' ? 'All entities' : `All ${type}s`}
        </Typography>
      </>
    );
  }

  return (
    <Autocomplete
      renderOption={(props, option) => (
        <li {...props} key={option.label}>
          {option.label}
        </li>
      )}
      ListboxProps={{ sx: { overflowX: 'hidden' } }}
      getOptionLabel={(option) => option.label}
      label="Entities"
      multiple
      noMarginTop
      onChange={(_, value) => setSelectedEntities(value)}
      options={memoizedEntities}
      placeholder={selectedEntities.length ? ' ' : getPlaceholder(type)}
      readOnly={!isEmpty(assignedEntities)}
      sx={{ marginTop: theme.tokens.spacing.S12 }}
      value={selectedEntities}
    />
  );
};

const getPlaceholder = (type: EntityType | EntityTypePermissions): string =>
  placeholderMap[type] || 'Select';

const transformedEntities = (
  entities: { id: number; label: string }[]
): EntitiesOption[] => {
  return entities.map((entity) => ({
    label: entity.label,
    value: entity.id,
  }));
};

const getEntitiesByType = (
  roleEntityType: EntityType | EntityTypePermissions,
  entities: AccountEntity[]
): Pick<AccountEntity, 'id' | 'label'>[] | undefined => {
  const entitiesMap = transformedAccountEntities(entities);

  // Find the first matching entity by type
  return entitiesMap.get(roleEntityType as EntityType);
};

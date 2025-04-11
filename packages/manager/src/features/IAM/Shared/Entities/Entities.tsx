import { Autocomplete, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { useAccountEntities } from 'src/queries/entities/entities';

import { placeholderMap, transformedAccountEntities } from '../utilities';

import type { DrawerModes, EntitiesOption } from '../utilities';
import type {
  AccountEntity,
  EntityType,
  EntityTypePermissions,
  IamAccessType,
} from '@linode/api-v4/lib/iam/types';

interface Props {
  access: IamAccessType;
  errorText?: string;
  mode?: DrawerModes;
  onChange: (value: EntitiesOption[]) => void;
  type: EntityType | EntityTypePermissions;
  value: EntitiesOption[];
}

export const Entities = ({
  access,
  errorText,
  mode,
  onChange,
  type,
  value,
}: Props) => {
  const { data: entities } = useAccountEntities();
  const theme = useTheme();

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
      errorText={errorText}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      label="Entities"
      multiple
      noMarginTop
      onChange={(_, newValue) => {
        onChange(newValue || []);
      }}
      options={memoizedEntities}
      placeholder={value.length ? ' ' : getPlaceholder(type)}
      readOnly={mode === 'change-role'}
      sx={{ marginTop: theme.tokens.spacing.S12 }}
      value={value || []}
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

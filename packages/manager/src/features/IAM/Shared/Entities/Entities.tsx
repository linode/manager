import { Autocomplete, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { useAccountResources } from 'src/queries/resources/resources';

import { placeholderMap } from '../utilities';

import type {
  IamAccessType,
  IamAccountResource,
  Resource,
  ResourceType,
  ResourceTypePermissions,
} from '@linode/api-v4';

interface Props {
  access: IamAccessType;
  type: ResourceType | ResourceTypePermissions;
}

interface EntitiesOption {
  label: string;
  value: number;
}

export const Entities = ({ access, type }: Props) => {
  const { data: resources } = useAccountResources();
  const theme = useTheme();

  const [selectedEntities, setSelectedEntities] = React.useState<
    EntitiesOption[]
  >([]);

  const memoizedEntities = React.useMemo(() => {
    if (access !== 'resource_access' || !resources) {
      return [];
    }
    const typeResources = getEntitiesByType(type, resources);
    return typeResources ? transformedEntities(typeResources.resources) : [];
  }, [resources, access, type]);

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
      label="Entities"
      multiple
      noMarginTop
      onChange={(_, value) => setSelectedEntities(value)}
      options={memoizedEntities}
      placeholder={selectedEntities.length ? ' ' : getPlaceholder(type)}
      sx={{ marginTop: theme.tokens.spacing.S12 }}
      value={selectedEntities}
    />
  );
};

const getPlaceholder = (type: ResourceType | ResourceTypePermissions): string =>
  placeholderMap[type] || 'Select';

const transformedEntities = (entities: Resource[]): EntitiesOption[] => {
  return entities.map((entity) => ({
    label: entity.name,
    value: entity.id,
  }));
};

const getEntitiesByType = (
  roleResourceType: ResourceType | ResourceTypePermissions,
  resources: IamAccountResource
): IamAccountResource | undefined => {
  const entitiesArray: IamAccountResource[] = Object.values(resources);

  // Find the first matching entity by resource_type
  return entitiesArray.find(
    (item: IamAccountResource) => item.resource_type === roleResourceType
  );
};

import { Autocomplete, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import { useAccountResources } from 'src/queries/resources/resources';

import { placeholderMap } from '../utilities';

import type {
  IamAccessType,
  IamAccountResource,
  Resource,
  ResourceType,
  ResourceTypePermissions,
} from '@linode/api-v4';

type Props = {
  access: IamAccessType;
  type: ResourceType | ResourceTypePermissions;
};

type EntitiesOption = {
  label: string;
  value: number;
};

export const Entities = ({ access, type }: Props) => {
  const { data: resources } = useAccountResources();

  const [selectedEntities, setSelectedEntities] = React.useState<
    EntitiesOption[]
  >([]);

  const memoizedEntities = React.useMemo(() => {
    if (access === 'resource_access' && resources) {
      const entitiesByType = getEntitiesByType(type, resources);
      return entitiesByType
        ? transformedEntities(entitiesByType.resources)
        : [];
    }
    return [];
  }, [resources, access, type]);

  const placeholder = !!selectedEntities.length ? ' ' : getPlaceholder(type);

  return (
    <>
      <StyledTypography>Entities</StyledTypography>

      {access === 'account_access' ? (
        type === 'account' ? (
          <Typography sx={{ marginTop: 2 }}>All entities</Typography>
        ) : (
          <Typography sx={{ marginTop: 2 }}>All {type}s</Typography>
        )
      ) : (
        <Autocomplete
          renderOption={(props, option) => (
            <li {...props} key={option.label}>
              {option.label}
            </li>
          )}
          ListboxProps={{ sx: { overflowX: 'hidden' } }}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          label=""
          multiple
          onChange={(_, value) => setSelectedEntities(value)}
          options={memoizedEntities}
          placeholder={placeholder}
        />
      )}
    </>
  );
};

const getPlaceholder = (type: ResourceType | ResourceTypePermissions): string =>
  placeholderMap[type] || 'Select';

const transformedEntities = (entities: Resource[]): EntitiesOption[] => {
  return entities.map((entitie) => ({
    label: entitie.name,
    value: entitie.id,
  }));
};

const getEntitiesByType = (
  roleResourceType: ResourceType | ResourceTypePermissions,
  resources: IamAccountResource
): IamAccountResource | undefined => {
  const entitiesArray: IamAccountResource[] = Object.values(resources);

  // Find the first matching entitie by resource_type
  return entitiesArray.find(
    (item: IamAccountResource) => item.resource_type === roleResourceType
  );
};

const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  color: '#32363C',
  fontFamily: theme.font.bold,
  fontSize: '14px',
  marginBottom: `-${theme.spacing(2)}`,
}));

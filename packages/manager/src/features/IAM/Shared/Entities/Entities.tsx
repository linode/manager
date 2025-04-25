import { Autocomplete, Notice, TextField, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import { useAccountEntities } from 'src/queries/entities/entities';

import { type DrawerModes, getFormattedEntityType } from '../utilities';
import {
  getCreateLinkForEntityType,
  getEntitiesByType,
  getPlaceholder,
  mapEntitiesToOptions,
} from './utils';

import type { EntitiesOption } from '../types';
import type {
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
    return typeEntities ? mapEntitiesToOptions(typeEntities) : [];
  }, [entities, access, type]);

  if (access === 'account_access') {
    return (
      <>
        <FormLabel>
          <Typography
            sx={{
              marginTop: theme.tokens.spacing.S12,
              marginBottom: theme.tokens.spacing.S4,
            }}
            variant="inherit"
          >
            Entities
          </Typography>
        </FormLabel>
        <Typography>
          {type === 'account'
            ? 'All entities'
            : `All ${getFormattedEntityType(type)}s`}
        </Typography>
      </>
    );
  }

  return (
    <>
      <Autocomplete
        disabled={!memoizedEntities.length}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        label="Entities"
        multiple
        noMarginTop
        onChange={(_, newValue) => {
          onChange(newValue || []);
        }}
        options={memoizedEntities}
        placeholder={getPlaceholder(
          type,
          value.length,
          memoizedEntities.length
        )}
        readOnly={mode === 'change-role'}
        renderInput={(params) => (
          <TextField
            {...params}
            error={!!errorText}
            errorText={errorText}
            label="Entities"
            placeholder={getPlaceholder(
              type,
              value.length,
              memoizedEntities.length
            )}
          />
        )}
        sx={{ marginTop: theme.tokens.spacing.S12 }}
        value={value || []}
      />
      {!memoizedEntities.length && (
        <Notice spacingTop={8} variant="warning">
          <Typography fontSize="inherit">
            <Link to={getCreateLinkForEntityType(type)}>
              Create a {getFormattedEntityType(type)} Entity
            </Link>{' '}
            first or choose a different role to continue assignment.
          </Typography>
        </Notice>
      )}
    </>
  );
};

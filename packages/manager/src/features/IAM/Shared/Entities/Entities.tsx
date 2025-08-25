import { AccountEntity } from '@linode/api-v4';
import { Autocomplete, Notice, TextField, Typography } from '@linode/ui';
import { useDebouncedValue } from '@linode/utilities';
import { useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import {
  // useAccountEntities,
  useAccountEntitiesInfinityQuery,
} from 'src/queries/entities/entities';

import { getFormattedEntityType } from '../utilities';
import {
  getCreateLinkForEntityType,
  // getEntitiesByType,
  getPlaceholder,
  // mapEntitiesToOptions,
} from './utils';

import type { DrawerModes, EntitiesOption } from '../types';
import type { AccessType, IamAccessType } from '@linode/api-v4/lib/iam/types';

interface Props {
  access: IamAccessType;
  errorText?: string;
  mode?: DrawerModes;
  onChange: (value: EntitiesOption[]) => void;
  type: AccessType;
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
  const [entityNameInput, setEntityNameInput] = useState<string>('');
  const debouncedEntityNameInput = useDebouncedValue(entityNameInput);

  const entitySearchFilter = debouncedEntityNameInput
    ? {
        ['+and']: [
          { 'entity.type': type },
          { label: { ['+contains']: debouncedEntityNameInput } },
        ],
      }
    : { type };
  // const entitySearchFilter = debouncedEntityNameInput
  //   ? {
  //     ['+or']: [
  //       { label: { ['+contains']: debouncedEntityNameInput } },
  //     ],
  //   }
  //   : undefined;

  const {
    data: entities,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useAccountEntitiesInfinityQuery(
    {
      ...entitySearchFilter,
      '+order': 'asc',
      '+order_by': 'label',
    },
    true
  );

  const theme = useTheme();

  // const memoizedEntities = React.useMemo(() => {
  //   if (access !== 'entity_access' || !entities) {
  //     return [];
  //   }
  //   // const typeEntities = getEntitiesByType(type, entities.data);
  //   // return typeEntities ? mapEntitiesToOptions(typeEntities) : [];
  //   return entities;
  // }, [entities, access, type]);

  const getEntityOptions = useCallback(() => {
    const ents = entities?.pages.flatMap((page) => page.data);
    return ents?.map((ent: AccountEntity) => ({
      label: ent.label,
      value: ent.id,
    }));
  }, [entities]);

  const handleScroll = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget;
    if (
      listboxNode.scrollTop + listboxNode.clientHeight >=
        listboxNode.scrollHeight &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  };

  if (access === 'account_access') {
    return (
      <>
        <FormLabel>
          <Typography
            sx={{
              marginBottom: theme.tokens.spacing.S8,
              font: theme.tokens.alias.Typography.Label.Bold.S,
            }}
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
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        label="Entities"
        loading={isLoading || isFetching}
        multiple
        noMarginTop
        onChange={(_, newValue) => {
          onChange(newValue || []);
        }}
        onInputChange={(_, value) => {
          setEntityNameInput(value);
        }}
        options={getEntityOptions() || []}
        placeholder={getPlaceholder(type, value.length, 1)}
        readOnly={mode === 'change-role'}
        renderInput={(params) => (
          <TextField
            {...params}
            error={!!errorText}
            errorText={errorText}
            label="Entities"
            noMarginTop
            placeholder={getPlaceholder(type, value.length, 1)}
          />
        )}
        slotProps={{
          listbox: {
            onScroll: handleScroll,
          },
        }}
        sx={{
          marginTop: 0,
          '& .MuiChip-root': {
            padding: theme.tokens.spacing.S4,
            height: 'auto',
          },
          '& .MuiInputLabel-root': {
            color: theme.tokens.alias.Content.Text.Primary.Default,
          },
          '& .MuiChip-labelMedium': {
            textWrap: 'auto',
            height: 'auto',
          },
          '& .MuiAutocomplete-tag': {
            wordBreak: 'break-all',
          },
        }}
        value={value || []}
      />
      {!getEntityOptions()?.length && (
        <Notice spacingBottom={0} spacingTop={8} variant="warning">
          <Typography fontSize="inherit">
            <Link to={getCreateLinkForEntityType(type)}>
              Create {type === 'image' ? `an` : `a`}{' '}
              {getFormattedEntityType(type)} Entity{' '}
            </Link>{' '}
            first or choose a different role to continue assignment.
          </Typography>
        </Notice>
      )}
    </>
  );
};

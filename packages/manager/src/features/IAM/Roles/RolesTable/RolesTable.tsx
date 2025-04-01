import React, { useState } from 'react';
import { IamAccess, Roles } from '@linode/api-v4';
import { Box } from '@linode/ui';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { getAPIFilterFromQuery } from '@linode/search';
import { useAccountPermissions } from 'src/queries/iam/iam';

export interface UiRole {
  name: string;
  type: string;
  description: string;
  permissions: string[];
}

export const RolesTable = () => {
  const [query, setQuery] = useState<string>();

  const { error: searchError } = getAPIFilterFromQuery(query, {
    searchableFieldsWithoutOperator: ['name', 'type', 'description'],
  });

  const { data: roles, error, isFetching, isLoading } = useAccountPermissions();

  if (!!error || isLoading) {
    // do something here?
  }

  const uiRoles = React.useMemo(() => {
    if (!roles) {
      return [];
    }

    const uiRoles: UiRole[] = [];
    roles.account_access.forEach((iamAccess: IamAccess[]) => {
      iamAccess.roles.forEach((r: Roles) => {
        uiRoles.push({
          name: snakeToCamel(r.name),
          type: 'Account access',
          description: r.description,
          permissions: r.permissions,
        });
      });
    });

    roles.resource_access.forEach((iamAccess: IamAccess[]) => {
      iamAccess.roles.forEach((r: Roles) => {
        uiRoles.push({
          name: snakeToCamel(r.name),
          type: 'Entity access',
          description: r.description,
          permissions: r.permissions,
        });
      });
    });

    return uiRoles;
  }, [roles]);

  return (
    <>
        <Box
          sx={(theme) => ({
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(2),
          })}
        >
          <DebouncedSearchTextField
            clearable
            debounceTime={250}
            errorText={searchError?.message}
            hideLabel
            isSearching={isFetching}
            label="Filter"
            onSearch={setQuery}
            placeholder="Filter"
            sx={{ width: 320 }}
            value=""
          />
        </Box>

        <RolesTableCollapsible uiRoles={uiRoles} />
        <RolesTableSelectable uiRoles={uiRoles} />
    </>
  );
};

const snakeToCamel = (str) => str;
// str.toLowerCase()
//   .replace(/([_][a-z])/g, group =>
//     group.toUpperCase().replace('_', '')
// );

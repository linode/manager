import {
  ActionsPanel,
  Autocomplete,
  FormControl,
  FormHelperText,
  Notice,
  Radio,
  TextField,
} from '@linode/ui';
import { useFormik } from 'formik';
import { DateTime } from 'luxon';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { AccessCell } from 'src/features/ObjectStorage/AccessKeyLanding/AccessCell';
import { VPC_READ_ONLY_TOOLTIP } from 'src/features/VPCs/constants';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import {
  useProfile,
  useCreatePersonalAccessTokenMutation,
} from '@linode/queries';
import { getErrorMap } from 'src/utilities/errorUtils';

import {
  StyledAccessCell,
  StyledPermissionsCell,
  StyledPermsTable,
  StyledSelectAllPermissionsCell,
  StyledSelectCell,
} from './APITokenDrawer.styles';
import {
  allScopesAreTheSame,
  basePermNameMap,
  hasAccessBeenSelectedForAllScopes,
  levelMap,
  permTuplesToScopeString,
  scopeStringToPermTuples,
} from './utils';

import type { Permission } from './utils';

type Expiry = [string, string];

export const genExpiryTups = (): Expiry[] => {
  return [
    [
      'In 6 months',
      DateTime.local()
        .plus({ months: 6 })
        .startOf('day')
        .toFormat(ISO_DATETIME_NO_TZ_FORMAT),
    ],
    [
      'In 3 months',
      DateTime.local()
        .plus({ months: 3 })
        .startOf('day')
        .toFormat(ISO_DATETIME_NO_TZ_FORMAT),
    ],
    [
      'In 1 month',
      DateTime.local()
        .plus({ months: 1 })
        .startOf('day')
        .toFormat(ISO_DATETIME_NO_TZ_FORMAT),
    ],
    [
      'Never',
      DateTime.local()
        .plus({ years: 200 })
        .startOf('day')
        .toFormat(ISO_DATETIME_NO_TZ_FORMAT),
    ],
  ];
};

export interface ExcludedScope {
  defaultAccessLevel: number;
  invalidAccessLevels: number[];
  name: string;
}

interface RadioButton extends HTMLInputElement {
  name: string;
}

interface Props {
  onClose: () => void;
  open: boolean;
  showSecret: (token: string) => void;
}

export const CreateAPITokenDrawer = (props: Props) => {
  const expiryTups = genExpiryTups();
  const { onClose, open, showSecret } = props;

  const initialValues = {
    expiry: expiryTups[0][1],
    label: '',
    scopes: scopeStringToPermTuples('', true),
  };

  const { data: profile } = useProfile();

  const {
    error,
    isPending,
    mutateAsync: createPersonalAccessToken,
  } = useCreatePersonalAccessTokenMutation();

  const isChildAccountAccessRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'child_account_access',
  });

  const form = useFormik<{
    expiry: string;
    label: string;
    scopes: Permission[];
  }>({
    initialValues,
    async onSubmit(values) {
      const { token } = await createPersonalAccessToken({
        expiry: values.expiry,
        label: values.label,
        scopes: permTuplesToScopeString(values.scopes),
      });
      onClose();
      showSecret(token ?? 'Secret not available');
    },
  });

  React.useEffect(() => {
    if (open) {
      form.resetForm({ values: initialValues });
    }
  }, [open]);

  const handleScopeChange = (e: React.SyntheticEvent<RadioButton>): void => {
    const newScopes = form.values.scopes;
    const targetIndex = newScopes.findIndex(
      (scopeTup: Permission) => scopeTup[0] === e.currentTarget.name
    );
    if (targetIndex !== undefined) {
      newScopes[targetIndex][1] = +e.currentTarget.value;
    }
    form.setFieldValue('scopes', newScopes);
  };

  const handleSelectAllScopes = (
    e: React.SyntheticEvent<RadioButton>
  ): void => {
    const value = +e.currentTarget.value;
    const newScopes = form.values.scopes.map(
      (scope): Permission => {
        // Check the excluded scopes object to see if the current scope will have its own defaults.
        const indexOfExcludedScope = excludedScopesFromSelectAll.findIndex(
          (excludedScope) =>
            excludedScope.name === scope[0] &&
            excludedScope.invalidAccessLevels.includes(value)
        );

        // Set an excluded scope based on its default access level, not the given Select All value.
        if (indexOfExcludedScope >= 0) {
          return [
            scope[0],
            excludedScopesFromSelectAll[indexOfExcludedScope]
              .defaultAccessLevel,
          ];
        }
        return [scope[0], value];
      }
    );
    form.setFieldValue('scopes', newScopes);
  };

  // Permission scopes with a different default when Selecting All for the specified access level.
  const excludedScopesFromSelectAll: ExcludedScope[] = [
    {
      defaultAccessLevel: levelMap.none,
      invalidAccessLevels: [levelMap.read_only],
      name: 'vpc',
    },
  ];

  const indexOfColumnWhereAllAreSelected = allScopesAreTheSame(
    form.values.scopes,
    excludedScopesFromSelectAll
  );

  const errorMap = getErrorMap(['label', 'scopes'], error);

  const expiryList = expiryTups.map((expiryTup: Expiry) => {
    return { label: expiryTup[0], value: expiryTup[1] };
  });

  // Filter permissions for all users except parent user accounts.
  const allPermissions = form.values.scopes;

  // Visually hide the "Child Account Access" permission even though it's still part of the base perms.
  const hideChildAccountAccessScope =
    profile?.user_type !== 'parent' || isChildAccountAccessRestricted;

  return (
    <Drawer onClose={onClose} open={open} title="Add Personal Access Token">
      {errorMap.none && <Notice text={errorMap.none} variant="error" />}
      <TextField
        errorText={errorMap.label}
        label="Label"
        name="label"
        onChange={form.handleChange}
        value={form.values.label}
      />
      <FormControl data-testid="expiry-select">
        <Autocomplete
          onChange={(_, selected) =>
            form.setFieldValue('expiry', selected.value)
          }
          slotProps={{
            popper: {
              sx: {
                '&& .MuiAutocomplete-listbox': {
                  padding: 0,
                },
              },
            },
          }}
          sx={{
            '&& .MuiAutocomplete-inputRoot': {
              paddingLeft: 1,
              paddingRight: 0,
            },
            '&& .MuiInput-input': {
              padding: '0px 2px',
            },
          }}
          disableClearable
          label="Expiry"
          options={expiryList}
          value={expiryList.find((item) => item.value === form.values.expiry)}
        />
      </FormControl>
      <StyledPermsTable
        aria-label="Personal Access Token Permissions"
        spacingBottom={16}
        spacingTop={24}
      >
        <TableHead>
          <TableRow>
            <TableCell data-qa-perm-access>Access</TableCell>
            <TableCell data-qa-perm-no-access style={{ textAlign: 'center' }}>
              No Access
            </TableCell>
            <TableCell data-qa-perm-read noWrap style={{ textAlign: 'center' }}>
              Read Only
            </TableCell>
            <TableCell data-qa-perm-rw style={{ textAlign: 'left' }}>
              Read/Write
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow data-qa-row="Select All">
            <StyledSelectCell padding="checkbox">Select All</StyledSelectCell>
            <StyledSelectAllPermissionsCell padding="checkbox">
              <Radio
                inputProps={{
                  'aria-label': 'Select no access for all',
                }}
                checked={indexOfColumnWhereAllAreSelected === 0}
                data-qa-perm-no-access-radio
                data-testid="set-all-no-access"
                name="Select All"
                onChange={handleSelectAllScopes}
                value="0"
              />
            </StyledSelectAllPermissionsCell>
            <StyledSelectAllPermissionsCell padding="checkbox">
              <Radio
                inputProps={{
                  'aria-label': 'Select read-only for all',
                }}
                checked={indexOfColumnWhereAllAreSelected === 1}
                data-qa-perm-read-radio
                data-testid="set-all-read"
                name="Select All"
                onChange={handleSelectAllScopes}
                value="1"
              />
            </StyledSelectAllPermissionsCell>
            <StyledSelectAllPermissionsCell padding="checkbox">
              <Radio
                inputProps={{
                  'aria-label': 'Select read/write for all',
                }}
                checked={indexOfColumnWhereAllAreSelected === 2}
                data-qa-perm-rw-radio
                data-testid="set-all-write"
                name="Select All"
                onChange={handleSelectAllScopes}
                value="2"
              />
            </StyledSelectAllPermissionsCell>
          </TableRow>
          {allPermissions.map((scopeTup) => {
            if (
              !basePermNameMap[scopeTup[0]] ||
              (hideChildAccountAccessScope &&
                basePermNameMap[scopeTup[0]] === 'Child Account Access')
            ) {
              return null;
            }

            const scopeIsForVPC = scopeTup[0] === 'vpc';

            return (
              <TableRow
                data-qa-row={basePermNameMap[scopeTup[0]]}
                key={scopeTup[0]}
              >
                <StyledAccessCell padding="checkbox">
                  {basePermNameMap[scopeTup[0]]}
                </StyledAccessCell>
                <StyledPermissionsCell padding="checkbox">
                  <AccessCell
                    active={scopeTup[1] === 0}
                    disabled={false}
                    onChange={handleScopeChange}
                    scope="0"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={false}
                  />
                </StyledPermissionsCell>
                <StyledPermissionsCell padding="checkbox">
                  <AccessCell
                    tooltipText={
                      scopeIsForVPC ? VPC_READ_ONLY_TOOLTIP : undefined
                    }
                    active={scopeTup[1] === 1}
                    disabled={scopeIsForVPC} // "Read Only" is not a valid scope for VPC
                    onChange={handleScopeChange}
                    scope="1"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={false}
                  />
                </StyledPermissionsCell>
                <StyledPermissionsCell padding="checkbox">
                  <AccessCell
                    active={scopeTup[1] === 2}
                    disabled={false}
                    onChange={handleScopeChange}
                    scope="2"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={false}
                  />
                </StyledPermissionsCell>
              </TableRow>
            );
          })}
        </TableBody>
      </StyledPermsTable>
      {errorMap.scopes && (
        <FormHelperText error>{errorMap.scopes}</FormHelperText>
      )}
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'create-button',
          disabled: !hasAccessBeenSelectedForAllScopes(
            form.values.scopes,
            hideChildAccountAccessScope ? ['child_account'] : []
          ),
          label: 'Create Token',
          loading: isPending,
          onClick: () => form.handleSubmit(),
        }}
        secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
      />
    </Drawer>
  );
};

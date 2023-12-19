import { useFormik } from 'formik';
import { DateTime } from 'luxon';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { FormControl } from 'src/components/FormControl';
import { FormHelperText } from 'src/components/FormHelperText';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TextField } from 'src/components/TextField';
import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { AccessCell } from 'src/features/ObjectStorage/AccessKeyLanding/AccessCell';
import { useFlags } from 'src/hooks/useFlags';
import { useAccountUser } from 'src/queries/accountUsers';
import { useProfile } from 'src/queries/profile';
import { useCreatePersonalAccessTokenMutation } from 'src/queries/tokens';
import { getErrorMap } from 'src/utilities/errorUtils';

import {
  StyledAccessCell,
  StyledPermissionsCell,
  StyledPermsTable,
  StyledSelectCell,
} from './APITokenDrawer.styles';
import {
  Permission,
  allScopesAreTheSame,
  basePermNameMap,
  permTuplesToScopeString,
  scopeStringToPermTuples,
} from './utils';

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

  const flags = useFlags();

  const initialValues = {
    expiry: expiryTups[0][1],
    label: '',
    scopes: scopeStringToPermTuples(flags.parentChildAccountAccess ? '' : '*'),
  };

  const { data: profile } = useProfile();
  const { data: user } = useAccountUser(profile?.username ?? '');

  const {
    error,
    isLoading,
    mutateAsync: createPersonalAccessToken,
  } = useCreatePersonalAccessTokenMutation();

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
      (scope): Permission => [scope[0], value]
    );
    form.setFieldValue('scopes', newScopes);
  };

  const handleExpiryChange = (e: Item<string>) => {
    form.setFieldValue('expiry', e.value);
  };

  const indexOfColumnWhereAllAreSelected = allScopesAreTheSame(
    form.values.scopes
  );

  const errorMap = getErrorMap(['label', 'scopes'], error);

  const expiryList = expiryTups.map((expiryTup: Expiry) => {
    return { label: expiryTup[0], value: expiryTup[1] };
  });

  // Filter permissions for all users except parent user accounts.
  const allPermissions = form.values.scopes;
  const showFilteredPermissions =
    (flags.parentChildAccountAccess && user?.user_type !== 'parent') ||
    Boolean(!flags.parentChildAccountAccess);
  const filteredPermissions = allPermissions.filter(
    (scopeTup) => basePermNameMap[scopeTup[0]] !== 'Child Account Access'
  );

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
        <Select
          isClearable={false}
          label="Expiry"
          name="expiry"
          onChange={handleExpiryChange}
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
            <TableCell data-qa-perm-none style={{ textAlign: 'center' }}>
              None
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
            <StyledSelectCell padding="checkbox" parentColumn="Access">
              Select All
            </StyledSelectCell>
            <StyledPermissionsCell padding="checkbox" parentColumn="None">
              <Radio
                inputProps={{
                  'aria-label': 'Select none for all',
                }}
                checked={indexOfColumnWhereAllAreSelected === 0}
                data-qa-perm-none-radio
                data-testid="set-all-none"
                name="Select All"
                onChange={handleSelectAllScopes}
                value="0"
              />
            </StyledPermissionsCell>
            <StyledPermissionsCell padding="checkbox" parentColumn="Read Only">
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
            </StyledPermissionsCell>
            <StyledPermissionsCell padding="checkbox" parentColumn="Read/Write">
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
            </StyledPermissionsCell>
          </TableRow>
          {(showFilteredPermissions ? filteredPermissions : allPermissions).map(
            (scopeTup) => {
              if (!basePermNameMap[scopeTup[0]]) {
                return null;
              }
              return (
                <TableRow
                  data-qa-row={basePermNameMap[scopeTup[0]]}
                  key={scopeTup[0]}
                >
                  <StyledAccessCell padding="checkbox" parentColumn="Access">
                    {basePermNameMap[scopeTup[0]]}
                  </StyledAccessCell>
                  <StyledPermissionsCell padding="checkbox" parentColumn="None">
                    <AccessCell
                      active={scopeTup[1] === 0}
                      disabled={false}
                      onChange={handleScopeChange}
                      scope="0"
                      scopeDisplay={scopeTup[0]}
                      viewOnly={false}
                    />
                  </StyledPermissionsCell>
                  <StyledPermissionsCell
                    padding="checkbox"
                    parentColumn="Read Only"
                  >
                    <AccessCell
                      active={scopeTup[1] === 1}
                      disabled={false}
                      onChange={handleScopeChange}
                      scope="1"
                      scopeDisplay={scopeTup[0]}
                      viewOnly={false}
                    />
                  </StyledPermissionsCell>
                  <StyledPermissionsCell
                    padding="checkbox"
                    parentColumn="Read/Write"
                  >
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
            }
          )}
        </TableBody>
      </StyledPermsTable>
      {errorMap.scopes && (
        <FormHelperText error>{errorMap.scopes}</FormHelperText>
      )}
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'create-button',
          label: 'Create Token',
          loading: isLoading,
          onClick: () => form.handleSubmit(),
        }}
        secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
      />
    </Drawer>
  );
};

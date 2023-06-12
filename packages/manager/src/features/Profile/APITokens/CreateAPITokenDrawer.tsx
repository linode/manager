import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import TextField from 'src/components/TextField';
import { DateTime } from 'luxon';
import { getErrorMap } from 'src/utilities/errorUtils';
import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { AccessCell } from 'src/features/ObjectStorage/AccessKeyLanding/AccessCell';
import { useCreatePersonalAccessTokenMutation } from 'src/queries/tokens';
import { useFormik } from 'formik';
import {
  StyledAccessCell,
  StyledPermissionsCell,
  StyledPermsTable,
  StyledSelectCell,
} from './APITokenDrawer.styles';
import {
  Permission,
  permTuplesToScopeString,
  scopeStringToPermTuples,
  allScopesAreTheSame,
  basePermNameMap,
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
  open: boolean;
  onClose: () => void;
  showSecret: (token: string) => void;
}

export const CreateAPITokenDrawer = (props: Props) => {
  const expiryTups = genExpiryTups();
  const { open, onClose, showSecret } = props;

  const initialValues = {
    scopes: scopeStringToPermTuples('*'),
    label: '',
    expiry: expiryTups[0][1],
  };

  const {
    mutateAsync: createPersonalAccessToken,
    isLoading,
    error,
  } = useCreatePersonalAccessTokenMutation();

  const form = useFormik<{
    scopes: Permission[];
    label: string;
    expiry: string;
  }>({
    initialValues,
    async onSubmit(values) {
      const { token } = await createPersonalAccessToken({
        label: values.label,
        scopes: permTuplesToScopeString(values.scopes),
        expiry: values.expiry,
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

  return (
    <Drawer title="Add Personal Access Token" open={open} onClose={onClose}>
      {errorMap.none && <Notice error text={errorMap.none} />}
      <TextField
        errorText={errorMap.label}
        value={form.values.label}
        label="Label"
        name="label"
        onChange={form.handleChange}
      />
      <FormControl data-testid="expiry-select">
        <Select
          options={expiryList}
          onChange={handleExpiryChange}
          value={expiryList.find((item) => item.value === form.values.expiry)}
          name="expiry"
          label="Expiry"
          isClearable={false}
        />
      </FormControl>
      <StyledPermsTable
        aria-label="Personal Access Token Permissions"
        spacingTop={24}
        spacingBottom={16}
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
            <StyledSelectCell parentColumn="Access" padding="checkbox">
              Select All
            </StyledSelectCell>
            <StyledPermissionsCell parentColumn="None" padding="checkbox">
              <Radio
                name="Select All"
                checked={indexOfColumnWhereAllAreSelected === 0}
                data-testid="set-all-none"
                value="0"
                onChange={handleSelectAllScopes}
                data-qa-perm-none-radio
                inputProps={{
                  'aria-label': 'Select none for all',
                }}
              />
            </StyledPermissionsCell>
            <StyledPermissionsCell parentColumn="Read Only" padding="checkbox">
              <Radio
                name="Select All"
                checked={indexOfColumnWhereAllAreSelected === 1}
                value="1"
                data-testid="set-all-read"
                onChange={handleSelectAllScopes}
                data-qa-perm-read-radio
                inputProps={{
                  'aria-label': 'Select read-only for all',
                }}
              />
            </StyledPermissionsCell>
            <StyledPermissionsCell parentColumn="Read/Write" padding="checkbox">
              <Radio
                name="Select All"
                checked={indexOfColumnWhereAllAreSelected === 2}
                data-testid="set-all-write"
                value="2"
                onChange={handleSelectAllScopes}
                data-qa-perm-rw-radio
                inputProps={{
                  'aria-label': 'Select read/write for all',
                }}
              />
            </StyledPermissionsCell>
          </TableRow>
          {form.values.scopes.map((scopeTup) => {
            if (!basePermNameMap[scopeTup[0]]) {
              return null;
            }
            return (
              <TableRow
                key={scopeTup[0]}
                data-qa-row={basePermNameMap[scopeTup[0]]}
              >
                <StyledAccessCell parentColumn="Access" padding="checkbox">
                  {basePermNameMap[scopeTup[0]]}
                </StyledAccessCell>
                <StyledPermissionsCell parentColumn="None" padding="checkbox">
                  <AccessCell
                    active={scopeTup[1] === 0}
                    scope="0"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={false}
                    disabled={false}
                    onChange={handleScopeChange}
                  />
                </StyledPermissionsCell>
                <StyledPermissionsCell
                  parentColumn="Read Only"
                  padding="checkbox"
                >
                  <AccessCell
                    active={scopeTup[1] === 1}
                    scope="1"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={false}
                    disabled={false}
                    onChange={handleScopeChange}
                  />
                </StyledPermissionsCell>
                <StyledPermissionsCell
                  parentColumn="Read/Write"
                  padding="checkbox"
                >
                  <AccessCell
                    active={scopeTup[1] === 2}
                    scope="2"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={false}
                    disabled={false}
                    onChange={handleScopeChange}
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
      <ActionsPanel>
        <Button buttonType="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          loading={isLoading}
          onClick={() => form.handleSubmit()}
          data-testid="create-button"
        >
          Create Token
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

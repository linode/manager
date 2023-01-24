import { APIError } from '@linode/api-v4/lib/types';
import { DateTime } from 'luxon';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TextField from 'src/components/TextField';
import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import AccessCell from 'src/features/ObjectStorage/AccessKeyLanding/AccessCell';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  Permission,
  permTuplesToScopeString,
  scopeStringToPermTuples,
  allScopesAreTheSame,
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

const useStyles = makeStyles((theme: Theme) => ({
  permsTable: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(),
  },
  selectCell: {
    fontFamily: 'LatoWebBold', // we keep this bold at all times
    fontSize: '.9rem',
  },
  accessCell: {
    width: '31%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  noneCell: {
    width: '23%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
    textAlign: 'center',
  },
  readOnlyCell: {
    width: '23%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
    textAlign: 'center',
  },
  readWritecell: {
    width: '23%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
    textAlign: 'center',
  },
}));

export type DrawerMode = 'view' | 'edit' | 'create';

interface RadioButton extends HTMLInputElement {
  name: string;
}

interface Props {
  label?: string;
  scopes?: string;
  expiry?: string | null;
  submitting?: boolean;
  perms: string[];
  permNameMap: Record<string, string>;
  errors?: APIError[];
  id?: number;
  open: boolean;
  mode: string;
  closeDrawer: () => void;
  onChange: (key: string, value: string) => void;
  /* Due to the amount of transformation that needs to be done here, scopes is
     an uncontrolled input that's sent back in the submit handler */
  onCreate: (scopes: string) => void;
  onEdit: () => void;
}

export const APITokenDrawer = (props: Props) => {
  const classes = useStyles();
  const {
    label,
    expiry,
    errors,
    open,
    mode,
    closeDrawer,
    onCreate,
    onEdit,
    submitting,
    permNameMap,
  } = props;

  const [scopes, setScopes] = React.useState<Permission[]>(
    scopeStringToPermTuples(props.scopes || '', props.perms)
  );

  const expiryTups = genExpiryTups();

  const [selectAllSelectedScope, setSelectAllSelectedScope] = React.useState<
    number | null
  >(
    allScopesAreTheSame(
      scopeStringToPermTuples(props.scopes || '', props.perms)
    )
  );

  const handleScopeChange = (e: React.SyntheticEvent<RadioButton>): void => {
    const scopeTups = scopes;
    const targetIndex = scopeTups.findIndex(
      (scopeTup: Permission) => scopeTup[0] === e.currentTarget.name
    );
    if (targetIndex !== undefined) {
      scopeTups[targetIndex][1] = +e.currentTarget.value;
    }
    setScopes(scopeTups);
  };

  const handleSelectAllScopes = (
    e: React.SyntheticEvent<RadioButton>
  ): void => {
    const value = +e.currentTarget.value;
    setScopes((prev) => prev.map((scope): Permission => [scope[0], value]));
    setSelectAllSelectedScope(value);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange('label', e.target.value);
  };

  const handleExpiryChange = (e: Item<string>) => {
    props.onChange('expiry', e.value);
  };

  // return whether all scopes selected in the create token flow are the same
  const allScopesIdentical = () => {
    return scopes.every((scope) => scope[1] === selectAllSelectedScope);
  };

  const renderPermsTable = () => {
    return (
      <Table
        aria-label="Personal Access Token Permissions"
        className={classes.permsTable}
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
          {mode === 'create' && (
            <TableRow data-qa-row="Select All">
              <TableCell
                parentColumn="Access"
                padding="checkbox"
                className={classes.selectCell}
              >
                Select All
              </TableCell>
              <TableCell
                parentColumn="None"
                padding="checkbox"
                className={classes.noneCell}
              >
                <Radio
                  name="Select All"
                  checked={selectAllSelectedScope === 0 && allScopesIdentical()}
                  data-testid="set-all-none"
                  value="0"
                  onChange={handleSelectAllScopes}
                  data-qa-perm-none-radio
                  inputProps={{
                    'aria-label': 'Select none for all',
                  }}
                />
              </TableCell>
              <TableCell
                parentColumn="Read Only"
                padding="checkbox"
                className={classes.readOnlyCell}
              >
                <Radio
                  name="Select All"
                  checked={selectAllSelectedScope === 1 && allScopesIdentical()}
                  value="1"
                  data-testid="set-all-read"
                  onChange={handleSelectAllScopes}
                  data-qa-perm-read-radio
                  inputProps={{
                    'aria-label': 'Select read-only for all',
                  }}
                />
              </TableCell>
              <TableCell
                parentColumn="Read/Write"
                padding="checkbox"
                className={classes.readWritecell}
              >
                <Radio
                  name="Select All"
                  checked={selectAllSelectedScope === 2 && allScopesIdentical()}
                  data-testid="set-all-write"
                  value="2"
                  onChange={handleSelectAllScopes}
                  data-qa-perm-rw-radio
                  inputProps={{
                    'aria-label': 'Select read/write for all',
                  }}
                />
              </TableCell>
            </TableRow>
          )}
          {scopes.map((scopeTup) => {
            if (!permNameMap[scopeTup[0]]) {
              return null;
            }
            return (
              <TableRow
                key={scopeTup[0]}
                data-qa-row={permNameMap[scopeTup[0]]}
              >
                <TableCell
                  parentColumn="Access"
                  padding="checkbox"
                  className={classes.accessCell}
                >
                  {permNameMap[scopeTup[0]]}
                </TableCell>
                <TableCell
                  parentColumn="None"
                  padding="checkbox"
                  className={classes.noneCell}
                >
                  <AccessCell
                    active={scopeTup[1] === 0}
                    scope="0"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={mode === 'view'}
                    disabled={false}
                    onChange={handleScopeChange}
                  />
                </TableCell>
                <TableCell
                  parentColumn="Read Only"
                  padding="checkbox"
                  className={classes.readOnlyCell}
                >
                  <AccessCell
                    active={scopeTup[1] === 1}
                    scope="1"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={mode === 'view'}
                    disabled={false}
                    onChange={handleScopeChange}
                  />
                </TableCell>
                <TableCell
                  parentColumn="Read/Write"
                  padding="checkbox"
                  className={classes.readWritecell}
                >
                  <AccessCell
                    active={scopeTup[1] === 2}
                    scope="2"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={mode === 'view'}
                    disabled={false}
                    onChange={handleScopeChange}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const errorMap = getErrorMap(['label', 'scopes'], errors);

  const expiryList = expiryTups.map((expiryTup: Expiry) => {
    return { label: expiryTup[0], value: expiryTup[1] };
  });

  const defaultExpiry = expiryList.find((eachOption) => {
    return eachOption.value === expiry;
  });

  return (
    <Drawer
      title={
        (mode === 'view' && label) ||
        (mode === 'create' && 'Add Personal Access Token') ||
        (mode === 'edit' && 'Edit Personal Access Token') ||
        ''
      }
      open={open}
      onClose={closeDrawer}
    >
      {errorMap.none && <Notice error text={errorMap.none} />}
      {(mode === 'create' || mode === 'edit') && (
        <TextField
          errorText={errorMap.label}
          value={label || ''}
          label="Label"
          onChange={handleLabelChange}
          data-qa-add-label
        />
      )}

      {mode === 'create' && (
        <FormControl data-testid="expiry-select">
          <Select
            options={expiryList}
            defaultValue={defaultExpiry || expiryTups[0][1]}
            onChange={handleExpiryChange}
            name="expiry"
            labelId="expiry"
            label="Expiry"
            isClearable={false}
          />
        </FormControl>
      )}
      {mode === 'view' && (
        <Typography>This application has access to your:</Typography>
      )}
      {(mode === 'view' || mode === 'create') && renderPermsTable()}
      {errorMap.scopes && (
        <FormHelperText error>{errorMap.scopes}</FormHelperText>
      )}
      <ActionsPanel>
        {(mode === 'create' || mode === 'edit') && [
          <Button
            buttonType="secondary"
            key="cancel"
            onClick={closeDrawer}
            data-qa-cancel
          >
            Cancel
          </Button>,
          <Button
            key="create"
            buttonType="primary"
            loading={submitting}
            onClick={
              (mode as string) === 'create'
                ? () => onCreate(permTuplesToScopeString(scopes, props.perms))
                : () => onEdit()
            }
            data-qa-submit
          >
            {(mode as string) === 'create' ? 'Create Token' : 'Save Token'}
          </Button>,
        ]}
      </ActionsPanel>
    </Drawer>
  );
};

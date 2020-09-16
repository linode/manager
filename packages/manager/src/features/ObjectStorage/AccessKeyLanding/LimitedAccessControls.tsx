import { AccessType, Scope } from '@linode/api-v4/lib/object-storage/types';
import { update } from 'ramda';
import * as React from 'react';
import Toggle from 'src/components/Toggle';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Radio from 'src/components/Radio';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';

const useStyles = makeStyles(() => ({
  clusterCell: {
    width: '25%'
  },
  bucketCell: {
    width: '35%'
  },
  radioCell: {
    width: '15%'
  }
}));

interface Props {
  mode: 'creating' | 'editing';
  checked: boolean;
  bucket_access: Scope[] | null;
  updateScopes: (newScopes: Scope[]) => void;
  handleToggle: () => void;
}

export const getUpdatedScopes = (
  oldScopes: Scope[],
  newScope: Scope
): Scope[] => {
  // Cluster and bucket together form a primary key
  const scopeToUpdate = oldScopes.findIndex(
    thisScope =>
      thisScope.bucket_name === newScope.bucket_name &&
      thisScope.cluster === newScope.cluster
  );
  if (scopeToUpdate < 0) {
    return oldScopes;
  }
  return update(scopeToUpdate, newScope, oldScopes);
};

export const SCOPES: Record<string, AccessType> = {
  none: 'none',
  read: 'read_only',
  write: 'read_write'
};

export const LimitedAccessControls: React.FC<Props> = props => {
  const { checked, handleToggle, ...rest } = props;
  return (
    <>
      <FormControlLabel
        control={
          <Toggle
            onChange={handleToggle}
            checked={checked}
            data-testid="limited-permissions-toggle"
          />
        }
        label={'Limited Access'}
      />
      <AccessTable {...rest} />
    </>
  );
};

export default React.memo(LimitedAccessControls);

interface TableProps {
  mode: 'creating' | 'editing';
  bucket_access: Scope[] | null;
  updateScopes: (newScopes: Scope[]) => void;
}

const AccessTable: React.FC<TableProps> = props => {
  const { mode, bucket_access, updateScopes } = props;

  const classes = useStyles();

  if (!bucket_access) {
    return null;
  }

  const updateSingleScope = (newScope: Scope) => {
    const newScopes = getUpdatedScopes(bucket_access, newScope);
    updateScopes(newScopes);
  };

  const updateAllScopes = (accessType: AccessType) => {
    const newScopes = bucket_access.map(thisScope => ({
      ...thisScope,
      permissions: accessType
    }));
    updateScopes(newScopes);
  };

  const allScopesEqual = (accessType: AccessType) => {
    return bucket_access.every(
      thisScope => thisScope.permissions === accessType
    );
  };

  return (
    <Table aria-label="Personal Access Token Permissions" spacingTop={24}>
      <TableHead>
        <TableRow>
          <TableCell data-qa-perm-cluster>Cluster</TableCell>
          <TableCell data-qa-perm-bucket>Bucket</TableCell>
          <TableCell data-qa-perm-none>None</TableCell>
          <TableCell data-qa-perm-read>Read Only</TableCell>
          <TableCell data-qa-perm-rw>Read/Write</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {mode === 'creating' && (
          <TableRow data-qa-row="Select All">
            <TableCell parentColumn="Cluster" padding="checkbox" colSpan={2}>
              <strong>Select All</strong>
            </TableCell>
            <TableCell parentColumn="None" padding="checkbox">
              <Radio
                name="Select All"
                checked={allScopesEqual(SCOPES.none)}
                data-testid="set-all-none"
                value="none"
                onChange={() => updateAllScopes(SCOPES.none)}
                data-qa-perm-none-radio
                inputProps={{
                  'aria-label': 'Select none for all'
                }}
              />
            </TableCell>
            <TableCell parentColumn="Read Only" padding="checkbox">
              <Radio
                name="Select All"
                checked={allScopesEqual('read_only')}
                value="read-only"
                data-testid="set-all-read"
                onChange={() => updateAllScopes('read_only')}
                data-qa-perm-read-radio
                inputProps={{
                  'aria-label': 'Select read-only for all'
                }}
              />
            </TableCell>
            <TableCell parentColumn="Read/Write" padding="checkbox">
              <Radio
                name="Select All"
                checked={allScopesEqual(SCOPES.write)}
                data-testid="set-all-write"
                value="read-write"
                onChange={() => updateAllScopes(SCOPES.write)}
                data-qa-perm-rw-radio
                inputProps={{
                  'aria-label': 'Select read/write for all'
                }}
              />
            </TableCell>
          </TableRow>
        )}
        {bucket_access.map(thisScope => {
          const scopeName = `${thisScope.cluster}-${thisScope.bucket_name}`;
          return (
            <TableRow key={scopeName} data-testid={scopeName}>
              <TableCell padding="checkbox" className={classes.clusterCell}>
                {thisScope.cluster}
              </TableCell>
              <TableCell padding="checkbox" className={classes.bucketCell}>
                {thisScope.bucket_name}
              </TableCell>
              <TableCell padding="checkbox" className={classes.radioCell}>
                <Radio
                  name={thisScope.bucket_name}
                  disabled={
                    mode !== 'creating' && thisScope.permissions !== SCOPES.none
                  }
                  checked={thisScope.permissions === SCOPES.none}
                  value="none"
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.none
                    })
                  }
                  data-qa-perm-none-radio
                  inputProps={{
                    'aria-label': `no permissions for ${thisScope.cluster}`
                  }}
                />
              </TableCell>
              <TableCell padding="checkbox" className={classes.radioCell}>
                <Radio
                  name={scopeName}
                  disabled={
                    mode !== 'creating' && thisScope.permissions !== SCOPES.read
                  }
                  checked={thisScope.permissions === SCOPES.read}
                  value="read-only"
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.read
                    })
                  }
                  data-qa-perm-read-radio
                  inputProps={{
                    'aria-label': `read-only for ${scopeName}`
                  }}
                />
              </TableCell>
              <TableCell padding="checkbox" className={classes.radioCell}>
                <Radio
                  name={scopeName}
                  disabled={mode !== 'creating'}
                  checked={thisScope.permissions === SCOPES.write}
                  value="read-write"
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.write
                    })
                  }
                  data-qa-perm-rw-radio
                  data-testid="perm-rw-radio"
                  inputProps={{
                    'aria-label': `read/write for ${scopeName}`
                  }}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

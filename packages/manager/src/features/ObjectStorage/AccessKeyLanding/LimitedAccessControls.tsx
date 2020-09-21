import { AccessType, Scope } from '@linode/api-v4/lib/object-storage/types';
import { update } from 'ramda';
import * as React from 'react';
import Toggle from 'src/components/Toggle';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Radio from 'src/components/Radio';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';

const useStyles = makeStyles((theme: Theme) => ({
  clusterCell: {
    width: '18%'
  },
  bucketCell: {
    width: '28%'
  },
  radioCell: {
    width: '18%'
  },
  disabledRow: {
    backgroundColor: theme.bg.tableHeader,
    cursor: 'not-allowed',
    opacity: 0.4
  },
  tableRoot: {
    maxHeight: 750,
    overflowY: 'scroll'
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
            disabled={props.mode !== 'creating'}
          />
        }
        label={'Limited Access'}
      />
      <Typography>
        Limited access keys can list all buckets, regardless of access. They can
        also create new buckets, but will not have access to the buckets they
        create.
      </Typography>
      <AccessTable key={String(checked)} checked={checked} {...rest} />
    </>
  );
};

export default React.memo(LimitedAccessControls);

interface TableProps {
  checked: boolean;
  mode: 'creating' | 'editing';
  bucket_access: Scope[] | null;
  updateScopes: (newScopes: Scope[]) => void;
}

const AccessTable: React.FC<TableProps> = React.memo(props => {
  const { checked, mode, bucket_access, updateScopes } = props;

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

  const disabled = mode !== 'creating' || !checked;

  return (
    <Table
      aria-label="Object Storage Access Key Permissions"
      spacingTop={24}
      className={classes.tableRoot}
    >
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
          <TableRow
            data-qa-row="Select All"
            className={disabled ? classes.disabledRow : undefined}
          >
            <TableCell parentColumn="Cluster" padding="checkbox" colSpan={2}>
              <strong>Select All</strong>
            </TableCell>
            <TableCell parentColumn="None" padding="checkbox">
              <Radio
                name="Select All"
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
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
            <TableRow
              key={scopeName}
              data-testid={scopeName}
              className={disabled ? classes.disabledRow : undefined}
            >
              <TableCell padding="checkbox" className={classes.clusterCell}>
                {thisScope.cluster}
              </TableCell>
              <TableCell padding="checkbox" className={classes.bucketCell}>
                {thisScope.bucket_name}
              </TableCell>
              <TableCell padding="checkbox" className={classes.radioCell}>
                <Radio
                  name={thisScope.bucket_name}
                  disabled={disabled}
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
                  disabled={disabled}
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
                  disabled={disabled}
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
});

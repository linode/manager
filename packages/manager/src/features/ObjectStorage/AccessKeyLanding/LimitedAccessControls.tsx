import { AccessType, Scope } from '@linode/api-v4/lib/object-storage/types';
import { update } from 'ramda';
import * as React from 'react';
import Toggle from 'src/components/Toggle';
import FormControlLabel from 'src/components/core/FormControlLabel';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Radio from 'src/components/Radio';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';

interface Props {
  mode: 'creating' | 'editing';
  checked: boolean;
  permissions?: Scope[];
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
      thisScope.bucket === newScope.bucket &&
      thisScope.cluster === newScope.cluster
  );
  if (scopeToUpdate < 0) {
    return oldScopes;
  }
  return update(scopeToUpdate, newScope, oldScopes);
};

export const SCOPES: Record<string, AccessType> = {
  none: 'none',
  read: 'read-only',
  write: 'read-write'
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
            data-testid="limited-access-toggle"
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
  permissions?: Scope[];
  updateScopes: (newScopes: Scope[]) => void;
}

const AccessTable: React.FC<TableProps> = props => {
  const { mode, permissions, updateScopes } = props;
  if (!permissions) {
    return null;
  }

  const updateSingleScope = (newScope: Scope) => {
    const newScopes = getUpdatedScopes(permissions, newScope);
    updateScopes(newScopes);
  };

  const updateAllScopes = (accessType: AccessType) => {
    const newScopes = permissions.map(thisScope => ({
      ...thisScope,
      access: accessType
    }));
    updateScopes(newScopes);
  };

  const allScopesEqual = (accessType: AccessType) => {
    return permissions.every(thisScope => thisScope.access === accessType);
  };

  return (
    <Table
      aria-label="Personal Access Token Permissions"
      // className={classes.permsTable}
      spacingTop={24}
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
          <TableRow data-qa-row="Select All">
            <TableCell
              parentColumn="Cluster"
              padding="checkbox"
              // className={classes.selectCell}
            >
              Select All
            </TableCell>
            <TableCell
              parentColumn="Bucket"
              padding="checkbox"
              // className={classes.selectCell}
            />
            <TableCell
              parentColumn="None"
              padding="checkbox"
              // className={classes.noneCell}
            >
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
            <TableCell
              parentColumn="Read Only"
              padding="checkbox"
              // className={classes.readOnlyCell}
            >
              <Radio
                name="Select All"
                checked={allScopesEqual('read-only')}
                value="read-only"
                data-testid="set-all-read"
                onChange={() => updateAllScopes('read-only')}
                data-qa-perm-read-radio
                inputProps={{
                  'aria-label': 'Select read-only for all'
                }}
              />
            </TableCell>
            <TableCell
              parentColumn="Read/Write"
              padding="checkbox"
              // className={classes.readWritecell}
            >
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
        {permissions.map(thisScope => {
          const scopeName = `${thisScope.cluster}-${thisScope.bucket}`;
          return (
            <TableRow key={scopeName} data-testid={scopeName}>
              <TableCell
                parentColumn="Cluster"
                padding="checkbox"
                // className={classes.accessCell}
              >
                {thisScope.cluster}
              </TableCell>
              <TableCell
                parentColumn="Bucket"
                padding="checkbox"
                // className={classes.accessCell}
              >
                {thisScope.bucket}
              </TableCell>
              <TableCell
                parentColumn="None"
                padding="checkbox"
                // className={classes.noneCell}
              >
                <Radio
                  name={thisScope.bucket}
                  disabled={
                    mode !== 'creating' && thisScope.access !== SCOPES.none
                  }
                  checked={thisScope.access === SCOPES.none}
                  value="none"
                  onChange={() =>
                    updateSingleScope({ ...thisScope, access: SCOPES.none })
                  }
                  data-qa-perm-none-radio
                  inputProps={{
                    'aria-label': `no access for ${thisScope.cluster}`
                  }}
                />
              </TableCell>
              <TableCell
                parentColumn="Read Only"
                padding="checkbox"
                // className={classes.readOnlyCell}
              >
                <Radio
                  name={scopeName}
                  disabled={
                    mode !== 'creating' && thisScope.access !== SCOPES.read
                  }
                  checked={thisScope.access === SCOPES.read}
                  value="read-only"
                  onChange={() =>
                    updateSingleScope({ ...thisScope, access: SCOPES.read })
                  }
                  data-qa-perm-read-radio
                  inputProps={{
                    'aria-label': `read-only for ${scopeName}`
                  }}
                />
              </TableCell>
              <TableCell
                parentColumn="Read/Write"
                padding="checkbox"
                // className={classes.readWritecell}
              >
                <Radio
                  name={scopeName}
                  disabled={mode !== 'creating'}
                  checked={thisScope.access === SCOPES.write}
                  value="read-write"
                  onChange={() =>
                    updateSingleScope({ ...thisScope, access: SCOPES.write })
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

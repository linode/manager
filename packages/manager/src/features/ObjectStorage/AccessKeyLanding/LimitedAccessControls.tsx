import { Scope } from '@linode/api-v4/lib/object-storage/types';
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
  scopes?: Scope[];
  handleToggle: () => void;
}

// const fakeScopes = [
//   {
//     cluster: 'us-east-1',
//     bucket: 'bucket-name-1',
//     access: 'read-only'
//   },
//   {
//     cluster: 'us-east-1',
//     bucket: 'bucket-name-2',
//     access: 'read-write'
//   },
//   {
//     cluster: 'eu-central-1',
//     bucket: 'bucket-name-3',
//     access: 'none'
//   },
//   {
//     cluster: 'ap-south-1',
//     bucket: 'bucket-name-4',
//     access: 'none'
//   }
// ];

export const LimitedAccessControls: React.FC<Props> = props => {
  const { checked, handleToggle, mode, scopes } = props;
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
      <AccessTable mode={mode} scopes={scopes ?? []} />
    </>
  );
};

export default React.memo(LimitedAccessControls);

interface TableProps {
  mode: 'creating' | 'editing';
  scopes: Scope[];
}

const AccessTable: React.FC<TableProps> = props => {
  const { mode, scopes } = props;
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
                checked={
                  false // selectAllSelectedScope === 0 && this.allScopesIdentical()
                }
                data-testid="set-all-none"
                value="none"
                onChange={() => null}
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
                checked={
                  false // selectAllSelectedScope === 1 && this.allScopesIdentical()
                }
                value="read-only"
                data-testid="set-all-read"
                onChange={() => null}
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
                checked={
                  false // selectAllSelectedScope === 2 && this.allScopesIdentical()
                }
                data-testid="set-all-write"
                value="read-write"
                onChange={() => null}
                data-qa-perm-rw-radio
                inputProps={{
                  'aria-label': 'Select read/write for all'
                }}
              />
            </TableCell>
          </TableRow>
        )}
        {scopes.map(thisScope => {
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
                  disabled={mode !== 'creating' && thisScope.access !== 'none'}
                  checked={thisScope.access === 'none'}
                  value="none"
                  onChange={() => null}
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
                    mode !== 'creating' && thisScope.access !== 'read-only'
                  }
                  checked={thisScope.access === 'read-only'}
                  value="read-only"
                  onChange={() => null}
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
                  checked={thisScope.access === 'read-write'}
                  value="read-write"
                  onChange={() => null}
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

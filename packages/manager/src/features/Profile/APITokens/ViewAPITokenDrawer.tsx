import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Drawer from 'src/components/Drawer';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import AccessCell from 'src/features/ObjectStorage/AccessKeyLanding/AccessCell';
import { scopeStringToPermTuples, basePermNameMap } from './utils';
import { Token } from '@linode/api-v4/lib/profile/types';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  permsTable: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(),
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

interface Props {
  open: boolean;
  onClose: () => void;
  token: Token | undefined;
}

export const ViewAPITokenDrawer = (props: Props) => {
  const classes = useStyles();
  const { open, onClose, token } = props;

  const permissions = scopeStringToPermTuples(token?.scopes ?? '');

  return (
    <Drawer title={token?.label ?? 'Token'} open={open} onClose={onClose}>
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
          {permissions.map((scopeTup) => {
            if (!basePermNameMap[scopeTup[0]]) {
              return null;
            }
            return (
              <TableRow
                key={scopeTup[0]}
                data-qa-row={basePermNameMap[scopeTup[0]]}
              >
                <TableCell
                  parentColumn="Access"
                  padding="checkbox"
                  className={classes.accessCell}
                >
                  {basePermNameMap[scopeTup[0]]}
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
                    viewOnly={true}
                    disabled={false}
                    onChange={() => null}
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
                    viewOnly={true}
                    disabled={false}
                    onChange={() => null}
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
                    viewOnly={true}
                    disabled={false}
                    onChange={() => null}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Drawer>
  );
};

import {
  DatabaseBackup,
  getDatabaseBackups
} from '@linode/api-v4/lib/databases';
import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableContentWrapper_CMR from 'src/components/TableContentWrapper/TableContentWrapper_CMR';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import BackupTableRow from './DatabaseBackupTableRow';

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  }
}));

export const DatabaseBackups: React.FC<{}> = () => {
  const classes = useStyles();

  // @todo: get this ID as a prop
  const match = useRouteMatch<{ id: string }>('/databases/:id');

  const thisDatabaseID = match?.params?.id;

  const backups = useAPIRequest<DatabaseBackup[]>(
    // @todo: clean up when ID is a required prop
    thisDatabaseID
      ? () => getDatabaseBackups(Number(thisDatabaseID)).then(res => res.data)
      : null,
    []
  );

  return (
    <>
      <Typography className={classes.heading} variant="h2">
        Backups
      </Typography>
      <Paper style={{ padding: 0 }}>
        <Table aria-label="List of database backups">
          <TableHead>
            <TableRow>
              <TableCell>Backup ID</TableCell>
              {/* <TableCell>Status</TableCell> */}
              <TableCell>Date Created</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableContentWrapper_CMR
              length={backups.data.length}
              loading={backups.loading}
              error={backups.error}
            >
              {backups.data.map((backup: DatabaseBackup, idx: number) => (
                <BackupTableRow key={idx} backup={backup} />
              ))}
            </TableContentWrapper_CMR>
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default DatabaseBackups;

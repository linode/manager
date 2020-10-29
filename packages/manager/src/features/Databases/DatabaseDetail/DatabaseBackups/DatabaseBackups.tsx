import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import BackupTableRow from './DatabaseBackupTableRow';
import { DatabaseBackupFactory } from 'src/factories/databaseBackups';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  }
}));

export const DatabaseBackups: React.FC<{}> = () => {
  // @todo replace with actual db info
  const backups = DatabaseBackupFactory.buildList(3);
  const classes = useStyles();
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
              <TableCell>Status</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {backups.map((backup: DatabaseBackup, idx: number) => (
              <BackupTableRow key={idx} backup={backup} />
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default DatabaseBackups;

// import {
//   DatabaseBackup,
//   getDatabaseBackups,
// } from '@linode/api-v4/lib/databases';
import * as React from 'react';
// import Paper from 'src/components/core/Paper';
// import { makeStyles, Theme } from 'src/components/core/styles';
// import TableBody from 'src/components/core/TableBody';
// import TableHead from 'src/components/core/TableHead';
// import Typography from 'src/components/core/Typography';
// import Table from 'src/components/Table';
// import TableCell from 'src/components/TableCell';
// import TableContentWrapper from 'src/components/TableContentWrapper';
// import TableRow from 'src/components/TableRow';
// import { useAPIRequest } from 'src/hooks/useAPIRequest';
// import BackupTableRow from './DatabaseBackupTableRow';

// const useStyles = makeStyles((theme: Theme) => ({
//   heading: {
//     marginBottom: theme.spacing(2),
//     paddingLeft: theme.spacing(2),
//   },
// }));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  // databaseID: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DatabaseBackups: React.FC<Props> = (props) => {
  // const classes = useStyles();

  // const { databaseID } = props;

  // const backups = useAPIRequest<DatabaseBackup[]>(
  //   () => getDatabaseBackups(Number(databaseID)).then((res) => res.data),
  //   []
  // );

  return (
    <>
      Database Backups
      {/* <Typography className={classes.heading} variant="h2">
        Backups
      </Typography>
      <Paper style={{ padding: 0 }}>
        <Table aria-label="List of database backups">
          <TableHead>
            <TableRow>
              <TableCell>Backup ID</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableContentWrapper
              length={backups.data.length}
              loading={backups.loading}
              error={backups.error}
            >
              {backups.data.map((backup: DatabaseBackup, idx: number) => (
                <BackupTableRow key={idx} backup={backup} />
              ))}
            </TableContentWrapper>
          </TableBody>
        </Table>
      </Paper> */}
    </>
  );
};

export default DatabaseBackups;

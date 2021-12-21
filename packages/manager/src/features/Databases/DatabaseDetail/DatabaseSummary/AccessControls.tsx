import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { makeStyles, Theme } from 'src/components/core/styles';
import Table from 'src/components/Table';
import TableBody from 'src/components/core/TableBody';
import TableRow from 'src/components/TableRow';
import TableCell from 'src/components/TableCell';
import TableHead from 'src/components/core/TableHead';
import TableRowEmptyState from 'src/components/TableRowEmptyState';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  // databaseID: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  sectionHeader: {
    marginBottom: '0.25rem',
  },
  sectionText: {
    marginBottom: '1rem',
  },
  table: {
    width: '50%',
  },
  cell: {
    border: `solid 1px ${theme.cmrBorderColors.divider}`,
    // display: 'flex',
    // borderBottom: 'none',
  },
}));

const accessControlList = ['1.1.1.1', '2.2.2.2', '3.3.3.3', '4.4.4.4'];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const AccessControls: React.FC<Props> = (props) => {
  const classes = useStyles();
  // const databases = useDatabases();
  // const { databaseID } = props;
  // const thisDatabase = databases.databases.itemsById[databaseID];

  const ipTable = (accessControlList: string[]) => {
    if (accessControlList.length === 0) {
      return (
        <TableRowEmptyState
          colSpan={12}
          message={"You don't have any Access Controls set."}
        />
      );
    }

    return (
      <Table className={classes.table}>
        <TableHead></TableHead>
        <TableBody>
          {accessControlList.map((accessControl, idx) => (
            <TableRow key={idx}>
              <TableCell key={idx} className={classes.cell}>
                {accessControl}
                {/* <Typography>Remove</Typography> */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <div className={classes.sectionHeader}>
        <Typography variant="h3">Access Controls</Typography>
      </div>
      <div className={classes.sectionText}>
        <Typography>Descriptive text...</Typography>
      </div>
      {ipTable(accessControlList)}
    </>
  );
};

export default AccessControls;

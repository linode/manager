import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';

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

interface Props {
  accessControlsList: string[];
}

export const AccessControls: React.FC<Props> = (props) => {
  const { accessControlsList } = props;

  const classes = useStyles();

  const ipTable = (accessControlsList: string[]) => {
    if (accessControlsList.length === 0) {
      return (
        <TableRowEmptyState
          colSpan={12}
          message={"You don't have any Access Controls set."}
        />
      );
    }

    return (
      <Table className={classes.table}>
        <TableBody>
          {accessControlsList.map((accessControl, idx) => (
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
      {ipTable(accessControlsList)}
    </>
  );
};

export default AccessControls;

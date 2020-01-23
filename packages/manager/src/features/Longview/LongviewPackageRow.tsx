import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';

import TableRow from 'src/components/TableRow';

import { LongviewPackage } from './request.types';

const useStyles = makeStyles((theme: Theme) => ({
  new: {
    color: theme.color.green
  }
}));

interface Props {
  lvPackage: LongviewPackage;
}

type CombinedProps = Props;

export const LongviewPackageRow: React.FC<CombinedProps> = props => {
  const { lvPackage } = props;

  const classes = useStyles();

  return (
    <TableRow>
      <TableCell parentColumn={'Package'}>{lvPackage.name}</TableCell>
      <TableCell parentColumn="Installed Version / Latest Version">
        <div>{lvPackage.current}</div>
        <div className={classes.new}>{lvPackage.new}</div>
      </TableCell>
    </TableRow>
  );
};

export default LongviewPackageRow;

import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { LongviewPackage } from './request.types';

const useStyles = makeStyles()((theme: Theme) => ({
  new: {
    color: theme.color.green,
  },
}));

interface Props {
  lvPackage: LongviewPackage;
}

export const LongviewPackageRow = (props: Props) => {
  const { lvPackage } = props;

  const { classes } = useStyles();

  return (
    <TableRow ariaLabel={lvPackage.name}>
      <TableCell parentColumn={'Package'}>{lvPackage.name}</TableCell>
      <TableCell parentColumn="Installed Version / Latest Version">
        <div>{lvPackage.current}</div>
        <div className={classes.new}>{lvPackage.new}</div>
      </TableCell>
    </TableRow>
  );
};

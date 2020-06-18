import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';

const useStyles = makeStyles((theme: Theme) => ({ root: {} }));

interface Props {
  tags: string[];
  addTag: (newTag: string) => void;
}

export type CombinedProps = Props;

export const TagCell: React.FC<Props> = props => {
  const classes = useStyles();
  return <TableCell className={classes.root}>Cell content!</TableCell>;
};

export default TagCell;

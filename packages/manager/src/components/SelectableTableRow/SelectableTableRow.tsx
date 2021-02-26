import * as React from 'react';

import { makeStyles } from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import TableCell from 'src/components/TableCell';
import CheckBox from 'src/components/CheckBox';

const useStyles = makeStyles(() => ({
  root: {
    '& td': {
      padding: '0px 15px',
    },
  },
  checkBox: {
    textAlign: 'center',
    width: 25,
    paddingLeft: 0,
    paddingRight: 0,
    '& svg': {
      width: 20,
      height: 20,
    },
  },
}));

interface Props {
  children: JSX.Element[];
  isChecked: boolean;
  handleToggleCheck: () => void;
}

export const SelectableTableRow: React.FC<Props> = props => {
  const { isChecked, handleToggleCheck } = props;
  const classes = useStyles();
  return (
    <TableRow className={classes.root}>
      <TableCell className={classes.checkBox}>
        <CheckBox
          checked={isChecked}
          onChange={handleToggleCheck}
          inputProps={{
            'aria-label': `Select all entities on page`,
          }}
        />
      </TableCell>
      {props.children}
    </TableRow>
  );
};

export default React.memo(SelectableTableRow);

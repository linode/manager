import * as React from 'react';

import { makeStyles } from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import TableCell from 'src/components/TableCell';
import CheckBox from 'src/components/CheckBox';

const useStyles = makeStyles(() => ({
  checkBox: {
    width: 50
  }
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
    <TableRow>
      <TableCell className={classes.checked}>
        <CheckBox
          checked={isChecked}
          onChange={handleToggleCheck}
          inputProps={{
            'aria-label': `Select all entities on page`
          }}
        />
      </TableCell>
      {props.children}
    </TableRow>
  );
};

export default React.memo(SelectableTableRow);

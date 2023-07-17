import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Checkbox } from 'src/components/Checkbox';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

interface SelectableTableRowProps {
  children: JSX.Element[];
  handleToggleCheck: () => void;
  isChecked: boolean;
}

export const SelectableTableRow = React.memo(
  (props: SelectableTableRowProps) => {
    const { handleToggleCheck, isChecked } = props;

    return (
      <TableRow
        sx={{
          '& td': {
            padding: '0px 15px',
          },
        }}
      >
        <StyledTableCell>
          <Checkbox
            inputProps={{
              'aria-label': `Select all entities on page`,
            }}
            checked={isChecked}
            onChange={handleToggleCheck}
          />
        </StyledTableCell>
        {props.children}
      </TableRow>
    );
  }
);

const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})({
  '& svg': {
    height: 20,
    width: 20,
  },
  paddingLeft: 0,
  paddingRight: 0,
  textAlign: 'center',
  width: 25,
});

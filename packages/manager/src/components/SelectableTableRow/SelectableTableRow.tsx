import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Checkbox } from 'src/components/Checkbox';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

interface SelectableTableRowProps {
  children: JSX.Element[];
  isChecked: boolean;
  handleToggleCheck: () => void;
}

export const SelectableTableRow = React.memo(
  (props: SelectableTableRowProps) => {
    const { isChecked, handleToggleCheck } = props;

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
            checked={isChecked}
            onChange={handleToggleCheck}
            inputProps={{
              'aria-label': `Select all entities on page`,
            }}
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
  textAlign: 'center',
  width: 25,
  paddingLeft: 0,
  paddingRight: 0,
  '& svg': {
    width: 20,
    height: 20,
  },
});

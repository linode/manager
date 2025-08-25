import { Checkbox } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import type { JSX } from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

interface SelectableTableRowProps {
  /**
   * The content to be rendered inside the table row.
   * This should be an array of JSX elements.
   */
  children: JSX.Element[];
  /**
   * An optional className to apply custom styles to the row.
   */
  className?: string;
  /**
   * A boolean indicating whether the row is currently disabled or not.
   */
  disabled?: boolean;
  /**
   * A function to handle the toggle of the row's checked state.
   * This function will be called when the row is clicked to select or deselect it.
   */
  handleToggleCheck: () => void;
  /**
   * A boolean indicating whether the row is currently checked or not.
   */
  isChecked: boolean;
}

export const SelectableTableRow = React.memo(
  (props: SelectableTableRowProps) => {
    const { handleToggleCheck, isChecked, disabled, className } = props;

    return (
      <TableRow
        className={className}
        sx={(theme) => ({
          '& td': {
            padding: `0 ${theme.tokens.spacing.S12}`,
          },
        })}
      >
        <StyledTableCell>
          <Checkbox
            checked={isChecked}
            disabled={disabled}
            inputProps={{
              'aria-label': `Select all entities on page`,
            }}
            onChange={handleToggleCheck}
            size="small"
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
  paddingLeft: 0,
  paddingRight: 0,
  textAlign: 'center',
  width: 25,
});

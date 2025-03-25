import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';

import KeyboardCaretDownIcon from 'src/assets/icons/caret_down.svg';
import KeyboardCaretRightIcon from 'src/assets/icons/caret_right.svg';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

interface Props {
  InnerTable: JSX.Element;
  OuterTableCells: JSX.Element;
  label: string;
}

export const CollapsibleRow = (props: Props) => {
  const { InnerTable, OuterTableCells, label } = props;

  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow>
        <TableCell scope="row">
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <IconButton
              aria-label={`expand ${label} row`}
              onClick={() => setOpen(!open)}
              size="small"
              sx={{ marginRight: 0.5, padding: 0 }}
            >
              {open ? <KeyboardCaretDownIcon /> : <KeyboardCaretRightIcon />}
            </IconButton>
            {label}
          </Box>
        </TableCell>
        {OuterTableCells}
      </TableRow>
      <TableRow className="MuiTableRow-nested">
        <TableCell className="MuiTableCell-nested" colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>{InnerTable}</Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

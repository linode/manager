import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';

import KeyboardArrowDownIcon from 'src/assets/icons/arrow_down.svg';
import KeyboardArrowRightIcon from 'src/assets/icons/arrow_right.svg';
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
      <TableRow hover>
        <TableCell scope="row">
          <Box alignItems="center" display="flex">
            <IconButton
              aria-label={`expand ${label} row`}
              onClick={() => setOpen(!open)}
              size="small"
              sx={{ marginRight: 0.5, padding: 0 }}
            >
              {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
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

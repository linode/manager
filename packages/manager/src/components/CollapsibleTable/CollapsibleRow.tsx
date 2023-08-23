import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import * as React from 'react';

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
      <StyledOuterTableRow>
        <TableCell component="th" scope="row">
          <IconButton
            aria-label="expand row"
            onClick={() => setOpen(!open)}
            size="small"
            sx={{ padding: 1 }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          {label}
        </TableCell>
        {OuterTableCells}
      </StyledOuterTableRow>
      <StyledTableRow>
        <TableCell colSpan={6} style={{ border: 'none', padding: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>{InnerTable}</Box>
          </Collapse>
        </TableCell>
      </StyledTableRow>
    </>
  );
};

const StyledOuterTableRow = styled(TableRow, {
  label: 'StyledOuterTableRow',
})(() => ({
  '& > *': { borderBottom: 'unset' },
  '& th': {
    '&:first-of-type': {
      paddingLeft: 0,
    },
  },
}));

const StyledTableRow = styled(TableRow, {
  label: 'StyledTableRow',
})(() => ({
  height: 'auto',
}));

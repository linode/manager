import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';
import type { JSX } from 'react';

import KeyboardCaretDownIcon from 'src/assets/icons/caret_down.svg';
import KeyboardCaretRightIcon from 'src/assets/icons/caret_right.svg';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

interface Props {
  InnerTable: JSX.Element;
  label: string;
  linkForLabel?: string;
  onToggle?: (open: boolean) => void;
  OuterTableCells: JSX.Element;
}

export const CollapsibleRow = (props: Props) => {
  const { InnerTable, onToggle, OuterTableCells, label, linkForLabel } = props;

  const [open, setOpen] = React.useState(false);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    onToggle?.(next);
  };

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
              onClick={handleToggle}
              size="small"
              sx={{ marginRight: 0.5, padding: 0 }}
            >
              {open ? <KeyboardCaretDownIcon /> : <KeyboardCaretRightIcon />}
            </IconButton>
            {linkForLabel ? (
              <Link accessibleAriaLabel={label} to={linkForLabel}>
                {label}
              </Link>
            ) : (
              label
            )}
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

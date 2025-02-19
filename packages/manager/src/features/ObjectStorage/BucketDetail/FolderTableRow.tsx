import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { Link } from 'react-router-dom';

import FolderIcon from 'src/assets/icons/objectStorage/folder.svg';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { FolderActionMenu } from './FolderActionMenu';

import type { TableRowProps } from 'src/components/TableRow';

export interface FolderTableRowProps extends TableRowProps {
  displayName: string;
  folderName: string;
  handleClickDelete: (objectName: string) => void;
}

export const FolderTableRow = (props: FolderTableRowProps) => {
  const {
    displayName,
    folderName,
    handleClickDelete,
    ...tableRowProps
  } = props;

  return (
    <TableRow key={folderName} {...tableRowProps}>
      <TableCell>
        <Grid
          container
          spacing={2}
          wrap="nowrap"
          sx={{
            alignItems: 'center',
          }}
        >
          <StyledIconWrapper>
            <FolderIcon size={22} />
          </StyledIconWrapper>
          <Grid>
            <Link
              className="secondaryLink"
              to={`?prefix=${encodeURIComponent(folderName)}`}
            >
              {displayName}
            </Link>
          </Grid>
        </Grid>
      </TableCell>
      {/* Three empty TableCells corresponding to the Size, Last Modified, and Action Menu (for ObjectTableRow) columns for formatting purposes. */}
      <TableCell />
      <Hidden mdDown>
        <TableCell />
      </Hidden>
      <TableCell actionCell>
        <FolderActionMenu
          handleClickDelete={handleClickDelete}
          objectName={folderName}
        />
      </TableCell>
    </TableRow>
  );
};

const StyledIconWrapper = styled(Grid, {
  label: 'StyledIconWrapper',
})(() => ({
  margin: '2px 0',
}));

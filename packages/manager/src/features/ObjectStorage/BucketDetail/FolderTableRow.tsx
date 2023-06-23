import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { FolderActionMenu } from './FolderActionMenu';

interface Props {
  displayName: string;
  folderName: string;
  handleClickDelete: (objectName: string) => void;
  manuallyCreated: boolean;
}

export const FolderTableRow = (props: Props) => {
  const { displayName, folderName, handleClickDelete } = props;

  return (
    <TableRow key={folderName} ariaLabel={`Folder ${displayName}`} {...props}>
      <TableCell parentColumn="Object">
        <Grid container wrap="nowrap" alignItems="center" spacing={2}>
          <StyledIconWrapper>
            <EntityIcon variant="folder" size={22} />
          </StyledIconWrapper>
          <Grid>
            <Link to={`?prefix=${folderName}`} className="secondaryLink">
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

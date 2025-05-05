import { Box, LinkButton, Typography } from '@linode/ui';
import { readableBytes } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import ObjectIcon from 'src/assets/icons/objectStorage/object.svg';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import ObjectActionMenu from './ObjectActionMenu';

interface Props {
  displayName: string;
  fullName: string;
  handleClickDelete: (objectName: string) => void;
  handleClickDetails: () => void;
  handleClickDownload: (objectName: string, newTab: boolean) => void;
  objectLastModified: string;
  objectSize: number;
}
export const ObjectTableRow = (props: Props) => {
  const {
    displayName,
    fullName,
    handleClickDelete,
    handleClickDetails,
    handleClickDownload,
    objectLastModified,
    objectSize,
  } = props;

  return (
    <TableRow>
      <TableCell>
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: 'center',
          }}
          wrap="nowrap"
        >
          <Grid className="py0">
            <ObjectIcon size={20} />
          </Grid>
          <Grid>
            <Box alignItems="center" display="flex">
              <Typography>
                <LinkButton onClick={handleClickDetails}>
                  {displayName}
                </LinkButton>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell noWrap>{readableBytes(objectSize).formatted}</TableCell>
      <Hidden mdDown>
        <TableCell noWrap>
          <DateTimeDisplay value={objectLastModified} />
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <ObjectActionMenu
          handleClickDelete={handleClickDelete}
          handleClickDownload={handleClickDownload}
          objectName={fullName}
        />
      </TableCell>
    </TableRow>
  );
};

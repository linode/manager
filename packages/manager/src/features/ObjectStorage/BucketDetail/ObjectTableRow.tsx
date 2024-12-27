import { Box, StyledLinkButton, Typography } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { readableBytes } from 'src/utilities/unitConversions';

import ObjectActionMenu from './ObjectActionMenu';

import type { TableRowOwnProps } from '@mui/material';

interface Props {
  displayName: string;
  fullName: string;
  handleClickDelete: (objectName: string) => void;
  handleClickDetails: () => void;
  handleClickDownload: (objectName: string, newTab: boolean) => void;
  hover?: TableRowOwnProps['hover'];
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
    hover,
    objectLastModified,
    objectSize,
  } = props;

  return (
    <TableRow hover={hover}>
      <TableCell>
        <Grid alignItems="center" container spacing={2} wrap="nowrap">
          <Grid className="py0">
            <EntityIcon size={20} variant="object" {...props} />
          </Grid>
          <Grid>
            <Box alignItems="center" display="flex">
              <Typography>
                <StyledLinkButton onClick={handleClickDetails}>
                  {displayName}
                </StyledLinkButton>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell noWrap>
        {/* to convert from binary units (GiB) to decimal units (GB) we need to pass the base10 flag */}
        {readableBytes(objectSize, { base10: true }).formatted}
      </TableCell>
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

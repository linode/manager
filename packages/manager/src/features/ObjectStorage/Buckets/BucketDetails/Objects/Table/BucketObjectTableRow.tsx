import { readableBytes } from '@akamai/compute-ui-core/api';
import { Box, LinkButton, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import ObjectIcon from 'src/assets/icons/objectStorage/object.svg';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import BucketObjectActionMenu from './BucketObjectActionMenu';

interface Props {
  displayName: string;
  fullName: string;
  handleClickDelete: (objectName: string) => void;
  handleClickDetails: () => void;
  handleClickDownload: (objectName: string, newTab: boolean) => void;
  objectLastModified: string;
  objectSize: number;
}
export const BucketObjectTableRow = (props: Props) => {
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
        <BucketObjectActionMenu
          handleClickDelete={handleClickDelete}
          handleClickDownload={handleClickDownload}
          objectName={fullName}
        />
      </TableCell>
    </TableRow>
  );
};

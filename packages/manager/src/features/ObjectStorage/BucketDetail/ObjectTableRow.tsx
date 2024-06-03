import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { readableBytes } from 'src/utilities/unitConversions';

import ObjectActionMenu from './ObjectActionMenu';

interface Props {
  displayName: string;
  fullName: string;
  handleClickDelete: (objectName: string) => void;
  handleClickDetails: () => void;
  handleClickDownload: (objectName: string, newTab: boolean) => void;
  manuallyCreated: boolean;
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
        <Grid alignItems="center" container spacing={2} wrap="nowrap">
          <Grid className="py0">
            <StyledEntityIcon size={20} variant="object" {...props} />
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

const StyledEntityIcon = styled(EntityIcon, {
  label: 'StyledEntityIcon',
})<Partial<Props>>(({ theme, ...props }) => ({
  ...(props.manuallyCreated && {
    '& g': {
      fill: theme.bg.lightBlue1,
    },
  }),
}));

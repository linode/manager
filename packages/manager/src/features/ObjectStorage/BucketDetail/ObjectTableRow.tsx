import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import Box from 'src/components/core/Box';
import Hidden from 'src/components/core/Hidden';
import Typography from 'src/components/core/Typography';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
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
    <TableRow ariaLabel={displayName}>
      <TableCell>
        <Grid container wrap="nowrap" alignItems="center" spacing={2}>
          <Grid className="py0">
            <StyledEntityIcon variant="object" size={20} {...props} />
          </Grid>
          <Grid>
            <Box display="flex" alignItems="center">
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
          handleClickDownload={handleClickDownload}
          handleClickDelete={handleClickDelete}
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

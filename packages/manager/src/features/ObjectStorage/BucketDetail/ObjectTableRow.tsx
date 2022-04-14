import * as React from 'react';
import Box from 'src/components/core/Box';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { readableBytes } from 'src/utilities/unitConversions';
import ObjectActionMenu from './ObjectActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  manuallyCreated: {
    '&:before': {
      backgroundColor: theme.bg.lightBlue1,
    },
  },
  manuallyCreatedIcon: {
    '& g': {
      fill: theme.bg.lightBlue1,
    },
  },
  objectNameButton: {
    ...theme.applyLinkStyles,
    color: theme.textColors.linkActiveLight,
  },
}));

interface Props {
  displayName: string;
  fullName: string;
  objectSize: number;
  objectLastModified: string;
  handleClickDownload: (objectName: string, newTab: boolean) => void;
  handleClickDelete: (objectName: string) => void;
  handleClickDetails: () => void;
  manuallyCreated: boolean;
}

const ObjectTableRow: React.FC<Props> = (props) => {
  const {
    displayName,
    fullName,
    objectSize,
    objectLastModified,
    handleClickDownload,
    handleClickDelete,
    handleClickDetails,
    manuallyCreated,
  } = props;

  const classes = useStyles();

  return (
    <TableRow
      ariaLabel={displayName}
      className={manuallyCreated ? classes.manuallyCreated : ''}
    >
      <TableCell>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon
              variant="object"
              size={20}
              className={manuallyCreated ? classes.manuallyCreatedIcon : ''}
            />
          </Grid>
          <Grid item>
            <Box display="flex" alignItems="center">
              <Typography>
                <button
                  className={classes.objectNameButton}
                  onClick={handleClickDetails}
                >
                  {displayName}
                </button>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell noWrap>{readableBytes(objectSize).formatted}</TableCell>
      <Hidden smDown>
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

export default React.memo(ObjectTableRow);

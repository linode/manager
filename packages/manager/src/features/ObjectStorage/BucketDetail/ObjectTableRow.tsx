import * as React from 'react';
import Box from 'src/components/core/Box';
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
    backgroundColor: theme.bg.lightBlue
  },
  folderNameWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  iconWrapper: {
    margin: '2px 0'
  }
}));

interface Props {
  objectName: string;
  objectSize: number;
  objectLastModified: string;
  handleClickDownload: (newTab: boolean) => void;
  handleClickDelete: (objectName: string) => void;
  manuallyCreated: boolean;
}

const ObjectTableRow: React.FC<Props> = props => {
  const {
    objectName,
    objectSize,
    objectLastModified,
    handleClickDownload,
    handleClickDelete,
    manuallyCreated
  } = props;

  const classes = useStyles();

  return (
    <TableRow className={manuallyCreated ? classes.manuallyCreated : ''}>
      <TableCell parentColumn="Object">
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon variant="object" size={20} />
          </Grid>
          <Grid item>
            <Box display="flex" alignItems="center">
              <Typography>
                <strong>{objectName}</strong>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Size" noWrap>
        {readableBytes(objectSize).formatted}
      </TableCell>
      <TableCell parentColumn="Last Modified" noWrap>
        <DateTimeDisplay value={objectLastModified} humanizeCutoff="never" />
      </TableCell>
      <TableCell>
        <ObjectActionMenu
          handleClickDownload={handleClickDownload}
          handleClickDelete={handleClickDelete}
          objectName={objectName}
        />
      </TableCell>
    </TableRow>
  );
};

export default React.memo(ObjectTableRow);

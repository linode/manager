import { Disk } from '@linode/api-v4/lib/linodes';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import BarPercent from 'src/components/BarPercent';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useEventsInfiniteQuery } from 'src/queries/events';
import { isInProgressEvent } from 'src/utilities/eventUtils';

import { LinodeDiskActionMenu } from './LinodeDiskActionMenu';

interface Props {
  disk: Disk;
  linodeId?: number;
  linodeStatus: string;
  onDelete: () => void;
  onImagize: () => void;
  onRename: () => void;
  onResize: () => void;
  readOnly: boolean;
}

export const LinodeDiskRow = React.memo((props: Props) => {
  const {
    disk,
    linodeId,
    linodeStatus,
    onDelete,
    onImagize,
    onRename,
    onResize,
    readOnly,
  } = props;

  const theme = useTheme();
  const { events } = useEventsInfiniteQuery();

  const diskEventLabelMap = {
    disk_create: 'Creating',
    disk_delete: 'Deleting',
    disk_resize: 'Resizing',
  };

  const diskEventsToShowProgressFor = Object.keys(diskEventLabelMap);

  const resizeEvent = React.useMemo(
    () =>
      events?.find(
        (event) =>
          isInProgressEvent(event) &&
          event.secondary_entity?.id === disk.id &&
          diskEventsToShowProgressFor.includes(event.action)
      ),
    [disk.id, diskEventsToShowProgressFor, events]
  );

  return (
    <TableRow data-qa-disk={disk.label}>
      <TableCell sx={{ width: '20%' }}>{disk.label}</TableCell>
      <TableCell sx={{ width: '10%' }}>{disk.filesystem}</TableCell>
      <TableCell sx={{ width: '15%' }}>
        {resizeEvent ? (
          <StyledDiv>
            {diskEventLabelMap[resizeEvent.action]} (
            {resizeEvent.percent_complete}%)
            <BarPercent
              sx={{
                paddingLeft: theme.spacing(),
                width: 250,
              }}
              max={100}
              narrow
              rounded
              value={resizeEvent?.percent_complete ?? 0}
            />
          </StyledDiv>
        ) : (
          `${disk.size} MB`
        )}
      </TableCell>
      <Hidden mdDown>
        <TableCell sx={{ width: '20%' }}>
          <DateTimeDisplay value={disk.created} />
        </TableCell>
      </Hidden>
      <TableCell>
        <LinodeDiskActionMenu
          diskId={disk.id}
          label={disk.label}
          linodeId={linodeId}
          linodeStatus={linodeStatus || 'offline'}
          onDelete={onDelete}
          onImagize={onImagize}
          onRename={onRename}
          onResize={onResize}
          readOnly={readOnly}
        />
      </TableCell>
    </TableRow>
  );
});

const StyledDiv = styled('div', { label: 'StyledDiv' })({
  alignItems: 'center',
  display: 'flex',
  flexFlow: 'row nowrap',
});

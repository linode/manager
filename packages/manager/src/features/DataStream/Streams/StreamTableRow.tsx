import { streamStatus } from '@linode/api-v4';
import {
  useDeleteStreamMutation,
  useUpdateStreamMutation,
} from '@linode/queries';
import { Hidden } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import {
  getDestinationTypeOption,
  getStreamTypeOption,
} from 'src/features/DataStream/dataStreamUtils';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Stream, StreamStatus } from '@linode/api-v4';

interface StreamTableRowProps {
  stream: Stream;
}

export const StreamTableRow = React.memo((props: StreamTableRowProps) => {
  const { stream } = props;

  const navigate = useNavigate();

  const { mutateAsync: updateStream } = useUpdateStreamMutation();
  const { mutateAsync: deleteStream } = useDeleteStreamMutation();

  return (
    <TableRow key={stream.id}>
      <TableCell>{stream.label}</TableCell>
      <TableCell>{getStreamTypeOption(stream.type)?.label}</TableCell>
      <TableCell statusCell>
        <StatusIcon status={stream.status} />
        {humanizeStreamStatus(stream.status)}
      </TableCell>
      <TableCell>{stream.id}</TableCell>
      <Hidden smDown>
        <TableCell>
          {getDestinationTypeOption(stream.destinations[0]?.type)?.label}
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          <DateTimeDisplay value={stream.created} />
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <ActionMenu
          actionsList={[
            {
              onClick: () => {
                navigate({ to: `/datastream/streams/${stream.id}/edit` });
              },
              title: 'Edit',
            },
            {
              onClick: () => {
                updateStream({
                  id: stream.id,
                  destinations: stream.destinations.map(({ id }) => id),
                  details: stream.details,
                  label: stream.label,
                  type: stream.type,
                  status:
                    stream.status === streamStatus.Active
                      ? streamStatus.Inactive
                      : streamStatus.Active,
                })
                  .then(() => {
                    return enqueueSnackbar(
                      `Stream  ${stream.label} ${stream.status === streamStatus.Active ? 'disabled' : 'enabled'}`,
                      {
                        variant: 'success',
                      }
                    );
                  })
                  .catch((error) => {
                    return enqueueSnackbar(
                      getAPIErrorOrDefault(
                        error,
                        `There was an issue ${stream.status === streamStatus.Active ? 'disabling' : 'enabling'} your stream`
                      )[0].reason,
                      {
                        variant: 'error',
                      }
                    );
                  });
              },
              title:
                stream.status === streamStatus.Active ? 'Disable' : 'Enable',
            },
            {
              onClick: () => {
                deleteStream({
                  id: stream.id,
                })
                  .then(() => {
                    return enqueueSnackbar(
                      `Stream  ${stream.label} deleted successfully`,
                      {
                        variant: 'success',
                      }
                    );
                  })
                  .catch((error) => {
                    return enqueueSnackbar(
                      getAPIErrorOrDefault(
                        error,
                        `There was an issue deleting your stream`
                      )[0].reason,
                      {
                        variant: 'error',
                      }
                    );
                  });
              },
              title: 'Delete',
            },
          ]}
          ariaLabel={`Action menu for ${stream.label} stream`}
        />
      </TableCell>
    </TableRow>
  );
});

const humanizeStreamStatus = (status: StreamStatus) => {
  switch (status) {
    case 'active':
      return 'Enabled';
    case 'inactive':
      return 'Disabled';
    default:
      return 'Unknown';
  }
};

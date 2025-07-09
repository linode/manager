import { Stack, Tooltip, Typography } from '@linode/ui';
import { getFormattedStatus } from '@linode/utilities';
import React from 'react';

import { LinearProgress } from 'src/components/LinearProgress';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { getEventMessage } from 'src/features/Events/utils';
import { useInProgressEvents } from 'src/queries/events/events';

import {
  LINODE_EVENT_TO_STATUS_MAP,
  LINODE_STATUS_TO_STATUS_ICON_MAP,
} from './LinodeStatus.utils';

import type { LinodeStatus as LinodeStatusType } from '@linode/api-v4';

interface Props {
  linodeId: number;
  linodeStatus: LinodeStatusType;
}

export const LinodeStatus = (props: Props) => {
  const { linodeId, linodeStatus } = props;
  const { data: events } = useInProgressEvents();

  const event = events?.find(
    (e) =>
      ((e.entity?.type === 'linode' && e.entity.id === linodeId) ||
        (e.secondary_entity?.type === 'linode' &&
          e.secondary_entity.id === linodeId)) &&
      e.percent_complete !== null &&
      e.percent_complete !== 100
  );

  const status = event
    ? (LINODE_EVENT_TO_STATUS_MAP[event.action] ?? linodeStatus)
    : linodeStatus;

  return (
    <Tooltip
      slotProps={{
        tooltip: {
          sx: { minWidth: 350 }
        },
      }}
      title={
        event ? (
          <Stack padding={1} spacing={1}>
            {getEventMessage(event)}
            {event.username && (
              <Typography
                sx={(theme) => ({ fontSize: theme.tokens.font.FontSize.Xxs })}
              >
                Started by {event.username}
              </Typography>
            )}
            {event.time_remaining && (
              <Typography>
                {event.time_remaining} remaining{' '}
                {event.rate && `at ${event.rate}`}
              </Typography>
            )}
            {event.percent_complete !== null && (
              <LinearProgress
                value={event.percent_complete}
                variant="determinate"
              />
            )}
          </Stack>
        ) : null
      }
    >
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
        sx={event ? { cursor: 'help' } : {}}
      >
        <StatusIcon status={LINODE_STATUS_TO_STATUS_ICON_MAP[status]} />
        <Typography>{getFormattedStatus(status)}</Typography>
        {event && event.percent_complete !== null && (
          <Typography>
            <i>({event.percent_complete}%)</i>
          </Typography>
        )}
      </Stack>
    </Tooltip>
  );
};

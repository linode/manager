import { type Event, EventActionKeys } from '@linode/api-v4';
import { Typography } from '@linode/ui';
import * as React from 'react';

import { eventFactory } from 'src/factories';
import { extraMockPresets } from 'src/mocks/presets';
import { setCustomEventsData } from 'src/mocks/presets/extra/account/customEvents';

import { saveCustomEventsData } from '../utils';
import { ExtraPresetList, ItemBox } from './ExtraPresetList';
import { JsonTextArea } from './JsonTextArea';

const EVENTS_PRESET_ID = 'events:custom' as const;

const eventsPreset = extraMockPresets.find((p) => p.id === EVENTS_PRESET_ID);

interface ExtraPresetEventsProps {
  customEventsData: Event[] | null | undefined;
  handlers: string[];
  onFormChange?: (data: Event[] | null | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
}

export const ExtraPresetEvents = ({
  customEventsData,
  handlers,
  onFormChange,
  onTogglePreset,
}: ExtraPresetEventsProps) => {
  if (!eventsPreset) return null;

  const isEnabled = handlers.includes(EVENTS_PRESET_ID);

  return (
    <ExtraPresetList
      customData={customEventsData}
      isEnabled={isEnabled}
      itemTemplates={eventTemplates}
      onFormChange={onFormChange}
      onTogglePreset={onTogglePreset}
      preset={eventsPreset}
      renderItemBox={({ item: event, index, onEdit, onDelete }) => (
        <EventBox
          editEvent={onEdit}
          event={event}
          id={String(index)}
          key={index}
          onDelete={onDelete}
        />
      )}
      saveDataToLocalStorage={saveCustomEventsData}
      setMSWData={setCustomEventsData}
    />
  );
};

interface EventBoxProps {
  editEvent: (updater: (prev: Event) => Event) => void;
  event: Event;
  id: string;
  onDelete: () => void;
}

const EventBox = (props: EventBoxProps) => {
  const { event, onDelete, editEvent, id } = props;

  return (
    <ItemBox
      editItem={editEvent}
      formFields={(onChange) => renderEventFields(event, onChange)}
      id={id}
      item={event}
      onDelete={onDelete}
      summary={
        <Typography noWrap variant="body2">
          <strong>ID</strong> {event.id} | <strong>Action</strong>{' '}
          {event.action} | <strong>Status</strong> {event.status} |{' '}
          <strong>Entity</strong> {event.entity?.label}
        </Typography>
      }
    />
  );
};

const renderEventFields = (
  event: Event,
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void
) => [
  <label key="action">
    Action
    <select
      className="dt-select"
      name="action"
      onChange={onChange}
      value={event.action}
    >
      {EventActionKeys.map((action) => (
        <option key={action} value={action}>
          {action}
        </option>
      ))}
    </select>
  </label>,

  <label key="status">
    Status
    <select
      className="dt-select"
      name="status"
      onChange={onChange}
      value={event.status}
    >
      <option value="failed">Failed</option>
      <option value="finished">Finished</option>
      <option value="notification">Notification</option>
      <option value="scheduled">Scheduled</option>
      <option value="started">Started</option>
    </select>
  </label>,

  <label key="message">
    Message
    <input
      name="message"
      onChange={onChange}
      type="text"
      value={event.message ?? ''}
    />
  </label>,

  <label key="id">
    ID
    <input name="id" onChange={onChange} type="number" value={event.id ?? ''} />
  </label>,

  <label key="username">
    Username
    <input
      name="username"
      onChange={onChange}
      type="text"
      value={event.username ?? ''}
    />
  </label>,

  <JsonTextArea
    height={100}
    key="entity"
    label="Entity"
    name="entity"
    onChange={onChange}
    value={event.entity}
  />,

  <JsonTextArea
    height={100}
    key="secondary_entity"
    label="Secondary Entity"
    name="secondary_entity"
    onChange={onChange}
    value={event.entity}
  />,

  <label key="read">
    Read
    <input
      checked={event.read}
      name="read"
      onChange={onChange}
      type="checkbox"
    />
  </label>,

  <label key="seen">
    Seen
    <input
      checked={event.seen}
      name="seen"
      onChange={onChange}
      type="checkbox"
    />
  </label>,

  <label key="percent_complete">
    Percent Complete
    <input
      name="percent_complete"
      onChange={onChange}
      type="number"
      value={event.percent_complete ?? ''}
    />
  </label>,

  <label key="rate">
    Rate
    <input
      name="rate"
      onChange={onChange}
      type="text"
      value={event.rate ?? ''}
    />
  </label>,

  <label key="created">
    Created
    <input
      name="created"
      onChange={onChange}
      type="datetime-local"
      value={event.created ?? ''}
    />
  </label>,

  <label key="time_remaining">
    Time Remaining
    <input
      name="time_remaining"
      onChange={onChange}
      type="text"
      value={event.time_remaining ?? ''}
    />
  </label>,

  <label key="duration">
    Duration
    <input
      name="duration"
      onChange={onChange}
      type="number"
      value={event.duration ?? ''}
    />
  </label>,
];

const eventTemplates = {
  Default: () => eventFactory.build(),

  'LKE Create': () =>
    eventFactory.build({
      action: 'lke_node_create',
      entity: {
        id: 1,
        label: 'linode-1',
        type: 'linode',
        url: 'https://google.com',
      },
      message:
        'Rebooting this thing and showing an extremely long event message for no discernible reason other than the fairly obvious reason that we want to do some testing of whether or not these messages wrap.',
      percent_complete: 15,
      secondary_entity: {
        id: 1,
        label: 'my config',
        type: 'linode',
        url: 'https://google.com',
      },
      status: 'notification',
    }),

  'DB Notification': () =>
    eventFactory.build({
      action: 'database_low_disk_space',
      entity: { id: 999, label: 'database-1', type: 'database' },
      message: 'Low disk space.',
      status: 'notification',
    }),

  'DB Migration': () =>
    eventFactory.build({
      action: 'database_migrate',
      entity: { id: 11, label: 'database-11', type: 'database' },
      message: 'Database migration started.',
      status: 'started',
    }),

  'DB Migration Finished': () =>
    eventFactory.build({
      action: 'database_migrate',
      entity: { id: 11, label: 'database-11', type: 'database' },
      message: 'Database migration finished.',
      status: 'finished',
    }),

  'Completed Event': () =>
    eventFactory.build({
      action: 'account_update',
      percent_complete: 100,
      seen: true,
    }),

  'Event with Special Characters': () =>
    eventFactory.build({
      action: 'ticket_update',
      entity: {
        id: 10,
        label: 'Ticket name with special characters... (?)',
        type: 'ticket',
      },
      message: 'Ticket name with special characters... (?)',
      percent_complete: 100,
      status: 'notification',
    }),

  'Placement Group Create Event': () =>
    eventFactory.build({
      action: 'placement_group_create',
      entity: { id: 999, label: 'PG-1', type: 'placement_group' },
      message: 'Placement Group successfully created.',
      percent_complete: 100,
      status: 'notification',
    }),

  'Placement Group Assigned Event': () =>
    eventFactory.build({
      action: 'placement_group_assign',
      entity: { id: 990, label: 'PG-2', type: 'placement_group' },
      message: 'Placement Group successfully assigned.',
      percent_complete: 100,
      secondary_entity: {
        id: 1,
        label: 'My Config',
        type: 'linode',
        url: '/v4/linode/instances/1/configs/1',
      },
      status: 'notification',
    }),
} as const;

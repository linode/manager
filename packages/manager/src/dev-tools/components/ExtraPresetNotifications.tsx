import { Typography } from '@linode/ui';
import * as React from 'react';

import { notificationFactory } from 'src/factories';
import { extraMockPresets } from 'src/mocks/presets';
import { setCustomNotificationsData } from 'src/mocks/presets/extra/account/customNotifications';

import { saveCustomNotificationsData } from '../utils';
import { ExtraPresetList, ItemBox } from './ExtraPresetList';
import { JsonTextArea } from './JsonTextArea';

import type { Notification } from '@linode/api-v4';

const notificationsPreset = extraMockPresets.find(
  (p) => p.id === 'notifications:custom'
);

interface ExtraPresetNotificationsProps {
  customNotificationsData: Notification[] | null | undefined;
  handlers: string[];
  onFormChange?: (data: Notification[] | null | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
}

export const ExtraPresetNotifications = ({
  customNotificationsData,
  handlers,
  onFormChange,
  onTogglePreset,
}: ExtraPresetNotificationsProps) => {
  if (!notificationsPreset) return null;

  const isEnabled = handlers.includes('notifications:custom');

  return (
    <ExtraPresetList
      customData={customNotificationsData}
      isEnabled={isEnabled}
      itemTemplates={notificationTemplates}
      onFormChange={onFormChange}
      onTogglePreset={onTogglePreset}
      preset={notificationsPreset}
      renderItemBox={({ item: notification, index, onEdit, onDelete }) => (
        <NotificationBox
          editNotification={onEdit}
          id={String(index)}
          key={index}
          notification={notification}
          onDelete={onDelete}
        />
      )}
      saveDataToLocalStorage={saveCustomNotificationsData}
      setMSWData={setCustomNotificationsData}
    />
  );
};

interface NotificationBoxProps {
  editNotification: (updater: (prev: Notification) => Notification) => void;
  id: string;
  notification: Notification;
  onDelete: () => void;
}

const NotificationBox = (props: NotificationBoxProps) => {
  const { notification, onDelete, editNotification, id } = props;

  return (
    <ItemBox
      editItem={editNotification}
      formFields={(onChange) =>
        renderNotificationFields(notification, onChange)
      }
      id={id}
      item={notification}
      onDelete={onDelete}
      summary={
        <Typography noWrap variant="body2">
          <strong>Entity</strong> {notification.entity?.label} |{' '}
          <strong>Label</strong> {notification.label} | <strong>Type</strong>{' '}
          {notification.type}
        </Typography>
      }
    />
  );
};

const renderNotificationFields = (
  notification: Notification,
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void
) => [
  <label key="label">
    Label
    <input
      name="label"
      onChange={onChange}
      type="text"
      value={notification.label ?? ''}
    />
  </label>,
  <label key="message">
    Message
    <input
      name="message"
      onChange={onChange}
      type="text"
      value={notification.message ?? ''}
    />
  </label>,
  <label key="body">
    Body
    <input
      name="body"
      onChange={onChange}
      type="text"
      value={notification.body ?? ''}
    />
  </label>,
  <JsonTextArea
    height={100}
    key="entity"
    label="Entity"
    name="entity"
    onChange={onChange}
    value={notification.entity}
  />,
  <label key="severity">
    Severity
    <select
      className="dt-select"
      name="severity"
      onChange={onChange}
      value={notification.severity}
    >
      <option value="minor">Minor</option>
      <option value="major">Major</option>
      <option value="critical">Critical</option>
    </select>
  </label>,
  <label key="type">
    Type
    <select
      className="dt-select"
      name="type"
      onChange={onChange}
      value={notification.type}
    >
      {[
        'billing_email_bounce',
        'maintenance',
        'maintenance_scheduled',
        'migration_pending',
        'migration_scheduled',
        'notice',
        'outage',
        'payment_due',
        'promotion',
        'reboot_scheduled',
        'security_reboot_maintenance_scheduled',
        'tax_id_verifying',
        'ticket_abuse',
        'ticket_important',
        'user_email_bounce',
        'volume_migration_imminent',
        'volume_migration_scheduled',
      ].map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </label>,
  <label key="until">
    Until
    <input
      name="until"
      onChange={onChange}
      type="datetime-local"
      value={notification.until ?? ''}
    />
  </label>,
  <label key="when">
    When
    <input
      name="when"
      onChange={onChange}
      type="datetime-local"
      value={notification.when ?? ''}
    />
  </label>,
];

const notificationTemplates = {
  Default: () => notificationFactory.build(),
  'Migration Notification': () =>
    notificationFactory.build({
      entity: { id: 0, label: 'linode-0', type: 'linode' },
      label: 'You have a migration pending!',
      message:
        'You have a migration pending! Your Linode must be offline before starting the migration.',
      severity: 'major',
      type: 'migration_pending',
    }),
  'Minor Severity Notification': () =>
    notificationFactory.build({
      message: 'Testing for minor notification',
      severity: 'minor',
      type: 'notice',
    }),
  'Critical Severity Notification': () =>
    notificationFactory.build({
      message: 'Testing for critical notification',
      severity: 'critical',
      type: 'notice',
    }),
  'Balance Notification': () =>
    notificationFactory.build({
      message: 'You have an overdue balance!',
      severity: 'major',
      type: 'payment_due',
    }),
  'Block Storage Migration Scheduled Notification': () =>
    notificationFactory.build({
      body: 'Your volumes in us-east will be upgraded to NVMe.',
      entity: {
        id: 20,
        label: 'eligibleNow',
        type: 'volume',
        url: '/volumes/20',
      },
      label: 'You have a scheduled Block Storage volume upgrade pending!',
      message:
        'The Linode that the volume is attached to will shut down in order to complete the upgrade and reboot once it is complete. Any other volumes attached to the same Linode will also be upgraded.',
      severity: 'critical',
      type: 'volume_migration_scheduled',
      until: '2021-10-16T04:00:00',
      when: '2021-09-30T04:00:00',
    }),
} as const;

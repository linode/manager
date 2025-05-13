import { DndContext } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, Stack, Typography } from '@linode/ui';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import * as React from 'react';

import { notificationFactory } from 'src/factories';
import { extraMockPresets } from 'src/mocks/presets';
import { setCustomNotificationsData } from 'src/mocks/presets/extra/account/customNotifications';
import { setCustomProfileData } from 'src/mocks/presets/extra/account/customProfile';

import { saveCustomNotificationsData } from '../utils';
import { JsonTextArea } from './JsonTextArea';

import type { DragEndEvent } from '@dnd-kit/core';
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
  const isEnabled = handlers.includes('notifications:custom');
  const [formData, setFormData] = React.useState<Notification[]>(
    customNotificationsData ?? []
  );
  const [isEditingCustomNotifications, setIsEditingCustomNotifications] =
    React.useState(false);

  const [selectedTemplate, setSelectedTemplate] = React.useState<string>();

  const handleInputChange = React.useCallback(
    (updatedNotifications: Notification[]) => {
      setFormData(updatedNotifications);
      if (isEnabled) {
        onFormChange?.(updatedNotifications);
      }
    },
    [isEnabled, onFormChange]
  );

  const handleTogglePreset = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.checked) {
        saveCustomNotificationsData(null);
      } else {
        saveCustomNotificationsData(formData);
      }
      onTogglePreset(e, 'notifications:custom');
    },
    [formData, onTogglePreset]
  );

  const handleAddNotification = React.useCallback(() => {
    const templateBuilder =
      selectedTemplate && notificationTemplates[selectedTemplate];
    const newNotification = templateBuilder
      ? templateBuilder()
      : notificationFactory.build();
    handleInputChange([newNotification, ...formData]);
  }, [formData, handleInputChange, selectedTemplate]);

  const handleMoveNotification = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active && over && active.id !== over.id) {
        handleInputChange(
          arrayMove(formData, Number(active.id), Number(over.id))
        );
      }
    },
    [formData, handleInputChange]
  );

  React.useEffect(() => {
    if (!isEnabled) {
      setFormData([]);
      setCustomProfileData(null);
    } else if (isEnabled && customNotificationsData) {
      setFormData(customNotificationsData);
      setCustomNotificationsData(customNotificationsData);
    }
  }, [isEnabled, customNotificationsData]);

  if (!notificationsPreset) {
    return null;
  }

  return (
    <li className="dev-tools__list-box__separator has-button">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <label title={notificationsPreset.desc || notificationsPreset.label}>
            <input
              checked={isEnabled}
              onChange={handleTogglePreset}
              type="checkbox"
            />
            {notificationsPreset.label}
          </label>
        </div>
        {isEnabled && (
          <div>
            <button
              className="dev-tools-button small"
              onClick={() => setIsEditingCustomNotifications(true)}
            >
              edit
            </button>
          </div>
        )}
      </div>
      {isEnabled && isEditingCustomNotifications && (
        <Dialog
          fullWidth
          onClose={() => setIsEditingCustomNotifications(false)}
          open={isEditingCustomNotifications}
          title="Edit Custom Notifications"
        >
          <h3>
            {formData.length} custom notification{formData.length !== 1 && 's'}
          </h3>

          <Stack gap={1}>
            <div className="dev-tools__modal-form dev-tools__modal__rectangle-group">
              <FieldWrapper>
                <label>
                  Add from template
                  <select
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    value={selectedTemplate}
                  >
                    {Object.keys(notificationTemplates).map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </FieldWrapper>
              <button
                onClick={handleAddNotification}
                style={{ marginBottom: 10 }}
              >
                + Add New Notification
              </button>
            </div>

            <DndContext onDragEnd={handleMoveNotification}>
              <div
                style={{
                  height: '50vh',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <SortableContext
                  items={formData.map((_, index) => String(index))} // we have to use a string bc Sortable doesn't like id=0
                  strategy={verticalListSortingStrategy}
                >
                  {formData.map((notification, index) => (
                    <NotificationBox
                      editNotification={(updater) =>
                        handleInputChange(
                          formData.map((notification, i) =>
                            i === index ? updater(notification) : notification
                          )
                        )
                      }
                      id={String(index)}
                      key={index}
                      notification={notification}
                      onDelete={() =>
                        handleInputChange(
                          formData.filter((_, i) => i !== index)
                        )
                      }
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
            <div>
              <button onClick={() => setIsEditingCustomNotifications(false)}>
                Done
              </button>
            </div>
          </Stack>
        </Dialog>
      )}
    </li>
  );
};

const FieldWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="dev-tools__modal-form__field">{children}</div>;
};

interface NotificationBoxProps {
  editNotification: (updater: (prev: Notification) => Notification) => void;
  id: string;
  notification: Notification;
  onDelete: () => void;
}

const NotificationBox = (props: NotificationBoxProps) => {
  const { notification, onDelete, editNotification, id } = props;

  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const {
    active,
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const isActive = Boolean(active);

  // dnd-kit styles
  const dndStyles = {
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: isActive ? transition : 'none',
    zIndex: isDragging ? 9999 : 0,
  } as const;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    editNotification((prev) => ({
      ...prev,
      [name]: value || null,
    }));
  };

  return (
    <div
      className="dev-tools__modal__rectangle-group"
      ref={setNodeRef}
      style={dndStyles}
    >
      <div className="dev-tools__modal__controls">
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <DragIndicatorIcon
            {...listeners}
            {...attributes}
            style={{ cursor: isActive ? 'grabbing' : 'grab' }}
          />
          <div>
            <button onClick={() => setIsCollapsed((prev) => !prev)}>
              {isCollapsed ? '► Expand' : '▼ Collapse'}
            </button>
          </div>
          {isCollapsed && (
            <Typography noWrap variant="body2">
              <strong>Entity</strong> {notification.entity?.label} |{' '}
              <strong>Label</strong> {notification.label} |{' '}
              <strong>Type</strong> {notification.type}
            </Typography>
          )}
        </div>
        <div>
          <button onClick={onDelete}>Delete</button>
        </div>
      </div>
      {!isCollapsed && (
        <form className="dev-tools__modal-form">
          <FieldWrapper>
            <label>
              Body
              <input
                name="body"
                onChange={handleInputChange}
                type="text"
                value={notification.body ?? ''}
              />
            </label>
          </FieldWrapper>
          <FieldWrapper>
            <JsonTextArea
              height={100}
              label="Entity"
              name="entity"
              onChange={handleInputChange}
              value={notification.entity}
            />
          </FieldWrapper>
          <FieldWrapper>
            <label>
              Label
              <input
                name="label"
                onChange={handleInputChange}
                type="text"
                value={notification.label ?? ''}
              />
            </label>
          </FieldWrapper>
          <FieldWrapper>
            <label>
              Message
              <input
                name="message"
                onChange={handleInputChange}
                type="text"
                value={notification.message ?? ''}
              />
            </label>
          </FieldWrapper>
          <FieldWrapper>
            <label>
              Severity
              <select
                className="dt-select"
                name="severity"
                onChange={handleInputChange}
                value={notification.severity}
              >
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </label>
          </FieldWrapper>
          <FieldWrapper>
            <label>
              Type
              <select
                className="dt-select"
                name="type"
                onChange={handleInputChange}
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
            </label>
          </FieldWrapper>
          <FieldWrapper>
            <label>
              Until
              <input
                name="until"
                onChange={handleInputChange}
                type="datetime-local"
                value={notification.until ?? ''}
              />
            </label>
          </FieldWrapper>
          <FieldWrapper>
            <label>
              When
              <input
                name="when"
                onChange={handleInputChange}
                type="datetime-local"
                value={notification.when ?? ''}
              />
            </label>
          </FieldWrapper>
        </form>
      )}
    </div>
  );
};

const notificationTemplates: Record<string, () => Notification> = {
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
};

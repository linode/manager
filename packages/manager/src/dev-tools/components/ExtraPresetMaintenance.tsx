import { Typography } from '@linode/ui';
import * as React from 'react';

import { accountMaintenanceFactory } from 'src/factories';
import { extraMockPresets } from 'src/mocks/presets';
import { setCustomMaintenanceData } from 'src/mocks/presets/extra/account/customMaintenance';

import { saveCustomMaintenanceData } from '../utils';
import { ExtraPresetList, ItemBox } from './ExtraPresetList';
import { JsonTextArea } from './JsonTextArea';

import type { AccountMaintenance } from '@linode/api-v4';

const MAINTENANCE_PRESET_ID = 'maintenance:custom' as const;

const maintenancePreset = extraMockPresets.find(
  (p) => p.id === MAINTENANCE_PRESET_ID
);

interface ExtraPresetMaintenanceProps {
  customMaintenanceData: AccountMaintenance[] | null | undefined;
  handlers: string[];
  onFormChange?: (data: AccountMaintenance[] | null | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
}

export const ExtraPresetMaintenance = ({
  customMaintenanceData,
  handlers,
  onFormChange,
  onTogglePreset,
}: ExtraPresetMaintenanceProps) => {
  if (!maintenancePreset) return null;

  const isEnabled = handlers.includes(MAINTENANCE_PRESET_ID);

  return (
    <ExtraPresetList
      customData={customMaintenanceData}
      isEnabled={isEnabled}
      itemTemplates={maintenanceTemplates}
      onFormChange={onFormChange}
      onTogglePreset={onTogglePreset}
      preset={maintenancePreset}
      renderItemBox={({ item: maintenance, index, onEdit, onDelete }) => (
        <MaintenanceBox
          editMaintenance={onEdit}
          id={String(index)}
          key={index}
          maintenance={maintenance}
          onDelete={onDelete}
        />
      )}
      saveDataToLocalStorage={saveCustomMaintenanceData}
      setMSWData={setCustomMaintenanceData}
    />
  );
};

interface MaintenanceBoxProps {
  editMaintenance: (
    updater: (prev: AccountMaintenance) => AccountMaintenance
  ) => void;
  id: string;
  maintenance: AccountMaintenance;
  onDelete: () => void;
}

const MaintenanceBox = (props: MaintenanceBoxProps) => {
  const { maintenance, onDelete, editMaintenance, id } = props;

  return (
    <ItemBox
      editItem={editMaintenance}
      formFields={(onChange) => renderMaintenanceFields(maintenance, onChange)}
      id={id}
      item={maintenance}
      onDelete={onDelete}
      summary={
        <Typography noWrap variant="body2">
          <strong>Entity</strong> {maintenance.entity?.label} |{' '}
          <strong>Type</strong> {maintenance.type} | <strong>Status</strong>{' '}
          {maintenance.status} | <strong>Reason</strong> {maintenance.reason}
        </Typography>
      }
    />
  );
};

const renderMaintenanceFields = (
  maintenance: AccountMaintenance,
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void
) => [
  <label key="type">
    Type
    <select
      className="dt-select"
      name="type"
      onChange={onChange}
      value={maintenance.type}
    >
      <option value="reboot">Reboot</option>
      <option value="cold_migration">Cold Migration</option>
      <option value="live_migration">Live Migration</option>
    </select>
  </label>,

  <label key="reason">
    Reason
    <input
      name="reason"
      onChange={onChange}
      type="text"
      value={maintenance.reason ?? ''}
    />
  </label>,

  <label key="status">
    Status
    <select
      className="dt-select"
      name="status"
      onChange={onChange}
      value={maintenance.status}
    >
      <option value="completed">Completed</option>
      <option value="pending">Pending</option>
      <option value="started">Started</option>
    </select>
  </label>,

  <JsonTextArea
    height={100}
    key="entity"
    label="Entity"
    name="entity"
    onChange={onChange}
    value={maintenance.entity}
  />,

  <label key="when">
    When
    <input
      name="when"
      onChange={onChange}
      type="datetime-local"
      value={maintenance.when ?? ''}
    />
  </label>,
];

const maintenanceTemplates = {
  Default: () => accountMaintenanceFactory.build(),
  Completed: () => accountMaintenanceFactory.build({ status: 'completed' }),
  Pending: () => accountMaintenanceFactory.build({ status: 'pending' }),
  Started: () => accountMaintenanceFactory.build({ status: 'started' }),
} as const;

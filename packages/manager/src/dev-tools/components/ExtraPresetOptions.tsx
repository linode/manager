import * as React from 'react';

import { getMockPresetGroups } from 'src/mocks/mockPreset';
import { extraMockPresets } from 'src/mocks/presets';

import { ExtraPresetAccount } from './ExtraPresetAccount';
import { ExtraPresetEvents } from './ExtraPresetEvents';
import { ExtraPresetMaintenance } from './ExtraPresetMaintenance';
import { ExtraPresetNotifications } from './ExtraPresetNotifications';
import { ExtraPresetOptionCheckbox } from './ExtraPresetOptionCheckbox';
import { ExtraPresetOptionSelect } from './ExtraPresetOptionSelect';
import { ExtraPresetProfile } from './ExtraPresetProfile';

import type {
  Account,
  AccountMaintenance,
  Event,
  Notification,
  Profile,
} from '@linode/api-v4';

export interface ExtraPresetOptionsProps {
  customAccountData?: Account | null;
  customEventsData?: Event[] | null;
  customMaintenanceData?: AccountMaintenance[] | null;
  customNotificationsData?: Notification[] | null;
  customProfileData?: null | Profile;
  handlers: string[];
  onCustomAccountChange?: (data: Account | null | undefined) => void;
  onCustomEventsChange?: (data: Event[] | null | undefined) => void;
  onCustomMaintenanceChange?: (
    data: AccountMaintenance[] | null | undefined
  ) => void;
  onCustomNotificationsChange?: (
    data: Notification[] | null | undefined
  ) => void;
  onCustomProfileChange?: (data: null | Profile | undefined) => void;
  onPresetCountChange: (e: React.ChangeEvent, presetId: string) => void;
  onSelectChange: (e: React.ChangeEvent, presetId: string) => void;
  onTogglePreset: (e: React.ChangeEvent, presetId: string) => void;
  presetsCountMap: { [key: string]: number };
}

/**
 * Renders a list of extra presets with an optional count.
 */
export const ExtraPresetOptions = ({
  customAccountData,
  customProfileData,
  customEventsData,
  customMaintenanceData,
  customNotificationsData,
  handlers,
  onCustomAccountChange,
  onCustomProfileChange,
  onCustomEventsChange,
  onCustomMaintenanceChange,
  onCustomNotificationsChange,
  onPresetCountChange,
  onSelectChange,
  onTogglePreset,
  presetsCountMap,
}: ExtraPresetOptionsProps) => {
  const extraPresetGroups = getMockPresetGroups(extraMockPresets);

  return (
    <ul>
      {extraPresetGroups.map((group) => {
        const currentGroupType = extraMockPresets.find(
          (p) => p.group.id === group
        )?.group.type;

        const selectGroup = currentGroupType === 'select';

        return (
          <div key={group}>
            <li
              className={selectGroup ? 'dev-tools__list-box__separator' : ''}
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <strong>{group}</strong>{' '}
              {currentGroupType === 'select' && (
                <ExtraPresetOptionSelect
                  group={group}
                  handlers={handlers}
                  onSelectChange={onSelectChange}
                  presetsCountMap={presetsCountMap}
                />
              )}
            </li>
            {currentGroupType === 'checkbox' && (
              <ExtraPresetOptionCheckbox
                group={group}
                handlers={handlers}
                onPresetCountChange={onPresetCountChange}
                onTogglePreset={onTogglePreset}
                presetsCountMap={presetsCountMap}
              />
            )}
            {currentGroupType === 'account' && (
              <ExtraPresetAccount
                customAccountData={customAccountData}
                handlers={handlers}
                onFormChange={onCustomAccountChange}
                onTogglePreset={onTogglePreset}
              />
            )}
            {currentGroupType === 'profile' && (
              <ExtraPresetProfile
                customProfileData={customProfileData}
                handlers={handlers}
                onFormChange={onCustomProfileChange}
                onTogglePreset={onTogglePreset}
              />
            )}
            {currentGroupType === 'events' && (
              <ExtraPresetEvents
                customEventsData={customEventsData}
                handlers={handlers}
                onFormChange={onCustomEventsChange}
                onTogglePreset={onTogglePreset}
              />
            )}
            {currentGroupType === 'maintenance' && (
              <ExtraPresetMaintenance
                customMaintenanceData={customMaintenanceData}
                handlers={handlers}
                onFormChange={onCustomMaintenanceChange}
                onTogglePreset={onTogglePreset}
              />
            )}
            {currentGroupType === 'notifications' && (
              <ExtraPresetNotifications
                customNotificationsData={customNotificationsData}
                handlers={handlers}
                onFormChange={onCustomNotificationsChange}
                onTogglePreset={onTogglePreset}
              />
            )}
          </div>
        );
      })}
    </ul>
  );
};

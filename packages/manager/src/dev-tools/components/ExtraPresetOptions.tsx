import * as React from 'react';

import { getMockPresetGroups } from 'src/mocks/mockPreset';
import { extraMockPresets } from 'src/mocks/presets';

import { ExtraPresetOptionCheckbox } from './ExtraPresetOptionCheckbox';
import { ExtraPresetOptionSelect } from './ExtraPresetOptionSelect';

export interface ExtraPresetOptionsProps {
  disabled: boolean;
  handlers: string[];
  onPresetCountChange: (e: React.ChangeEvent, presetId: string) => void;
  onSelectChange: (e: React.ChangeEvent, presetId: string) => void;
  onTogglePreset: (e: React.ChangeEvent, presetId: string) => void;
  presetsCountMap: { [key: string]: number };
}

/**
 * Renders a list of extra presets with an optional count.
 */
export const ExtraPresetOptions = ({
  disabled,
  handlers,
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
                  disabled={disabled}
                  group={group}
                  handlers={handlers}
                  onSelectChange={onSelectChange}
                  presetsCountMap={presetsCountMap}
                />
              )}
            </li>
            {currentGroupType === 'checkbox' && (
              <ExtraPresetOptionCheckbox
                disabled={disabled}
                group={group}
                handlers={handlers}
                onPresetCountChange={onPresetCountChange}
                onTogglePreset={onTogglePreset}
                presetsCountMap={presetsCountMap}
              />
            )}
          </div>
        );
      })}
    </ul>
  );
};
